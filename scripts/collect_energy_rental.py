#!/usr/bin/env python3
"""Read-only TRON research collector. Stdlib only; raw replies + SQLite + checkpoints."""
import argparse, collections, datetime as dt, gzip, hashlib, json, os
from pathlib import Path
import sqlite3, time, urllib.request, urllib.parse, urllib.error

ROOT=Path(__file__).resolve().parents[1]
CONTRACT='TU2MJ5Veik1LRAgjeSzEdvmDYx7mefJZvd'
API='https://api.trongrid.io'
DAY=86400000
ALPHABET='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
def utc(ms=None):
    return dt.datetime.fromtimestamp(ms/1000,dt.timezone.utc).isoformat() if ms is not None else dt.datetime.now(dt.timezone.utc).isoformat()
def address(value):
    if not value: return None
    if value.startswith('T'): return value
    value=value.removeprefix('0x')
    if len(value)==40: value='41'+value
    if len(value)!=42 or not value.startswith('41'): raise ValueError('Invalid TRON address format')
    b=bytes.fromhex(value); b+=hashlib.sha256(hashlib.sha256(b).digest()).digest()[:4]
    n=int.from_bytes(b,'big'); out=''
    while n: n,r=divmod(n,58);out=ALPHABET[r]+out
    return '1'*(len(b)-len(b.lstrip(b'\0')))+out


# keccak256 of the canonical Liquidate event signature in the official reference.
LIQUIDATE_TOPIC='b0dbe18c6ffdf0da655dd690e77211d379205c497be44c64447c3f5f021b5167'
def verify_event_receipt(event,receipt):
    if receipt.get('id') != event['transaction_id'] or receipt.get('blockNumber') != event['block_number']:
        raise ValueError('Receipt identity/block mismatch')
    if receipt.get('receipt',{}).get('result') != 'SUCCESS':
        raise ValueError('Unsuccessful receipt')
    result=event['result']
    matches=[]
    for log in receipt.get('log',[]):
        topics=log.get('topics',[])
        if address(log.get('address')) != CONTRACT or len(topics)!=4 or topics[0]!=LIQUIDATE_TOPIC:
            continue
        if any(address(topics[i+1][-40:])!=address(result[name]) for i,name in enumerate(['liquidator','renter','receiver'])):
            continue
        raw=log.get('data','')
        if len(raw)!=5*64:continue
        values=[int(raw[i:i+64],16) for i in range(0,len(raw),64)]
        expected=[int(result[name]) for name in ['amount','resourceType','usageRental','liquidateFee','sendBack']]
        if values==expected:matches.append(log)
    if not matches:raise ValueError('Decoded event not present in raw successful receipt logs')
    return True

def dump(path,value):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    temporary=path.with_suffix(path.suffix+'.tmp')
    temporary.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    temporary.replace(path)

def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False)

