#!/usr/bin/env python3
"""Summarize locally collected evidence; no network or model calls."""
import argparse,collections,csv,json,sqlite3
from pathlib import Path
from collect_energy_rental import ROOT,CONTRACT,address,dump,utc
from verify_energy_rental import verify

def summarize(root):
    root=Path(root);quality=verify(root);db=sqlite3.connect(root/'research.sqlite3')
    watch=json.loads((root/'watchlist.json').read_text())
    latest=json.loads((root/'latest_run.json').read_text())
    previous=json.loads((root/'pattern_baseline.json').read_text()) if (root/'pattern_baseline.json').exists() else None
    registry=json.loads((root/'selector_registry.json').read_text()) if (root/'selector_registry.json').exists() else {}
    events=[json.loads(x[0]) for x in db.execute("SELECT payload FROM items WHERE stream='seed_events'")]
    energy=[e for e in events if str(e['result'].get('resourceType'))=='1']
    by_tx=collections.defaultdict(list)
    for e in energy:by_tx[e['transaction_id']].append(e)
    summary=[];global_ids=set();patterns={};alerts=[]
    for wallet in watch['wallets']:
        a=wallet['address'];stream=f'{a}/transactions'
        transactions=[json.loads(x[0]) for x in db.execute('SELECT payload FROM items WHERE stream=?',(stream,))]
        outgoing=[];matched=[];types=collections.Counter();calls=collections.Counter();failed=0;unknown=0
        for tx in transactions:
            global_ids.add(tx['txID']);param=tx.get('raw_data',{}).get('contract',[{}])[0]
            value=param.get('parameter',{}).get('value',{})
            if address(value.get('owner_address'))!=a:continue
            outgoing.append(tx);kind=param.get('type','UNKNOWN');types[kind]+=1
            rets=tx.get('ret',[])
            if not rets or any('contractRet' not in x for x in rets):unknown+=1
            elif any(x['contractRet']!='SUCCESS' for x in rets):failed+=1
            target=address(value.get('contract_address') or value.get('to_address'))
            if kind=='TriggerSmartContract':calls[(target,value.get('data','')[:8])]+=1
            if tx['txID'] in by_tx and rets and all(x.get('contractRet')=='SUCCESS' for x in rets):matched.extend(by_tx[tx['txID']])
        # Unpublished/packed executor calldata can have changing first four bytes.
        # Alert on new target contracts; raw selectors remain available for investigation.
        patterns[a]=sorted(set(target for target,selector in calls if target))
        if previous is not None:
            for pattern in sorted(set(patterns[a])-set(previous.get(a,[]))):alerts.append({'wallet':a,'type':'new_target_contract','contract':pattern,'assessment':'New within locally observed history; semantics and economic significance unverified.'})
        streams={}
        for kind in ['transactions','trc20','internal']:
            name=f'{a}/{kind}'
            row=db.execute('SELECT count(*),min(timestamp),max(timestamp) FROM items WHERE stream=?',(name,)).fetchone()
            cp=db.execute('SELECT through_ms FROM checkpoints WHERE stream=?',(name,)).fetchone()
            coverage=db.execute('SELECT run,start_ms,end_ms,status,pages,rows,detail FROM coverage WHERE stream=? ORDER BY run DESC LIMIT 1',(name,)).fetchone()
            streams[kind]={'records':row[0],'oldest':utc(row[1]) if row[1] else None,'newest':utc(row[2]) if row[2] else None,'complete_through':utc(cp[0]) if cp else None,'latest_scan':dict(zip(['run','start_ms','end_ms','status','pages','rows','detail'],coverage)) if coverage else None}
        accountpath=root/'wallets'/a/'account_snapshot.json'
        account=json.loads(accountpath.read_text()).get('account',{}) if accountpath.exists() else {}
        result={'address':a,'execution_contracts':wallet['execution_contracts'],'verified_sample_transactions':wallet['evidence_transactions'],'account_type':account.get('type','Normal' if account.get('address') else 'unknown'),'streams':streams,'outgoing_transactions':len(outgoing),'failed_outgoing_transactions':failed,'unknown_outgoing_status':unknown,'transaction_types':dict(types),'contract_call_patterns':[{'contract':target,'selector':selector,'count':n,'abi_function':registry.get(target,{}).get(selector,{}).get('signature')} for (target,selector),n in calls.most_common()],'matched_seed_events':len(matched),'matched_seed_gross_reward_sun':str(sum(int(e['result']['liquidateFee']) for e in matched)),'gross_reward_recipient':'event liquidator; may be an execution contract, not wallet','current_opportunity_status':'UNCERTAIN'}
        summary.append(result);dump(root/'wallets'/a/'summary.json',result)
    report={'generated_at':utc(),'data_quality':quality,'network':'tron-mainnet','contract':CONTRACT,'requested_history_start':utc(watch['history_start_ms']),'latest_collection':latest,'wallets':summary,'unique_primary_transaction_ids':len(global_ids),'energy_liquidation_events':len(energy),'known_execution_addresses':len(set(address(e['result']['liquidator']) for e in energy)),'alerts':alerts,'new_pattern_baseline':previous is None,'limitations':['Coverage means the provider returned no further page in the requested interval; it is not an independent full-node completeness guarantee.','The wallet history window is 90 days at initial collection, not lifetime history.','TRC20 records may include transfers or approvals; internal records include calls and resource operations, not only cash transfers.','A successful seed execution establishes a research target, not profitability or beneficial ownership.','Rewards paid to execution contracts are not proven wallet net profit. Resource opportunity cost and strategy economics remain unverified.','Some execution contracts publish no ABI and may interpret packed calldata. First four bytes are stored as selector candidates, not proven function IDs; alerts use new target contracts.']}
    dump(root/'research_summary.json',report);dump(root/'alerts.json',{'run':latest['run'],'alerts':alerts,'collection_errors':latest['errors'],'data_quality_unresolved':quality['unresolved_count']});dump(root/'pattern_baseline.json',patterns)
    with (root/'wallet_summary.csv').open('w',newline='',encoding='utf-8-sig') as f:
        writer=csv.writer(f);writer.writerow(['wallet','transactions','trc20_records','internal_records','outgoing','failed_outgoing','seed_events_linked_by_txid','seed_gross_reward_TRX_paid_to_executor','execution_contracts'])
        for w in summary:writer.writerow([w['address'],*[w['streams'][k]['records'] for k in ['transactions','trc20','internal']],w['outgoing_transactions'],w['failed_outgoing_transactions'],w['matched_seed_events'],str(__import__('decimal').Decimal(w['matched_seed_gross_reward_sun'])/1000000),';'.join(w['execution_contracts'])])
    totals={kind:sum(w['streams'][kind]['records'] for w in summary) for kind in ['transactions','trc20','internal']}
    lines=['# Energy Rental Strategy Wallet 首轮研究与持续监控','',f'生成时间：{report["generated_at"]}。网络：TRON Mainnet。',f'初始历史起点：{report["requested_history_start"]}。末端采用确认数据并预留 2 分钟。','', '## 已完成','',f'- 收录 {len(energy):,} 条 Energy Rental 清算事件，涉及 {report["known_execution_addresses"]} 个事件清算身份。',f'- 根据成功交易发起者筛选 {len(summary)} 个研究钱包，保留钱包与执行合约的区别。',f'- 已保存主交易观测 {totals["transactions"]:,} 条（全体钱包合计 {len(global_ids):,} 个不同交易 ID）、TRC20 记录 {totals["trc20"]:,} 条、内部记录 {totals["internal"]:,} 条。','', '## 钱包清单','', '| 钱包 | 主交易 | TRC20 | 内部记录 | 可关联清算事件 |','|---|---:|---:|---:|---:|']
    for w in summary:lines.append('| '+w['address']+' | '+' | '.join(str(w['streams'][k]['records']) for k in ['transactions','trc20','internal'])+' | '+str(w['matched_seed_events'])+' |')
    lines+=['','## 数据质量','',f'对 {quality["transaction_observations_checked"]:,} 条主交易观测核对 raw_data_hex 的 SHA-256：{quality["original_raw_hash_matches"]:,} 条原始记录直接匹配；{quality["permission_id_restored_and_hash_verified"]} 条资源操作记录的索引响应缺少 Permission_id。已参考节点回包补充，并仅在重建字节的哈希精确等于交易 ID 时接受。原始数据保留，派生修正单独写入 quality/permission_id_corrections.jsonl。未解决记录 {quality["unresolved_count"]} 条。']
    lines+=['','## 筛选与核验','',watch['selection_method'],'','对选中的样本逐一核对 transaction body、成功 receipt，以及原始日志中的合约地址、Liquidate topic、三个 indexed 地址和五个数值字段。wallet 是 top-level owner_address；event liquidator 可能是执行合约。历史主交易中的 txID 可进一步关联全部 seed 事件，但不据此推断合约所有权。','', '## 历史覆盖','']
    for w in summary:
        lines.extend(['### '+w['address'],''])
        for kind,c in w['streams'].items():lines.append(f'- {kind}: {c["records"]:,} 条；最新扫描状态 {(c["latest_scan"] or {}).get("status","not started")}；完整检查至 {c["complete_through"] or "尚无完整检查点"}；数据实际时间 {c["oldest"] or "无记录"} — {c["newest"] or "无记录"}。')
    lines+=['','## 初步行为观察','']
    for w in summary:
        lines.extend(['### '+w['address'],''])
        lines.append(f'- 发起交易 {w["outgoing_transactions"]:,} 笔；执行失败 {w["failed_outgoing_transactions"]:,} 笔；状态未知 {w["unknown_outgoing_status"]:,} 笔。')
        lines.append('- 执行合约：'+', '.join(w['execution_contracts']))
        for p in w['contract_call_patterns'][:5]:lines.append(f'- 合约 {p["contract"]}，selector `0x{p["selector"]}`：{p["count"]:,} 次；ABI 方法 {p["abi_function"] or "未知（前四字节仅作原始前缀）"}。')
    lines+=['','## 边界','', '- 历史窗口为首轮向前 90 天，完整分页指数据源在该区间已无下一页，不代表独立验证了全链完备性。','- TRC20 记录可包含授权，内部记录可包含合约调用和资源操作，三类记录不能相加当作交易总数。','- 清算奖励可能留在执行合约；未核算资源机会成本、资金归属和完整策略成本，因此没有把 gross reward 当作钱包净收益。','- 尚未证明新的 Alpha，也未验证当前可执行性，当前机会状态保持 UNCERTAIN。','', '## 本地文件','', '- `research.sqlite3`：去重记录与每条数据流的完成检查点。','- `runs/`：每次请求的原始响应、URL、抓取时间与响应校验值。','- `watchlist.json`：5 个钱包、执行合约关系与入选证据。','- `seed_events.jsonl`：清算事件。','- `evidence/`：入选样本的交易、receipt、原始日志。','- `wallets/<address>/`：transactions / trc20 / internal JSONL、账户快照和汇总。','- `contracts/`、`sources/`：合约信息和官方资料。','- `coverage.json`：分页、窗口、完成情况与错误。','- `alerts.json`：相对本地既有历史新增的目标合约 和采集错误。','', '## 数据源','', '- [JustLend Energy Rental](https://docs.justlend.org/developers/energy_rental/)','- [TRON 事件 API](https://developers.tron.network/reference/get-events-by-contract-address)','- [TRON 账户交易 API](https://developers.tron.network/reference/get-transaction-info-by-account-address)','- [TRON 内部交易 API](https://developers.tron.network/reference/get-internal-transactions-by-address)','- 主网 API：`https://api.trongrid.io`。']
    (root/'REPORT.md').write_text('\n'.join(lines)+'\n')
    print(json.dumps({'wallets':len(summary),'totals':totals,'unique_transactions':len(global_ids),'new_patterns':len(alerts),'collection_errors':latest['errors'],'data_quality_unresolved':quality['unresolved_count']},ensure_ascii=False))
    db.close()
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--data-dir',type=Path,default=ROOT/'data/energy-rental');a=p.parse_args();summarize(a.data_dir)
