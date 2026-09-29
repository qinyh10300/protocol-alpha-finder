"""Normalize saved Skill handoffs into the frontend contract. No chain/agent execution."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = {
    'seed': 'strategy-wallet-discovery/strategy-wallets.json',
    'history': 'wallet-alpha-investigation/history-summary.json',
    'investigation': 'wallet-alpha-investigation/validation-handoff.json',
    'validation': 'protocol-alpha-validation/validation-results.json',
    'discovery': 'protocol-alpha-discovery-test/research-record.json',
    'seed-report': 'strategy-wallet-discovery/REPORT.md',
    'investigation-report': 'wallet-alpha-investigation/REPORT.md',
    'validation-report': 'protocol-alpha-validation/REPORT.md',
    'discovery-report': 'protocol-alpha-discovery-test/REPORT.md',
    'ledgers': 'protocol-alpha-validation/historical-ledgers.json',
    'state': 'protocol-alpha-validation/state-index.json',
    'supplement': 'protocol-alpha-validation/supplement.json',
}
SEEDS = {
    'energy-rental-liquidation': 'Energy Rental Liquidation',
    'justlend-lending-liquidation': 'JustLend Lending Liquidation',
    'usdd-keeper-auction': 'USDD Keeper / Auction',
}


def read(root, key, optional=False):
    path = root / ARTIFACTS[key]
    if optional and not path.exists():
        return {}
    return json.loads(path.read_text())


def ref(key, title):
    return {'type': 'document', 'title': title, 'url': '/api/artifacts/' + key}


def outcome_for(candidate):
    # UI review disposition, separate from the Skill's opportunity assessment.
    # UNCERTAIN is never silently upgraded to ACTIONABLE or REJECTED.
    if candidate.get('mechanism_assessment') == 'established':
        return 'MONITOR', 'Historical operation is supported; current execution and net economics still need evidence. Monitor is a research disposition, not an ACTIVE opportunity.'
    return 'INSUFFICIENT_EVIDENCE', 'The observed sequence does not yet establish the hypothesized advantage. Causal evidence and complete economics are required.'


def section(summary, values=(), label='Evidence'):
    return {'summary': summary, 'items': [{'label': f'{label} {i+1:02}', 'value': str(value)} for i, value in enumerate(values)]}


def normalize(root=ROOT / 'data', seed_id='all'):
    if seed_id != 'all' and seed_id not in SEEDS:
        raise ValueError('Unknown seed')
    seed = read(root, 'seed')
    history = read(root, 'history', True)
    investigation = read(root, 'investigation', True)
    validation = read(root, 'validation', True)
    discovery = read(root, 'discovery', True)
    hmap = {w['wallet']: w for w in history.get('wallets', [])}
    cmap = {c['candidate_id']: c for c in investigation.get('candidates', [])}
    vmap = {v['candidate_id']: v for v in validation.get('candidate_results', [])}
    # Fail visibly rather than presenting unrelated or outdated validation as a report.
    for cid, v in vmap.items():
        c = cmap.get(cid)
        if not c or v['wallet'] != c['originating_wallet'] or {t['transaction_id'] for t in v['source_transactions']} != {t['transaction_id'] for t in c['source_transactions']}:
            raise ValueError(f'Validation handoff mismatch: {cid}')
    if validation.get('run', {}).get('input_hash'):
        digest = hashlib.sha256((root / ARTIFACTS['investigation']).read_bytes()).hexdigest()
        if digest != validation['run']['input_hash']:
            raise ValueError('Investigation changed after validation. Refresh the validation handoff first.')
    run_id = 'local-' + seed_id
    seed_time = seed['run']['queried_at']
    history_time = history.get('run', {}).get('generated_at')
    validation_time = validation.get('run', {}).get('completed_at')
    done_time = discovery.get('run', {}).get('completed_at')
    updated = max(t for t in [seed_time, history_time, validation_time, done_time] if t)
    window = seed['run']['requested_window']
    seeds = [{'id': 'all', 'name': 'Three-seed protocol research', 'chain': 'TRON', 'description': 'Energy Rental · JustLend lending · USDD keeper', 'walletCount': len(seed['wallets'])}]
    for coverage in seed['coverage']:
        sid = coverage['seed_id']
        seeds.append({'id': sid, 'name': SEEDS.get(sid, sid), 'chain': 'TRON', 'walletCount': coverage['verified_wallet_count'], 'coverage': coverage['query_completion_meaning'], 'gaps': coverage['missing_checks']})
    wallets = []
    for w in seed['wallets']:
        if seed_id != 'all' and seed_id not in w['seed_ids']:
            continue
        h = hmap.get(w['address'], {})
        tx = h.get('streams', {}).get('transactions', {})
        complete = tx.get('coverage') == 'complete'
        wallet_candidates = [c['candidate_id'] for c in cmap.values() if c['originating_wallet'] == w['address']]
        investigated = bool(investigation) and bool(h)
        times = h.get('observed_time_range', [None, None])
        wallets.append({'address': w['address'], 'sourceSeedId': w['seed_ids'][0], 'sourceSeedIds': w['seed_ids'],
                        'historyJob': {'status': 'completed' if complete else 'queued', 'txCount': tx.get('records'), 'fromTime': times[0], 'toTime': times[1]},
                        'analysisJob': {'status': 'completed' if investigated else 'queued'}, 'alphaSearchJob': {'status': 'completed' if investigated else 'queued'},
                        'candidateIds': wallet_candidates,
                        'coverageNote': 'History completeness refers to provider pagination within the requested window; it is not an independent whole-chain audit.',
                        'evidenceRefs': [{'type': 'transaction', 'txHash': e['transaction_id'], 'url': e.get('transaction_url')} for e in w['evidence']]})
    addresses = {w['address'] for w in wallets}
    candidates, reports = [], []
    for cid, c in cmap.items():
        if c['originating_wallet'] not in addresses:
            continue
        v = vmap.get(cid)
        # Only reconciled validation ledgers count as reconstructed supporting samples.
        ledgers = v.get('historical_ledgers', []) if v else []
        count = len({x['transaction_id'] for x in ledgers})
        candidate = {'id': cid, 'title': c['title'], 'summary': c['mechanism_hypothesis'], 'sourceWallets': [c['originating_wallet']],
                     'historicalExecutionCount': count if v else None, 'evidenceCountLabel': 'reconciled samples',
                     'status': 'report_ready' if v else 'discovered', 'createdAt': investigation['run']['generated_at']}
        if v:
            candidate['reportId'] = 'report-' + cid
            candidate['validation'] = {'mechanism': v['mechanism_assessment'], 'historicalEvidence': 'confirmed', 'currentState': v['current_state'], 'executionConditions': 'uncertain' if v['missing_evidence'] else 'confirmed'}
            outcome, reason = outcome_for(v)
            current_items = list(v['observations'][2:])
            group = v['mechanism_group']
            params = validation.get('current_parameters', {})
            if group == 'rental-liquidation-return':
                current_items += [f"Minimum reward: {int(params['energy_min_reward_sun']) / 1e6:g} TRX; rent paused: {params['energy_rent_paused']}. A parameter read does not establish an eligible target."] if 'energy_min_reward_sun' in params else []
            if cid.startswith('WAI-LENDING'):
                borrowers = validation.get('current_borrower_samples', [])
                current_items += [f"Borrower {b['address']}: shortfall {b['shortfall_raw']} (raw), error {b['error']}." for b in borrowers]
            if cid.startswith('WAI-CYCLE'):
                current_items += [f"Sample {q['historical_transaction'][:12]}…: historical transfer delta {q['historical_transfer_delta_wtrx']} WTRX; checked quote gross delta {q['quoted_gross_delta_wtrx']} WTRX. Fees and failed attempts are not deducted." for q in validation.get('cycle_quotes', [])]
            ranges = validation['run'].get('initial_observation_block_range', [])
            supplement = validation['run'].get('supplement_observation_block_range', [])
            current_items += [f"Read blocks: {'–'.join(map(str, ranges))}; supplement: {'–'.join(map(str, supplement))}. {validation['run'].get('observation_note', '')}"]
            report = {'id': candidate['reportId'], 'candidateId': cid, 'title': c['title'], 'outcome': outcome,
                      'outcomeReason': reason, 'rawCurrentState': v['current_state'],
                      'executiveSummary': ' '.join([v['observations'][1], v['observations'][2], 'Net economics remain unknown; current opportunity status is ' + v['current_state'] + '.']),
                      'mechanism': section(c['mechanism_hypothesis'], c['action_sequence'], 'Step'),
                      'historicalEvidence': section(f'{count} historical samples reconciled for this candidate. This count is not the full strategy execution volume.', [f"{x['transaction_id']} · block {x['block']} · {x['timestamp_utc']}" for x in ledgers]),
                      'currentState': section(f"{v['current_state']} · Last checked {validation_time}", current_items, 'Finding'),
                      'executionConditions': section('All of these conditions require verification before execution.', v['execution_conditions'], 'Condition'),
                      'sourceWallets': candidate['sourceWallets'], 'historicalExecutionCount': count, 'evidenceCountLabel': 'reconciled samples',
                      'evidenceRefs': [{'type': 'transaction', 'txHash': t['transaction_id'], 'url': t['url']} for t in v['source_transactions']] + [ref('validation', 'Skill validation results'), ref('ledgers', 'Historical ledgers'), ref('state', 'Current state reads'), ref('supplement', 'Supplemental state evidence'), ref('investigation', 'Investigation handoff')],
                      'generatedAt': validation_time, 'lastCheckedAt': validation_time, 'missingEvidence': v['missing_evidence'], 'nextChecks': v['next_checks'], 'alternativeExplanations': v['alternative_explanations']}
            executors = sorted({x.get('roles', {}).get('executor_or_router') for x in ledgers} - {None})
            report['mechanism']['items'] += [{'label': 'Executor / router', 'value': address} for address in executors]
            report['evidenceRefs'] += [{'type': 'contract', 'address': address, 'url': 'https://tronscan.org/#/contract/' + address} for address in executors]
            report['historicalEvidence']['items'].append({'label': 'Economics', 'value': 'Receipt fees may be null. Token and native-call deltas are gross observations; principal, deposit refunds, resource costs and failed attempts must be reconciled before a net-profit claim.'})
            reports.append(report)
        candidates.append(candidate)
    skills = [
        {'id': 'protocol-alpha-discovery', 'name': 'Research orchestration', 'summary': discovery.get('stopping_reason', 'Awaiting final research record.'), 'status': 'completed' if discovery else 'queued', 'completedAt': done_time, 'sourceUrl': '/api/artifacts/discovery-report', 'artifactUrl': '/api/artifacts/discovery'},
        {'id': 'alpha-seed-wallets', 'name': 'Seed → strategy wallets', 'summary': f"{len(seed['coverage'])} seed coverage records · {len(seed['wallets'])} verified wallets", 'status': 'completed', 'completedAt': seed_time, 'sourceUrl': '/api/artifacts/seed-report', 'artifactUrl': '/api/artifacts/seed'},
        {'id': 'wallet-alpha-investigation', 'name': 'Independent wallet research', 'summary': f"{len(hmap)} histories · {history.get('unique_primary_transaction_ids', 0):,} unique primary transactions · {len(cmap)} candidates", 'status': 'completed' if investigation else 'queued', 'completedAt': history_time, 'sourceUrl': '/api/artifacts/investigation-report', 'artifactUrl': '/api/artifacts/investigation'},
        {'id': 'protocol-alpha-validation', 'name': 'Candidate validation & reports', 'summary': f"{len(vmap)} assessments · mechanism, history, current state and execution conditions", 'status': 'completed' if validation else 'queued', 'completedAt': validation_time, 'sourceUrl': '/api/artifacts/validation-report', 'artifactUrl': '/api/artifacts/validation'},
    ]
    activity = []
    def event(kind, timestamp, message, entity=None, entity_id=None, source=None, skill=None):
        activity.append({'id': f'archive-{len(activity)}', 'runId': run_id, 'timestamp': timestamp, 'eventType': kind, 'message': message, 'entityType': entity, 'entityId': entity_id, 'sourceUrl': source, 'skill': skill})
    event('seed_scan', seed_time, 'Saved seed scan covers Energy Rental, JustLend lending and USDD keeper / auction.', source='/api/artifacts/seed', skill='alpha-seed-wallets')
    for w in wallets:
        event('wallet_found', seed_time, f"Verified executor {w['address']}", 'wallet', w['address'], '/api/artifacts/seed', 'alpha-seed-wallets')
        if w['historyJob']['status'] == 'completed':
            event('history_loaded', history_time, f"{w['historyJob']['txCount']:,} primary transactions retained for {w['address']}", 'wallet', w['address'], '/api/artifacts/history', 'wallet-alpha-investigation')
    for c in candidates:
        event('candidate_created', c['createdAt'], c['title'] + ' · ' + c['id'], 'candidate', c['id'], '/api/artifacts/investigation', 'wallet-alpha-investigation')
    for r in reports:
        event('report_generated', r['generatedAt'], r['title'] + ' · ' + r['outcome'], 'report', r['id'], '/api/artifacts/validation', 'protocol-alpha-validation')
    if discovery:
        event('research_completed', done_time, discovery['stopping_reason'], source='/api/artifacts/discovery', skill='protocol-alpha-discovery')
    activity.sort(key=lambda e: e['timestamp'] or '')
    # These are persisted stage observations, never invented per-wallet execution timestamps.
    total = sum(w['historyJob'].get('txCount') or 0 for w in wallets)
    if seed_id == 'all' and 'unique_primary_transaction_ids' in history:
        total = history['unique_primary_transaction_ids']
    run = {'id': run_id, 'seedId': seed_id, 'status': 'completed' if discovery else 'paused', 'startedAt': seed_time, 'updatedAt': updated, 'walletCount': len(wallets), 'candidateCount': len(candidates), 'reportCount': len(reports), 'loadedTransactionCount': total}
    return {'run': run, 'seeds': seeds, 'wallets': wallets, 'candidates': candidates, 'reports': reports, 'activity': activity, 'skills': skills, 'mode': 'archive', 'window': {'from': window['start_utc'], 'to': window['end_utc']}, 'note': 'Saved Skill results · Historical research snapshot. Current state refers to the recorded check time. Refresh reloads local artifacts; it does not run a new on-chain investigation.'}
