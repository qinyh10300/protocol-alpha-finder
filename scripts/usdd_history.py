"""Verify a bounded USDD receipt supplement and expose discovery-only wallets.

No network access is used. Node responses remain public evidence, rather than
proof of complete wallet histories, profitability, or current opportunities.
"""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

SEED_ID = 'usdd-keeper-auction'
EVIDENCE_NAME = 'usdd-historical-evidence.json'
EVIDENCE_URL = './research/' + EVIDENCE_NAME
DEFAULT_EVIDENCE = Path(__file__).resolve().parents[1] / 'frontend/public/research' / EVIDENCE_NAME
DOG = 'TCwYKcDj8c5Te9hjj3UokcxhpY6skFoXnG'
CLIPS = {'TRX-A': 'TK9Ng6QqNVvyhWcWAiEasZ1HqE7bxgNayA', 'STRX-A': 'TG27ivYppJDcjwpjLdpP18xP3ZMGTYyNs3'}
# Canonical signatures and their Keccak-256 hashes. Fixed constants avoid an
# additional crypto dependency for offline export. This does not audit bytecode.
SIGNATURES = {
    'bark(bytes32,address,address)': 'ed9989082003a55a19bf3b236e2948ec3535864e2f8fbaf791a36026e83c2637',
    'take(uint256,uint256,uint256,address,bytes)': '81a794cb06a5236e70f12de71cfb43ee851068eee3a0c969cc725d99bc5c4083',
    'Bark(bytes32,address,uint256,uint256,uint256,address,uint256)': '85258d09e1e4ef299ff3fc11e74af99563f022d21f3f940db982229dc2a3358c',
    'Kick(uint256,uint256,uint256,uint256,address,address,uint256)': '7c5bfdc0a5e8192f6cd4972f382cec69116862fb62e6abff8003874c58e064b8',
    'Take(uint256,uint256,uint256,uint256,uint256,uint256,address)': '05e309fd6ce72f2ab888a20056bb4210df08daed86f21f95053deb19964d86b1',
    'Digs(bytes32,uint256)': '54f095dc7308776bf01e8580e4dd40fd959ea4bf50b069975768320ef8d77d8a',
}
DEPLOYMENTS_URL = 'https://docs.usdd.io/developers/deployment-addresses'
NOTE = 'Saved USDD discovery · Historical samples verified; full wallet histories and candidate research are pending.'
COVERAGE_NOTE = 'Targeted historical receipts only. Full wallet history, behavior analysis and candidate research are pending.'
GAPS = [
    'Full wallet histories and candidate research are pending.',
    'Targeted samples do not establish full activity, net profit or current opportunities.',
]


def require(condition, message):
    if not condition:
        raise ValueError('USDD evidence: ' + message)


def address(raw):
    require(len(raw) == 21 and raw[0] == 0x41, 'invalid TRON address')
    encoded = raw + hashlib.sha256(hashlib.sha256(raw).digest()).digest()[:4]
    number, result = int.from_bytes(encoded, 'big'), ''
    alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    while number:
        number, remainder = divmod(number, 58)
        result = alphabet[remainder] + result
    return result


def word_address(word):
    require(len(word) == 32 and word[:12] == bytes(12), 'invalid ABI address word')
    return address(b'\x41' + word[12:])


def fields(data):
    """Read the protobuf fields needed to bind JSON calldata to hashed bytes."""
    position = 0

    def varint():
        nonlocal position
        value = 0
        for shift in range(0, 70, 7):
            require(position < len(data), 'truncated protobuf')
            byte = data[position]
            position += 1
            value |= (byte & 127) << shift
            if byte < 128:
                return value
        raise ValueError('USDD evidence: invalid protobuf varint')

    result = []
    while position < len(data):
        tag = varint()
        number, wire = tag >> 3, tag & 7
        require(number > 0, 'invalid protobuf field')
        if wire == 0:
            value = varint()
        else:
            require(wire in (1, 2, 5), 'unsupported protobuf field')
            size = varint() if wire == 2 else (8 if wire == 1 else 4)
            require(position + size <= len(data), 'truncated protobuf field')
            value = data[position:position + size]
            position += size
        result.append((number, wire, value))
    return result


