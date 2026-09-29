#!/usr/bin/env python3
"""Verify raw transaction hashes; keep hash-proven permission-field repairs separate."""
import argparse,collections,hashlib,json,sqlite3
from pathlib import Path
from collect_energy_rental import ROOT,canonical,dump,utc

def varint(value):
    output=bytearray()
    while value>127:output.append((value&127)|128);value>>=7
    output.append(value);return bytes(output)
def read_varint(data,pos):
    value=shift=0
    while pos<len(data) and shift<70:
        byte=data[pos];pos+=1;value|=(byte&127)<<shift
        if byte<128:return value,pos
        shift+=7
    raise ValueError('Invalid protobuf varint')
def fields(data):
    pos=0;result=[]
    while pos<len(data):
        start=pos;tag,pos=read_varint(data,pos);kind=tag&7;number=tag>>3
        if kind==0:value,pos=read_varint(data,pos)
        elif kind in (1,5):
            length=8 if kind==1 else 4;value=data[pos:pos+length];pos+=length
        elif kind==2:
            length,pos=read_varint(data,pos);value=data[pos:pos+length];pos+=length
        else:raise ValueError('Unsupported protobuf wire type')
        if pos>len(data):raise ValueError('Truncated protobuf field')
        result.append((number,kind,value,data[start:pos]))
    return result

def restore_permission(raw_hex,permission):
    # protocol.Transaction.raw.contract = field 11.
    # protocol.Transaction.Contract.Permission_id = field 5.
    output=[];replaced=0
    for number,kind,value,original in fields(bytes.fromhex(raw_hex)):
        if number==11 and kind==2:
            if any(f[0]==5 for f in fields(value)):return None
            value=value+varint((5<<3)|0)+varint(permission)
            output.append(varint((11<<3)|2)+varint(len(value))+value);replaced+=1
        else:output.append(original)
    return b''.join(output).hex() if replaced==1 else None

def verify(root):
    root=Path(root);db=sqlite3.connect(root/'research.sqlite3');checked=matched=0;restored=[];unresolved=[];counts=collections.Counter()
    for stream,serialized in db.execute("SELECT stream,payload FROM items WHERE stream LIKE '%/transactions'"):
        row=json.loads(serialized);checked+=1;txid=row['txID'];raw=row.get('raw_data_hex','')
        if raw and hashlib.sha256(bytes.fromhex(raw)).hexdigest()==txid:matched+=1;continue
        contract=row.get('raw_data',{}).get('contract',[{}])[0];found=False
        if raw and contract.get('type') in ('DelegateResourceContract','UnDelegateResourceContract') and 'Permission_id' not in contract:
            for permission in range(1,33):
                candidate=restore_permission(raw,permission)
                if candidate and hashlib.sha256(bytes.fromhex(candidate)).hexdigest()==txid:
                    restored.append({'wallet':stream.split('/')[0],'transaction_id':txid,'restored_permission_id':permission,'raw_data_hex':candidate,'hash_matches_transaction_id':True,'method':'Restore protobuf Contract.Permission_id; accept only exact SHA-256 equality with transaction ID. Original indexed response preserved.'})
                    counts[permission]+=1;found=True;break
        if not found:unresolved.append({'wallet':stream.split('/')[0],'transaction_id':txid,'type':contract.get('type'),'issue':'raw_data_hex hash mismatch or missing; requires node verification'})
    quality=root/'quality';quality.mkdir(exist_ok=True)
    with (quality/'permission_id_corrections.jsonl').open('w') as f:
        for item in restored:f.write(canonical(item)+'\n')
    report={'verified_at':utc(),'transaction_observations_checked':checked,'original_raw_hash_matches':matched,'permission_id_restored_and_hash_verified':len(restored),'restored_permission_ids':dict(counts),'unresolved_count':len(unresolved),'unresolved':unresolved,'schema_source':'https://raw.githubusercontent.com/tronprotocol/protocol/master/core/Tron.proto','interpretation':'TronGrid indexed DelegateResource/UnDelegateResource records omit Permission_id in some responses. Two saved full-node examples confirm the omission. Repairs are separate derived records and accepted only when the reconstructed bytes hash to the returned transaction ID. This verifies data consistency, not account ownership or transaction signatures.'}
    dump(quality/'verification.json',report);db.close();print(canonical({k:v for k,v in report.items() if k not in ['unresolved','interpretation']}));return report
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--data-dir',type=Path,default=ROOT/'data/energy-rental');a=p.parse_args();r=verify(a.data_dir)
    if r['unresolved_count']:raise SystemExit(1)
