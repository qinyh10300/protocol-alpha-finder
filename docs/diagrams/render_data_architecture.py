"""Draw actual collector tables and JSON research artifacts, without invented SQL tables."""
from pathlib import Path
from svg_diagram import Diagram, PALETTE

ROOT=Path(__file__).resolve().parent
LABELS={
 'en':{
  'title':'Database & Research Data',
  'collection':'01  COLLECTION STORAGE', 'collection_sub':'SQLite tables + original evidence files',
  'research':'02  RESEARCH RECORDS', 'research_sub':'JSON handoffs linked by wallet and candidate IDs',
  'items':'Events · Transactions · Transfers', 'coverage':'Requested intervals and pagination status',
  'checkpoint':'Last complete scan per stream', 'raw':'Evidence files',
  'raw_lines':['Requests · Receipts · Contract ABIs','URL · fetched_at · SHA-256'],
  'wallet':'Strategy Wallets','candidate':'Alpha Candidates','validation':'Validation','run':'Research Run',
  'skills':'Skills', 'summary':'summary',
  'shared':'Shared stream / run values are logical links, not SQL foreign keys.',
  'schema':'SQLite fields follow the current collector schema.',
  'legacy':'Older archives may retain the previous coverage key.',
  'snapshot':'03  SNAPSHOT + ALPHA REPORTS',
  'snapshot_fields':'run · seeds · wallets · candidates · reports · activity',
  'checks':'Adapter checks wallet IDs, source transactions and the input hash.',
  'description':'The implemented collector stores items, coverage and checkpoints in SQLite and keeps raw evidence in files. Skills produce JSON wallet, candidate, validation and run records. The adapter checks their consistency and projects snapshots and Alpha reports for the frontend. These research entities are JSON records, not SQL tables.'
 },
 'zh-CN':{
  'title':'数据库与研究数据结构',
  'collection':'01  采集数据存储','collection_sub':'SQLite 表 + 原始证据文件',
  'research':'02  研究记录','research_sub':'JSON 交接文件，以钱包和候选 ID 关联',
  'items':'事件 · 主交易 · 转账记录','coverage':'请求时间区间与分页覆盖状态',
  'checkpoint':'每条流最后完成的扫描位置','raw':'证据文件',
  'raw_lines':['请求响应 · 回执 · 合约 ABI','URL · 抓取时间 · SHA-256'],
  'wallet':'策略钱包','candidate':'Alpha 候选','validation':'验证结果','run':'研究运行记录',
  'skills':'Skills','summary':'汇总结论',
  'shared':'stream / run 是共享关联值，未声明 SQL 外键。',
  'schema':'图中 SQLite 字段采用当前采集器定义。',
  'legacy':'旧留档可能仍使用上一版 coverage 主键。',
  'snapshot':'03  前端快照与 ALPHA 报告',
  'snapshot_fields':'运行 · 入口 · 钱包 · 候选 · 报告 · 活动',
  'checks':'适配器校验钱包、来源交易和输入文件哈希的一致性。',
  'description':'采集器通过 SQLite 的 items、coverage、checkpoints 三张表保存记录，并以文件保存原始证据。Skills 输出钱包、候选、验证和运行记录 JSON。适配器校验交接一致性后生成前端快照和 Alpha 报告；研究实体为 JSON 记录，不是 SQL 数据表。'
 }
}