def one_field(data, number, wire):
    values = [value for field, kind, value in fields(data) if field == number and kind == wire]
    require(len(values) == 1, f'expected one protobuf field {number}')
    return values[0]


def words(encoded, count=None):
    raw = bytes.fromhex(encoded)
    require(len(raw) % 32 == 0, 'invalid ABI word length')
    result = [raw[i:i + 32] for i in range(0, len(raw), 32)]
    if count is not None:
        require(len(result) == count, 'unexpected ABI word count')
    return result


def event(receipt, name, contract, topic_count, data_count):
    signature = next(signature for signature in SIGNATURES if signature.startswith(name + '('))
    matches = [log for log in receipt['log'] if log.get('topics', [None])[0] == SIGNATURES[signature]]
    require(len(matches) == 1, f'expected one {name} event')
    log = matches[0]
    require(log['address'] == contract, f'{name} event contract mismatch')
    require(len(log['topics']) == topic_count, f'{name} topic count mismatch')
    topics = [bytes.fromhex(topic) for topic in log['topics']]
    require(all(len(topic) == 32 for topic in topics), f'{name} invalid topic')
    return topics, words(log['data'], data_count)


def verify_evidence(evidence):
    """Return derived sender/action records or reject inconsistent public evidence."""
    require(evidence['schemaVersion'] == 1, 'unsupported schema version')
    verified_at = datetime.fromisoformat(evidence['verifiedAt'].replace('Z', '+00:00'))
    require(verified_at.tzinfo is not None, 'verification time needs a timezone')
    require(bool(evidence['transactions']), 'no transaction samples')
    derived, seen = [], set()
    for sample in evidence['transactions']:
        tx, receipt = sample['transaction'], sample['receipt']
        txid = tx['txID']
        require(txid not in seen, 'duplicate transaction sample')
        seen.add(txid)
        raw = bytes.fromhex(tx['raw_data_hex'])
        require(hashlib.sha256(raw).hexdigest() == txid, 'raw transaction hash mismatch')
        require(receipt['id'] == txid, 'receipt transaction id mismatch')
        require(tx['ret'] == [{'contractRet': 'SUCCESS'}], 'transaction was not successful')
        require(receipt['receipt']['result'] == 'SUCCESS', 'receipt was not successful')
        contract = tx['raw_data']['contract']
        require(len(contract) == 1 and contract[0]['type'] == 'TriggerSmartContract', 'unexpected call type')
        call = contract[0]['parameter']['value']
        # TRON raw.contract(11) -> Contract.parameter(2) -> Any.value(2).
        protobuf_contract = one_field(raw, 11, 2)
        require(one_field(protobuf_contract, 1, 0) == 31, 'raw contract type mismatch')
        protobuf_call = one_field(one_field(protobuf_contract, 2, 2), 2, 2)
        require(address(one_field(protobuf_call, 1, 2)) == call['owner_address'], 'raw sender mismatch')
        require(address(one_field(protobuf_call, 2, 2)) == call['contract_address'], 'raw contract mismatch')
        require(one_field(protobuf_call, 4, 2).hex() == call['data'], 'raw calldata mismatch')
        target = call['contract_address']
        require(receipt['contract_address'] == target, 'receipt called contract mismatch')
        require(receipt['blockNumber'] > 0 and receipt['blockTimeStamp'] > 0, 'missing block metadata')
        for key, endpoint in [('transaction', 'gettransactionbyid'), ('receipt', 'gettransactioninfobyid')]:
            retrieval = sample['retrieval'][key]
            require(retrieval['endpoint'] == 'https://api.trongrid.io/wallet/' + endpoint, 'unexpected evidence endpoint')
            fetched = datetime.fromisoformat(retrieval['fetchedAt'].replace('Z', '+00:00'))
            require(fetched.tzinfo is not None and fetched <= verified_at, 'invalid retrieval time')
        selector, args = call['data'][:8], words(call['data'][8:])
        if target == DOG:
            require(selector == SIGNATURES['bark(bytes32,address,address)'][:8] and len(args) == 3, 'Dog method mismatch')
            ilk = args[0].rstrip(b'\0').decode('ascii')
            require(ilk in CLIPS, 'unknown collateral Clip')
            clip = CLIPS[ilk]
            bark_topics, bark_data = event(receipt, 'Bark', DOG, 4, 4)
            kick_topics, kick_data = event(receipt, 'Kick', clip, 4, 4)
            require(bark_topics[1] == args[0] and bark_topics[2] == args[1], 'Bark ilk or urn mismatch')
            require(kick_topics[2] == args[1] and kick_topics[3] == args[2], 'Kick recipient mismatch')
            require(bark_topics[3] == kick_topics[1], 'Bark/Kick auction mismatch')
            require(word_address(bark_data[3]) == clip, 'Bark Clip mismatch')
            require(bark_data[0] == kick_data[2], 'Bark/Kick collateral amount mismatch')
            auction_id = int.from_bytes(bark_topics[3], 'big')
            require(int(receipt['contractResult'][0], 16) == auction_id, 'returned auction id mismatch')
            role, signature = 'liquidation_trigger', 'bark(bytes32,address,address)'
            arguments = {'ilk': ilk, 'urn': word_address(args[1]), 'keeperRewardRecipient': word_address(args[2])}
            vault = arguments['urn']
        else:
            require(target in CLIPS.values(), 'unknown called contract')
            require(selector == SIGNATURES['take(uint256,uint256,uint256,address,bytes)'][:8] and len(args) >= 6, 'Clip method mismatch')
            require(int.from_bytes(args[4], 'big') == 160, 'take bytes offset mismatch')
            data_length = int.from_bytes(args[5], 'big')
            require(len(args) == 6 + (data_length + 31) // 32, 'take bytes length mismatch')
            ilk = next(ilk for ilk, clip in CLIPS.items() if clip == target)
            take_topics, _ = event(receipt, 'Take', target, 3, 5)
            digs_topics, _ = event(receipt, 'Digs', DOG, 2, 1)
            require(take_topics[1] == args[0], 'Take auction mismatch')
            require(digs_topics[1] == ilk.encode().ljust(32, b'\0'), 'Digs ilk mismatch')
            auction_id = int.from_bytes(args[0], 'big')
            role, signature = 'auction_purchase', 'take(uint256,uint256,uint256,address,bytes)'
            arguments = {'id': auction_id, 'amountRaw': str(int.from_bytes(args[1], 'big')), 'maxPriceRaw': str(int.from_bytes(args[2], 'big')), 'who': word_address(args[3])}
            vault = word_address(take_topics[2])
            clip = target
        require(auction_id > 0, 'invalid auction id')
        derived.append({'transactionId': txid, 'wallet': call['owner_address'], 'role': role,
                        'methodSignature': signature, 'contract': target, 'clip': clip,
                        'ilk': ilk, 'auctionId': auction_id, 'vault': vault, 'arguments': arguments,
                        'blockNumber': receipt['blockNumber'],
                        'timestamp': datetime.fromtimestamp(receipt['blockTimeStamp'] / 1000, timezone.utc).isoformat()})
    auctions = {(row['clip'], row['auctionId']): row for row in derived if row['role'] == 'liquidation_trigger'}
    for row in derived:
        if row['role'] == 'auction_purchase':
            trigger = auctions.get((row['clip'], row['auctionId']))
            require(trigger is not None and trigger['vault'] == row['vault'], 'Take has no matching verified auction')
            require(trigger['blockNumber'] < row['blockNumber'], 'Take precedes auction creation')
    return derived


def supplement_snapshot(snapshot, evidence_file=DEFAULT_EVIDENCE):
    """Supplement an empty USDD discovery; never replace later collected wallets."""
    if snapshot['run']['seedId'] != SEED_ID or snapshot['wallets'] or not evidence_file.exists():
        return snapshot
    require(not snapshot['candidates'] and not snapshot['reports'] and snapshot['run']['walletCount'] == 0,
            'cannot supplement inconsistent original discovery')
    evidence_bytes = evidence_file.read_bytes()
    evidence = json.loads(evidence_bytes)
    records = verify_evidence(evidence)
    result = copy.deepcopy(snapshot)
    result['previousDiscovery'] = {key: copy.deepcopy(snapshot[key]) for key in ('window', 'run', 'seeds', 'sourceArtifacts', 'note')}
    wallets = list(dict.fromkeys(row['wallet'] for row in records))
    coverage = f'{len(wallets)} wallets verified from {len(records)} targeted historical transactions (April–June 2026). This is not an exhaustive scan.'
    verified_at = evidence['verifiedAt']
    run_id = 'historical-' + SEED_ID
    result['run'] = {'id': run_id, 'seedId': SEED_ID, 'status': 'completed', 'startedAt': verified_at,
                     'updatedAt': verified_at, 'walletCount': len(wallets), 'candidateCount': 0,
                     'reportCount': 0, 'loadedTransactionCount': 0}
    result['seeds'][0].update(walletCount=len(wallets), coverage=coverage, gaps=GAPS.copy())
    result['window'] = {'from': min(row['timestamp'] for row in records), 'to': max(row['timestamp'] for row in records)}
    result['discoveryScope'] = {'kind': 'targeted_historical_samples', 'verifiedTransactionCount': len(records),
                              'fullWalletHistoriesLoaded': False, 'exhaustive': False}
    result['note'] = NOTE
    result['sourceArtifacts'] = [{'path': 'research/' + EVIDENCE_NAME, 'sha256': hashlib.sha256(evidence_bytes).hexdigest()}]
    result['wallets'] = []
    for wallet in wallets:
        samples = [row for row in records if row['wallet'] == wallet]
        refs = [{'type': 'transaction', 'txHash': row['transactionId'], 'url': 'https://tronscan.org/#/transaction/' + row['transactionId']} for row in samples]
        contracts = list(dict.fromkeys(contract for row in samples for contract in (DOG, row['clip'])))
        refs += [{'type': 'contract', 'address': contract, 'url': 'https://tronscan.org/#/contract/' + contract} for contract in contracts]
        refs += [{'type': 'document', 'title': 'USDD historical transaction evidence', 'url': EVIDENCE_URL},
                 {'type': 'document', 'title': 'Official USDD deployment addresses', 'url': DEPLOYMENTS_URL}]
        result['wallets'].append({'address': wallet, 'sourceSeedId': SEED_ID, 'sourceSeedIds': [SEED_ID],
                                  'historyJob': {'status': 'queued'}, 'analysisJob': {'status': 'queued'},
                                  'alphaSearchJob': {'status': 'queued'}, 'candidateIds': [],
                                  'coverageNote': COVERAGE_NOTE, 'evidenceRefs': refs, 'provenance': 'recorded'})
    result['candidates'], result['reports'] = [], []
    result['skills'] = [{'id': 'alpha-seed-wallets', 'name': 'Seed → strategy wallets', 'summary': coverage,
                         'status': 'completed', 'completedAt': verified_at,
                         'sourceUrl': 'https://github.com/qinyh10300/protocol-alpha-finder/blob/main/skills/alpha-seed-wallets/SKILL.md',
                         'artifactUrl': EVIDENCE_URL}]
    result['activity'] = [{'id': 'usdd-historical-scan', 'runId': run_id, 'timestamp': verified_at,
                           'eventType': 'seed_scan', 'message': coverage, 'sourceUrl': EVIDENCE_URL, 'skill': 'alpha-seed-wallets'}]
    for index, wallet in enumerate(wallets):
        result['activity'].append({'id': f'usdd-historical-wallet-{index}', 'runId': run_id, 'timestamp': verified_at,
                                   'eventType': 'wallet_found', 'message': 'Verified historical USDD executor ' + wallet,
                                   'entityType': 'wallet', 'entityId': wallet, 'sourceUrl': EVIDENCE_URL, 'skill': 'alpha-seed-wallets'})
    return result