class Collector:
    def __init__(self,root):
        self.root=Path(root);self.root.mkdir(parents=True,exist_ok=True)
        self.run=dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        self.out=self.root/'runs'/self.run;self.out.mkdir(parents=True)
        self.db=sqlite3.connect(self.root/'research.sqlite3')
        self.db.executescript('''
        CREATE TABLE IF NOT EXISTS items(stream TEXT,item_id TEXT,timestamp INTEGER,payload TEXT,first_run TEXT,last_run TEXT,PRIMARY KEY(stream,item_id));
        CREATE INDEX IF NOT EXISTS item_time ON items(stream,timestamp);
        CREATE TABLE IF NOT EXISTS checkpoints(stream TEXT PRIMARY KEY, through_ms INTEGER);
        CREATE TABLE IF NOT EXISTS coverage(run TEXT,stream TEXT,start_ms INTEGER,end_ms INTEGER,status TEXT,pages INTEGER,rows INTEGER,new_rows INTEGER,detail TEXT,PRIMARY KEY(run,stream));
        ''')
        self.count=0;self.last_request=0;self.errors=[];self.changes={}
        self.key=os.environ.get('TRONGRID_API_KEY') or os.environ.get('TRON_PRO_API_KEY')
    def request(self,path,params=None,body=None):
        url=path if path.startswith('https://') else API+path
        if params:url+='?'+urllib.parse.urlencode(params)
        if urllib.parse.urlparse(url).hostname not in ('api.trongrid.io','docs.justlend.org'):
            raise ValueError('Unapproved data host')
        headers={'User-Agent':'ProtocolAlphaFinder/0.1 research','Accept':'application/json'}
        if self.key and url.startswith(API):headers['TRON-PRO-API-KEY']=self.key
        if body is not None:headers['Content-Type']='application/json'
        for attempt in range(4):
            time.sleep(max(0,3.1-(time.monotonic()-self.last_request)))
            self.last_request=time.monotonic();self.count+=1
            try:
                request=urllib.request.Request(url,data=json.dumps(body).encode() if body is not None else None,headers=headers)
                with urllib.request.urlopen(request,timeout=40) as response:raw=response.read();status=response.status
                payload=json.loads(raw)
                envelope={'url':url,'request_body':body,'fetched_at':utc(),'http_status':status,'sha256':hashlib.sha256(raw).hexdigest(),'payload_canonical_sha256':hashlib.sha256(canonical(payload).encode()).hexdigest(),'response':payload}
                with gzip.open(self.out/f'{self.count:05d}.json.gz','wt') as f:json.dump(envelope,f,ensure_ascii=False)
                if payload.get('success') is False or payload.get('Error') or payload.get('error'):
                    raise RuntimeError(str(payload)[:300])
                return payload
            except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError,RuntimeError) as exc:
                status=getattr(exc,'code',None)
                entry={'url':url,'request_body':body,'time':utc(),'attempt':attempt+1,'error':str(exc),'status':status}
                with (self.out/'request_errors.jsonl').open('a') as f:f.write(canonical(entry)+'\n')
                if status in (400,401,404) or attempt==3:raise
                time.sleep(min(45,15*2**attempt))
    def put(self,stream,row,key=None):
        timestamp=row.get('block_timestamp',row.get('timestamp',row.get('blockTimeStamp',0)))
        key=key or row.get('txID') or row.get('transaction_id') or hashlib.sha256(canonical(row).encode()).hexdigest()
        old=self.db.execute('SELECT 1 FROM items WHERE stream=? AND item_id=?',(stream,key)).fetchone()
        self.db.execute('INSERT INTO items VALUES(?,?,?,?,?,?) ON CONFLICT(stream,item_id) DO UPDATE SET payload=excluded.payload,last_run=excluded.last_run',(stream,key,timestamp,canonical(row),self.run,self.run))
        return old is None
    def rows(self,stream):
        return [json.loads(x[0]) for x in self.db.execute('SELECT payload FROM items WHERE stream=? ORDER BY timestamp DESC',(stream,))]
    def scan(self,stream,path,start,end,extra=None,max_pages=100,resume_url=None):
        params={'only_confirmed':'true','limit':200,'order_by':'block_timestamp,desc','min_timestamp':start,'max_timestamp':end}
        params.update(extra or {});seen=set();occurrences=collections.Counter();count=new=pages=0;status='partial';detail={};url=resume_url
        if resume_url:
            for key, in self.db.execute('SELECT item_id FROM items WHERE stream=? AND timestamp BETWEEN ? AND ?',(stream,start,end)):
                base,sep,n=key.rpartition(':')
                if sep and n.isdigit():occurrences[base]=max(occurrences[base],int(n))
        try:
            for page in range(max_pages):
                payload=self.request(url or path,None if url else params)
                rows=payload.get('data');assert isinstance(rows,list),'Missing data array'
                pages+=1
                for row in rows:
                    ts=row.get('block_timestamp',row.get('timestamp',row.get('blockTimeStamp',0)))
                    if ts and not start<=ts<=end:raise ValueError('API returned a row outside requested time window')
                    if stream=='seed_events':key=f"{row['transaction_id']}:{row['event_index']}"
                    elif stream.endswith('/transactions'):key=row['txID']
                    else:
                        # Preserve multiple identical transfers in a single transaction by occurrence.
                        key=hashlib.sha256(canonical(row).encode()).hexdigest();occurrences[key]+=1;key+=f':{occurrences[key]}'
                    new+=int(self.put(stream,row,key));count+=1
                self.db.commit()
                nxt=payload.get('meta',{}).get('links',{}).get('next')
                self.db.execute('INSERT OR REPLACE INTO coverage VALUES(?,?,?,?,?,?,?,?,?)',(self.run,stream,start,end,'partial',pages,count,new,canonical({'reason':'in_progress','next_url':nxt})))
                self.db.commit()
                print(f'{stream}: page {pages}, {count} rows',flush=True)
                if not nxt or not rows:
                    status='complete';break
                if nxt in seen:raise ValueError('Repeated pagination cursor')
                seen.add(nxt);url=nxt
            else:detail={'reason':'page_limit','next_url':url}
        except Exception as exc:
            detail={'error':str(exc),'next_url':url};self.errors.append({'stream':stream,**detail});print('SCAN ERROR',stream,str(exc),flush=True)
        if status!='complete' and not any(x.get('stream')==stream for x in self.errors):self.errors.append({'stream':stream,**detail})
        self.db.execute('INSERT OR REPLACE INTO coverage VALUES(?,?,?,?,?,?,?,?,?)',(self.run,stream,start,end,status,pages,count,new,canonical(detail)))
        if status=='complete':self.db.execute('INSERT INTO checkpoints VALUES(?,?) ON CONFLICT(stream) DO UPDATE SET through_ms=MAX(through_ms,excluded.through_ms)',(stream,end))
        self.db.commit();self.changes[stream]=self.changes.get(stream,0)+new
        return {'stream':stream,'status':status,'rows':count,'new':new,'pages':pages,**detail}
    def discover(self,days,count,max_pages):
        end=int(time.time()*1000)-120000;start=end-days*DAY
        self.scan('seed_events',f'/v1/contracts/{CONTRACT}/events',start,end,{'event_name':'Liquidate'},max_pages)
        events=[e for e in self.rows('seed_events') if start<=e['block_timestamp']<=end and str(e['result'].get('resourceType'))=='1']
        groups=collections.defaultdict(list)
        for e in events:groups[address(e['result']['liquidator'])].append(e)
        ranking=sorted(groups,key=lambda a:len(groups[a]),reverse=True)
        print('DISCOVERY',len(events),'events',len(groups),'liquidator identities',flush=True)
        dump(self.root/'seed_summary.json',{'contract':CONTRACT,'network':'tron-mainnet','start':utc(start),'end':utc(end),'events':len(events),'actors':[{'address':a,'event_count':len(groups[a]),'gross_reward_sun':str(sum(int(e['result']['liquidateFee']) for e in groups[a]))} for a in ranking]})
        wallets={};links=[]
        for actor in ranking:
            if len(wallets)>=count:break
            # Sample recent and older executions; each accepted wallet needs a successful receipt.
            es=groups[actor];indexes=sorted(set([0,len(es)//2,len(es)-1]))
            for idx in indexes:
                e=es[idx];txid=e['transaction_id']
                try:
                    tx=self.request('/wallet/gettransactionbyid',body={'value':txid})
                    receipt=self.request('/wallet/gettransactioninfobyid',body={'value':txid})
                    if not tx.get('ret') or any(x.get('contractRet')!='SUCCESS' for x in tx['ret']):raise ValueError('Transaction not successful')
                    if receipt.get('id')!=txid or receipt.get('blockNumber')!=e['block_number'] or receipt.get('receipt',{}).get('result')!='SUCCESS':raise ValueError('Receipt does not match successful seed event')
                    verify_event_receipt(e,receipt)
                    p=tx['raw_data']['contract'][0]['parameter']['value']
                    owner=address(p['owner_address']);target=address(p.get('contract_address'))
                    link={'wallet':owner,'event_liquidator':actor,'top_level_contract':target,'transaction_id':txid,'block':e['block_number'],'timestamp':e['block_timestamp'],'event_index':e['event_index'],'gross_reward_sun':e['result']['liquidateFee'],'transaction_fee_sun':receipt.get('fee',0),'receipt_success':True,'is_direct':owner==actor}
                    links.append(link)
                    dump(self.root/'evidence'/f'{txid}.json',{'seed_event':e,'transaction':tx,'receipt':receipt,'relationship':link})
                    if owner not in wallets and len(wallets)<count:wallets[owner]={'address':owner,'evidence_transactions':[],'execution_contracts':[],'selection':'Originator of successful Energy Rental Liquidate transaction; executor contract and wallet kept separate.'}
                    if owner in wallets:
                        wallets[owner]['evidence_transactions'].append(txid)
                        if actor not in wallets[owner]['execution_contracts']:wallets[owner]['execution_contracts'].append(actor)
                    print('VERIFIED WALLET',owner,'via',actor,flush=True)
                except Exception as exc:self.errors.append({'stage':'verify','transaction_id':txid,'error':str(exc)});print('VERIFY ERROR',txid,str(exc),flush=True)
        if not wallets:raise RuntimeError('No verified wallet originators found')
        watchlist={'network':'tron-mainnet','seed_contract':CONTRACT,'created_at':utc(),'history_start_ms':start,'discovery_end_ms':end,'wallets':list(wallets.values()),'relationships':links,'selection_limit':count,'selection_method':'Liquidator contracts sorted by Energy Rental event count; sampled newest, middle and oldest event, verified originating wallet through transaction body + successful receipt. This is a research shortlist, not a profitability ranking.'}
        dump(self.root/'watchlist.json',watchlist);return watchlist
    def resume_partial(self,stream,max_pages):
        last=self.db.execute('SELECT start_ms,end_ms,status,detail FROM coverage WHERE stream=? ORDER BY run DESC LIMIT 1',(stream,)).fetchone()
        if last and last[2]=='partial':
            cp=self.db.execute('SELECT through_ms FROM checkpoints WHERE stream=?',(stream,)).fetchone()
            if cp:return  # A completed prefix exists; normal overlap scan fills the remaining gap.
            detail=json.loads(last[3]);nxt=detail.get('next_url')
            if nxt:
                result=self.scan(stream,'',last[0],last[1],max_pages=max_pages,resume_url=nxt)
                if result['status']!='complete':raise RuntimeError('Historical continuation still incomplete: '+stream)
    def update_seed(self,max_pages):
        self.resume_partial('seed_events',max_pages)
        watch=json.loads((self.root/'watchlist.json').read_text())
        cp=self.db.execute('SELECT through_ms FROM checkpoints WHERE stream=?',('seed_events',)).fetchone()
        start=max(watch['history_start_ms'],cp[0]-DAY) if cp else watch['history_start_ms']
        self.scan('seed_events',f'/v1/contracts/{CONTRACT}/events',start,int(time.time()*1000)-120000,{'event_name':'Liquidate'},max_pages)
    def history(self,max_pages,wallet_filter=None):
        watch=json.loads((self.root/'watchlist.json').read_text());end=int(time.time()*1000)-120000
        for wallet in watch['wallets']:
            a=wallet['address']
            if wallet_filter and a not in wallet_filter:continue
            for kind,suffix in [('transactions','transactions'),('trc20','transactions/trc20'),('internal','internal-transactions')]:
                stream=f'{a}/{kind}'
                self.resume_partial(stream,max_pages)
                cp=self.db.execute('SELECT through_ms FROM checkpoints WHERE stream=?',(stream,)).fetchone()
                start=max(watch['history_start_ms'],cp[0]-DAY) if cp else watch['history_start_ms']
                self.scan(stream,f'/v1/accounts/{a}/{suffix}',start,end,max_pages=max_pages)
                target=self.root/'wallets'/a;target.mkdir(parents=True,exist_ok=True)
                with (target/f'{kind}.jsonl').open('w') as f:
                    for row in self.rows(stream):f.write(canonical(row)+'\n')
            try:
                account=self.request('/wallet/getaccount',body={'address':a,'visible':True});dump(self.root/'wallets'/a/'account_snapshot.json',{'fetched_at':utc(),'account':account})
            except Exception as exc:self.errors.append({'stage':'account','address':a,'error':str(exc)})
    def export(self):
        events=self.rows('seed_events')
        with (self.root/'seed_events.jsonl').open('w') as f:
            for e in events:f.write(canonical(e)+'\n')
        coverage=[dict(zip(['run','stream','start_ms','end_ms','status','pages','rows','new_rows','detail'],x)) for x in self.db.execute('SELECT * FROM coverage')]
        dump(self.root/'coverage.json',coverage)
        summary={'run':self.run,'finished_at':utc(),'requests':self.count,'new_records':self.changes,'errors':self.errors,'raw_directory':str(self.out)}
        dump(self.out/'summary.json',summary);dump(self.root/'latest_run.json',summary)
        print(json.dumps(summary,ensure_ascii=False),flush=True)

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('mode',choices=['discover','history','update']);p.add_argument('--data-dir',type=Path,default=ROOT/'data/energy-rental');p.add_argument('--days',type=int,default=90);p.add_argument('--wallets',type=int,default=5);p.add_argument('--max-pages',type=int,default=200);p.add_argument('--address',action='append');args=p.parse_args()
    c=Collector(args.data_dir)
    try:
        if args.mode=='discover':c.discover(args.days,args.wallets,args.max_pages)
        else:
            if args.mode=='update':c.update_seed(args.max_pages)
            c.history(args.max_pages,args.address)
    finally:
        c.export()
        c.db.close()
    if c.errors:raise SystemExit(1)
if __name__=='__main__':main()
