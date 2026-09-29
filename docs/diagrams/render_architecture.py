"""Render one bilingual architecture: workflow, Skill control, evidence and technical notes."""
from pathlib import Path
from svg_diagram import Diagram, PALETTE

ROOT = Path(__file__).resolve().parent
ADDRESSES = ['T8mQ…4kN2', 'TB7p…9wR4', 'TK3v…7dA6', 'TP5n…2sF8', 'TU6c…8hM3', 'TX9r…5bK7']
LABELS = {
 'en': {
  'title':'Protocol Alpha Finder · System Architecture',
  'workflow':'Research Workflow',
  'heads':['1 · Alpha Seeds','2 · Strategy Wallets','3 · Alpha Candidates','4 · Validation'],
  'seeds':[
   ['Energy Rental',['Clear depleted orders and','recover resources and rewards.']],
   ['JustLend',['Repay undercollateralized loans','and receive seized collateral.']],
   ['USDD',['Trigger liquidation, reset auctions,','or buy auction collateral.']]],
  'candidates':[
   ['Rental sequence',['Bundled calls may lower','execution costs.']],
   ['Collateral recycling',['Redeem and swap may release','capital sooner.']],
   ['Auction timing',['Temporary discounts may offer','an opportunity after costs.']]],
  'skill_actions':['Find wallets','Investigate','Validate'],
  'coordinate':'Skill 4 · Coordinate Skills 1–3',
  'checks':['Execution evidence','Rewards minus costs','Current protocol conditions'],
  'report':'Alpha Report',
  'outcomes':['Actionable · Monitor','Rejected · Insufficient Evidence'],
  'new':'New Alpha, if supported',
  'history':'Historical evidence',
  'history_detail':'Contract calls · Receipts · Asset flows · Protocol state',
  'history_note':'Identify executors and reconstruct their strategies.',
  'observe':'Review new wallet activity',
  'observe_detail':'New calls · Changed behavior · Returning conditions',
  'observe_note':'Repeat collection and review; current checks start manually.',
  'compare':'Compare',
  'example':'Illustrative addresses and hypotheses · Matching colors show provenance; one research path is drawn.',
  'technical':'Technical details',
  'tech':[
   ['TRON evidence','Calls, receipts, transfers and state'],
   ['Incremental collection','Coverage checks and resume checkpoints'],
   ['Linked research artifacts','Evidence-linked JSON handoffs and reports']],
  'solid':'Evidence flow', 'dashed':'Coordination / review',
 },
 'zh-CN': {
  'title':'Protocol Alpha Finder · 系统架构',
  'workflow':'研究工作流',
  'heads':['1 · Alpha Seed','2 · 策略钱包','3 · Alpha 候选','4 · 验证'],
  'seeds':[
   ['Energy Rental',['清算保证金不足的租赁订单，','回收资源并获得奖励。']],
   ['JustLend',['偿还抵押不足头寸的债务，','获得被清算的抵押品。']],
   ['USDD',['触发清算、重启拍卖，','或购买拍卖中的抵押品。']]],
  'candidates':[
   ['租赁组合操作',['合并调用可能降低','整体执行成本。']],
   ['抵押品回收',['赎回并兑换可能更快','释放占用资金。']],
   ['拍卖时机',['短暂折价可能带来机会，','需要结合执行成本验证。']]],
  'skill_actions':['发现钱包','研究钱包','验证候选'],
  'coordinate':'Skill 4 · 协调 Skill 1–3',
  'checks':['执行证据','奖励扣除成本','协议当前条件'],
  'report':'Alpha 报告',
  'outcomes':['可执行 · 持续观察','已排除 · 证据不足'],
  'new':'验证支持后形成新的 Alpha',
  'history':'历史证据',
  'history_detail':'合约调用 · 交易回执 · 资产流动 · 协议状态',
  'history_note':'识别真实执行者，还原钱包使用的策略。',
  'observe':'复查钱包的新活动',
  'observe_detail':'新增调用 · 行为变化 · 再次出现的执行条件',
  'observe_note':'重复采集与复查；当前由手动启动检查。',
  'compare':'对比',
  'example':'地址与候选均为方法示意 · 相同颜色标明来源关系，图中只展开一条研究路径。',
  'technical':'技术说明',
  'tech':[
   ['TRON 链上证据','合约调用、回执、转账与协议状态'],
   ['增量采集','覆盖检查与可恢复的采集检查点'],
   ['关联研究记录','带证据引用的 JSON 交接文件与报告']],
  'solid':'证据流转','dashed':'编排／复查',
 }
}