def render(lang,L):
 d=Diagram(2080,1110,L['title'],L['description'],lang)
 d.text(40,55,L['title'],'title')
 d.rect(40,141,880,728,'#f8fbff','#dbe5f2')
 d.rect(1050,141,990,728,'#fcfaff','#e3dcef')
 d.text(65,183,L['collection'],'heading');d.text(65,215,L['collection_sub'],'body')
 d.text(1080,183,L['research'],'heading');d.text(1080,215,L['research_sub'],'body')
 def table(x,y,w,h,title,fields,note=None,file=None,color=0):
  d.rect(x,y,w,h)
  d.text(x+22,y+37,title,'node',color=PALETTE[color][2])
  d.line(x+22,y+53,x+w-22,y+53)
  for i,line in enumerate(fields):d.text(x+22,y+85+28*i,line,'code')
  if note:d.text(x+22,y+h-22,note,'small')
  if file:d.text(x+22,y+h-20,file,'small')
 table(65,250,400,280,'items',[
  'PK  stream + item_id','timestamp  INTEGER','payload  TEXT (JSON)','first_run · last_run'],L['items'])
 table(495,250,400,280,'coverage',[
  'PK  run + stream','    + start_ms + end_ms','status · pages · rows · new_rows','detail  TEXT (JSON)'],L['coverage'])
 table(65,618,400,170,'checkpoints',['PK  stream','through_ms  INTEGER'],L['checkpoint'])
 table(495,618,400,170,L['raw'],L['raw_lines'],file='runs/ · evidence/ · contracts/',color=2)
 d.arrow(265,535,265,609,0,'logical-stream',True,True)
 d.text(286,577,'stream','small')
 d.text(65,839,L['shared'],'small')
 # The arrows on the right express artifact joins and summaries, not SQL FKs.
 d.arrow(1506,355,1582,355,1,'wallet-candidate-key')
 d.text(1545,336,'address','small','middle')
 d.arrow(1800,478,1800,566,1,'candidate-validation-key',False,True)
 d.text(1818,529,'candidate_id','small')
 d.arrow(1584,694,1508,694,1,'run-summary')
 d.text(1545,673,L['summary'],'small','middle')
 table(1080,250,420,225,L['wallet'],['address','seed_ids[]','evidence[]'],file='strategy-wallets.json',color=1)
 table(1590,250,420,225,L['candidate'],['candidate_id','originating_wallet','mechanism_hypothesis','source_transactions[]'],file='validation-handoff.json',color=1)
 table(1590,575,420,225,L['validation'],['candidate_id','mechanism_assessment','current_state','run.input_hash'],file='validation-results.json',color=1)
 table(1080,575,420,225,L['run'],['run · provenance','stopping_reason','next_checks'],file='research-record.json',color=1)
 d.arrow(930,500,1040,500,3,'skill-artifacts')
 d.text(985,479,L['skills'],'small','middle',PALETTE[3][2])
 d.arrow(1545,877,1545,929,1,'snapshot-projection',False,True)
 d.rect(1050,941,990,130,PALETTE[3][0],PALETTE[3][1])
 d.text(1080,978,L['snapshot'],'heading',color=PALETTE[3][2])
 d.text(1080,1013,L['snapshot_fields'],'body')
 d.text(1080,1046,L['checks'],'small')
 d.text(65,980,L['schema'],'body');d.text(65,1015,L['legacy'],'small')
 d.save(ROOT.parent/'images'/f'data-architecture-{lang}.svg')
 # Mermaid preserves the same physical-vs-JSON boundary and actual key fields.
 m=f'''flowchart LR
    subgraph SQLITE["{L['collection']}"]
        ITEMS["items<br/>PK stream + item_id<br/>timestamp · payload · first_run · last_run"]
        COVERAGE["coverage<br/>PK run + stream + start_ms + end_ms<br/>status · pages · rows · new_rows · detail"]
        CHECKPOINTS["checkpoints<br/>PK stream · through_ms"]
        RAW["{L['raw']}<br/>runs/ · evidence/ · contracts/"]
        ITEMS -. stream .-> CHECKPOINTS
    end
    subgraph JSON["{L['research']} · JSON"]
        W["{L['wallet']}<br/>address · seed_ids[] · evidence[]"]
        C["{L['candidate']}<br/>candidate_id · originating_wallet<br/>mechanism_hypothesis · source_transactions[]"]
        V["{L['validation']}<br/>candidate_id · mechanism_assessment<br/>current_state · run.input_hash"]
        R["{L['run']}<br/>run · provenance · stopping_reason · next_checks"]
        W -->|address| C
        C -->|candidate_id| V
        V -->|{L['summary']}| R
    end
    SQLITE -->|Skills| JSON
    JSON --> SNAPSHOT["{L['snapshot']}<br/>{L['snapshot_fields']}"]
'''
 (ROOT/f'data-architecture-{lang}.mmd').write_text(m)


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