def render(lang, L):
 d=Diagram(1800,1120,L['title'],L['example'],lang)
 d.text(40,55,L['title'],'title')
 d.arrow(1200,90,1250,90,0,'legend-evidence')
 d.text(1262,96,L['solid'],'small')
 d.arrow(1440,90,1490,90,3,'legend-control',True)
 d.text(1502,96,L['dashed'],'small')
 # All four stages share one research boundary, including the seed entry point.
 d.rect(40,125,1720,674,'#fafcfb','#b8d2c6',8)
 d.text(65,166,L['workflow'],'heading')
 d.rect(675,186,450,56,PALETTE[3][0],PALETTE[3][1],8)
 d.text(900,221,L['coordinate'],'heading','middle',PALETTE[3][2])
 # Dashed control bus terminates at the three Skill badges in the main flow.
 d.parts.append(f'<path data-kind="coordination-bus" d="M 900 242 V 265 M 425 265 H 1330" stroke="{PALETTE[3][2]}" stroke-width="1.8" stroke-dasharray="6 6" fill="none"/>')
 for x,stop in [(425,374),(875,374),(1330,384)]:
  d.arrow(x,265,x,stop,3,'skill-coordination',True,True)
 columns=[(65,300),(485,320),(945,330),(1385,350)]
 for (x,w),title in zip(columns,L['heads']):
  d.rect(x,300,w,459,'#ffffff','#c9d6e3',8)
  d.text(x+w/2,336,title,'heading','middle')
 sy=[410,547,684]; wy=[390,443,527,580,664,717]
 # Every seed yields two illustrative wallets; only one example is expanded.
 for i,y in enumerate(sy):
  for target in wy[i*2:i*2+2]:d.arrow(345,y,503,target,0,'seed-wallet')
 d.arrow(785,wy[0],963,sy[0],0,'wallet-candidate')
 d.arrow(1255,sy[0],1403,410,2,'candidate-validation')
 for i,y in enumerate(sy):
  d.rect(85,y-49,260,98,'#ffffff','#c9d6e3',6)
  d.text(215,y-17,L['seeds'][i][0],'node','middle')
  for j,line in enumerate(L['seeds'][i][1]):d.text(215,y+11+23*j,line,'small','middle')
  fill,border,accent=PALETTE[i]
  d.rect(965,y-49,290,98,fill,border,6)
  d.text(1110,y-17,L['candidates'][i][0],'node','middle',accent)
  for j,line in enumerate(L['candidates'][i][1]):d.text(1110,y+11+23*j,line,'small','middle')
 for i,y in enumerate(wy):
  fill,border,accent=PALETTE[i//2]
  d.rect(505,y-21,280,42,fill,border,6)
  d.text(645,y+7,ADDRESSES[i],'node','middle',accent)
 # Badges sit on the transition arrows, replacing the former Skill card section.
 for i,(x,y) in enumerate([(425,400),(875,400),(1330,410)]):
  d.rect(x-52,y-23,104,46,'#f5f8fb','#9eb0c1',7)
  d.text(x,y-3,f'Skill {i+1}','small','middle','#24384d')
  d.text(x,y+15,L['skill_actions'][i],'small','middle','#526579')
 d.rect(1405,361,310,124,'#ffffff','#c9d6e3',6)
 for i,line in enumerate(L['checks']):d.text(1560,394+29*i,line,'body','middle')
 d.arrow(1560,489,1560,523,2,'validation-report',False,True)
 d.text(1560,554,L['report'],'node','middle')
 for j,line in enumerate(L['outcomes']):d.text(1560,584+26*j,line,'small','middle')
 d.arrow(1560,624,1560,659,3,'report-new-alpha',False,True)
 d.rect(1405,666,310,59,PALETTE[3][0],PALETTE[3][1],6)
 d.text(1560,702,L['new'],'body','middle',PALETTE[3][2])
 d.text(65,784,L['example'],'small')
 # Evidence and observation are one compact support layer beneath the workflow.
 d.arrow(435,845,435,804,0,'history-workflow',False,True)
 d.parts.append(f'<path data-kind="observation-review" d="M 1365 845 V 820 H 875 V 804" fill="none" stroke="{PALETTE[3][2]}" stroke-width="2" stroke-dasharray="6 6" marker-end="url(#a3)"/>')
 for x,title,detail,note in [(65,L['history'],L['history_detail'],L['history_note']),(995,L['observe'],L['observe_detail'],L['observe_note'])]:
  d.rect(x,845,740,120,'#f8fafc','#c9d6e3',8)
  d.text(x+24,879,title,'heading')
  d.text(x+24,913,detail,'body')
  d.text(x+24,942,note,'small')
 d.arrow(815,905,985,905,0,'history-observation')
 d.text(900,891,L['compare'],'small','middle')
 # Technical notes stay last and summarize implementation in three short items.
 d.line(40,1000,1760,1000,'#dce5ef')
 d.text(40,1031,L['technical'],'node')
 for x,(heading,detail) in zip([40,650,1260],L['tech']):
  d.text(x,1065,heading,'body',color='#344b60')
  d.text(x,1093,detail,'small')
 d.save(ROOT.parent/'images'/f'system-architecture-{lang}.svg')

 # The Mermaid companion records the same hierarchy and representative path.
 m=['flowchart TB',f'    subgraph FLOW["{L["workflow"]}"]','        direction LR']
 for name,key,head in [('SEED','seeds',0),('WALLET',None,1),('CANDIDATE','candidates',2)]:
  m.append(f'        subgraph {name}S["{L["heads"][head]}"]')
  if key:
   for i,row in enumerate(L[key]):m.append(f'            {name}{i}["{row[0]}<br/>{" ".join(row[1])}"]')
  else:
   for i,address in enumerate(ADDRESSES):m.append(f'            WALLET{i}["{address}"]')
  m.append('        end')
 m.extend([f'        subgraph VALIDATION["{L["heads"][3]}"]',f'            CHECK["{" · ".join(L["checks"])}"]',f'            REPORT["{L["report"]}<br/>{"<br/>".join(L["outcomes"])}"]',f'            NEW["{L["new"]}"]','            CHECK --> REPORT --> NEW','        end'])
 for i in range(3):
  for j in [i*2,i*2+1]:
   edge='-->|Skill 1|' if i==0 and j==0 else '-->'
   m.append(f'        SEED{i} {edge} WALLET{j}')
 m.extend(['        WALLET0 -->|Skill 2| CANDIDATE0','        CANDIDATE0 -->|Skill 3| CHECK','    end'])
 for i,action in enumerate(L['skill_actions']):m.append(f'    S{i+1}["Skill {i+1} · {action}"]')
 m.append(f'    S4["{L["coordinate"]}"]')
 for i in range(1,4):m.append(f'    S4 -.-> S{i}')
 m.extend([f'    HISTORY["{L["history"]}<br/>{L["history_detail"]}"]',f'    OBSERVE["{L["observe"]}<br/>{L["observe_detail"]}"]','    HISTORY --> FLOW','    HISTORY --> OBSERVE','    OBSERVE -.-> FLOW',f'    %% {L["example"]}',f'    %% {L["observe_note"]}'])
 for i in range(3):
  fill,border,_=PALETTE[i]
  for name in [f'WALLET{2*i}',f'WALLET{2*i+1}',f'CANDIDATE{i}']:m.append(f'    style {name} fill:{fill},stroke:{border}')
 (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
