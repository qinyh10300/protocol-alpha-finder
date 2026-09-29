"""Render the five-stage research workflow and four coordinated operation badges."""
from pathlib import Path
from svg_diagram import Diagram, PALETTE

ROOT = Path(__file__).resolve().parent
ADDRESSES = ['T8mQ…4kN2', 'TB7p…9wR4', 'TK3v…7dA6', 'TP5n…2sF8', 'TU6c…8hM3', 'TX9r…5bK7']
SKILL_COLORS = [
 ('#eaf2ff','#6c9ad9','#1d4f91'),
 ('#e7f7fc','#53a9c7','#17667e'),
 ('#eef0ff','#929fe8','#434e9b'),
 ('#e7effb','#4d74ad','#213f74'),
]
LABELS = {
 'en': {
  'title':'Protocol Alpha Finder · System Architecture',
  'workflow':'Research Workflow',
  'heads':['1 · Alpha Seeds','2 · Strategy Wallets','3 · History Transactions','4 · Alpha Candidates','5 · Validation'],
  'coordinate':'Coordinate 4 Skills',
  'skill_phrases':[['Find','Strategy','Wallets'],['Load','Wallet','History'],['Extract','Alpha','Candidates'],['Validate','Alpha','Candidates']],
  'seeds':[
   ['Energy Rental',['Clear depleted orders and','recover resources and rewards.']],
   ['JustLend',['Repay undercollateralized loans','and receive seized collateral.']],
   ['USDD',['Trigger liquidation, reset auctions,','or buy auction collateral.']]],
  'history_scope':'All activity · Coverage tracked',
  'groups':[
   ['Rental executions','liquidate → settle','tx …a91f · …b20e'],
   ['Collateral flows','redeem → swap','tx …c73d · …d48a'],
   ['Auction executions','reset → buy','tx …e52b · …f90c']],
  'candidates':[
   ['Rental sequence',['Bundled calls may lower','execution costs.']],
   ['Collateral recycling',['Redeem and swap may release','capital sooner.']],
   ['Auction timing',['Temporary discounts may offer','an opportunity after costs.']]],
  'checks':['Execution evidence','Rewards minus costs','Current protocol conditions'],
  'report':'Alpha Report',
  'outcomes':['Actionable · Monitor','Rejected · Insufficient Evidence'],
  'new':'New Alpha, if supported',
  'solid':'Evidence flow', 'dashed':'Skill coordination',
  'description':'Illustrative addresses and transaction groups. A selected wallet supplies its history; three evidence groups produce three candidate hypotheses, with one shown entering validation. The four numbered operations are coordinated by Protocol Alpha Finder. Historical coverage is recorded explicitly.',
 },
 'zh-CN': {
  'title':'Protocol Alpha Finder · 系统架构',
  'workflow':'研究工作流',
  'heads':['1 · Alpha Seed','2 · 策略钱包','3 · 历史交易','4 · Alpha 候选','5 · 验证'],
  'coordinate':'协调 4 个 Skill',
  'skill_phrases':[['寻找策略','钱包'],['加载钱包','历史'],['提取 Alpha','候选'],['验证 Alpha','候选']],
  'seeds':[
   ['Energy Rental',['清算保证金不足的租赁订单，','回收资源并获得奖励。']],
   ['JustLend',['偿还抵押不足头寸的债务，','获得被清算的抵押品。']],
   ['USDD',['触发清算、重启拍卖，','或购买拍卖中的抵押品。']]],
  'history_scope':'全部活动 · 记录覆盖范围',
  'groups':[
   ['租赁执行记录','清算 → 结算','tx …a91f · …b20e'],
   ['抵押品流动','赎回 → 兑换','tx …c73d · …d48a'],
   ['拍卖执行记录','重启拍卖 → 购买','tx …e52b · …f90c']],
  'candidates':[
   ['租赁组合操作',['合并调用可能降低','整体执行成本。']],
   ['抵押品回收',['赎回并兑换可能更快','释放占用资金。']],
   ['拍卖时机',['短暂折价可能带来机会，','需要结合执行成本验证。']]],
  'checks':['执行证据','奖励扣除成本','协议当前条件'],
  'report':'Alpha 报告',
  'outcomes':['可执行 · 持续观察','已排除 · 证据不足'],
  'new':'验证支持后形成新的 Alpha',
  'solid':'证据流转','dashed':'Skill 编排',
  'description':'地址与交易分组均为方法示意。选中钱包提供历史记录，三组交易证据分别产生三个候选假设，图中选取一个进入验证。Protocol Alpha Finder 统一协调四个编号操作，并记录历史数据覆盖情况。',
 }
}


def render(lang, L):
 d=Diagram(2200,880,L['title'],L['description'],lang)
 d.parts.append('''<style>
.skill-title { font-size:19px; font-weight:700; }
.skill-phrase { font-size:16px; font-weight:700; }
.coordinator-title { font-size:25px; font-weight:700; }
.coordinator-description { font-size:22px; font-weight:700; }
</style>''')
 d.text(30,55,L['title'],'title')
 d.arrow(1680,86,1730,86,0,'legend-evidence')
 d.text(1744,92,L['solid'],'small')
 d.arrow(1920,86,1970,86,0,'legend-control',True)
 d.text(1984,92,L['dashed'],'small')
 # One research boundary contains five stages and the project-level coordinator.
 d.rect(30,120,2140,726,'#f9fbfe','#b8cbe2',8)
 d.text(55,160,L['workflow'],'heading')
 d.rect(780,177,640,78,'#eaf2ff','#83a8d8',8)
 d.text(1100,210,'Protocol Alpha Finder','coordinator-title','middle','#214f96')
 d.text(1100,240,L['coordinate'],'coordinator-description','middle','#214f96')
 centers=[(420,434),(825,430),(1305,440),(1735,440)]
 d.parts.append('<path data-kind="coordination-bus" d="M 1100 255 V 276 M 420 276 H 1735" stroke="#2563b8" stroke-width="1.8" stroke-dasharray="6 6" fill="none"/>')
 for x,y in centers:d.arrow(x,276,x,y-49,0,'skill-coordination',True,True)
 columns=[(60,300),(480,280),(890,350),(1370,300),(1800,340)]
 for (x,w),title in zip(columns,L['heads']):
  d.rect(x,305,w,506,'#ffffff','#c9d6e3',8)
  d.text(x+w/2,342,title,'heading','middle')
 d.text(1065,369,L['history_scope'],'small','middle')
 ys=[440,590,740]; wallet_y=[420,468,570,618,720,768]
 # Find executors, load the selected wallet's history, then inspect selected groups.
 for i,y in enumerate(ys):
  for target in wallet_y[2*i:2*i+2]:d.arrow(340,y,498,target,0,'seed-wallet')
 d.arrow(740,wallet_y[0],887,430,3,'wallet-history')
 for i,y in enumerate(ys):d.arrow(1220,y,1388,y,i,'history-candidate')
 d.arrow(1650,ys[0],1818,440,0,'candidate-validation')
 for i,y in enumerate(ys):
  d.rect(80,y-49,260,98,'#ffffff','#c9d6e3',6)
  d.text(210,y-17,L['seeds'][i][0],'node','middle')
  for j,line in enumerate(L['seeds'][i][1]):d.text(210,y+11+23*j,line,'small','middle')
  # Three transaction clusters each support one candidate hypothesis.
  fill,border,accent=PALETTE[i]
  d.rect(910,y-49,310,98,fill,border,6)
  d.text(1065,y-19,L['groups'][i][0],'node','middle',accent)
  d.text(1065,y+10,L['groups'][i][1],'small','middle')
  d.text(1065,y+35,L['groups'][i][2],'code','middle')
  d.rect(1390,y-49,260,98,fill,accent if i==0 else border,6)
  d.text(1520,y-17,L['candidates'][i][0],'node','middle',accent)
  for j,line in enumerate(L['candidates'][i][1]):d.text(1520,y+11+23*j,line,'small','middle')
 for i,y in enumerate(wallet_y):
  fill,border,accent=(PALETTE[3][2],PALETTE[3][2],'#ffffff') if i==0 else ('#f8fafc','#d3dce6','#61758a')
  d.rect(500,y-21,240,42,fill,border,6)
  d.text(620,y+7,ADDRESSES[i],'node','middle',accent)
 # Each transition has one compact, bold badge in a distinct shade of blue.
 for i,(x,y) in enumerate(centers):
  fill,border,accent=SKILL_COLORS[i]
  top=y-46
  d.rect(x-56,top,112,92,fill,border,7)
  d.text(x,top+22,f'Skill {i+1}','skill-title','middle',accent)
  lines=L['skill_phrases'][i]
  first=top+44+(3-len(lines))*9
  for j,line in enumerate(lines):d.text(x,first+j*18,line,'skill-phrase','middle',accent)
 d.rect(1820,391,300,124,'#ffffff','#c9d6e3',6)
 for i,line in enumerate(L['checks']):d.text(1970,425+29*i,line,'body','middle')
 d.arrow(1970,520,1970,550,0,'validation-report',False,True)
 d.text(1970,581,L['report'],'node','middle')
 for j,line in enumerate(L['outcomes']):d.text(1970,611+26*j,line,'small','middle')
 d.arrow(1970,657,1970,693,3,'report-new-alpha',False,True)
 d.rect(1820,702,300,65,PALETTE[3][0],PALETTE[3][1],6)
 d.text(1970,741,L['new'],'body','middle',PALETTE[3][2])
 d.save(ROOT.parent/'images'/f'system-architecture-{lang}.svg')

 # Editable topology matches the five-stage picture; package mapping lives in the guide.
 m=['flowchart TB',f'    subgraph FLOW["{L["workflow"]}"]','        direction LR']
 for name,key,head in [('SEED','seeds',0),('WALLET',None,1),('HISTORY','groups',2),('CANDIDATE','candidates',3)]:
  m.append(f'        subgraph {name}S["{L["heads"][head]}"]')
  if key:
   for i,row in enumerate(L[key]):
    parts=[row[0],*row[1]] if isinstance(row[1],list) else row
    m.append(f'            {name}{i}["{"<br/>".join(parts)}"]')
  else:
   for i,address in enumerate(ADDRESSES):m.append(f'            WALLET{i}["{address}"]')
  m.append('        end')
 m.extend([f'        subgraph VALIDATION["{L["heads"][4]}"]',f'            CHECK["{" · ".join(L["checks"])}"]',f'            REPORT["{L["report"]}<br/>{"<br/>".join(L["outcomes"])}"]',f'            NEW["{L["new"]}"]','            CHECK --> REPORT --> NEW','        end'])
 for i in range(3):
  for j in [2*i,2*i+1]:
   label='|Skill 1|' if i==0 and j==0 else ''
   m.append(f'        SEED{i} -->{label} WALLET{j}')
 m.append('        WALLET0 -->|Skill 2| HISTORYS')
 for i in range(3):m.append(f'        HISTORY{i} -->|Skill 3| CANDIDATE{i}')
 m.extend(['        CANDIDATE0 -->|Skill 4| CHECK','    end'])
 for i,words in enumerate(L['skill_phrases']):m.append(f'    S{i+1}["Skill {i+1}<br/>{" ".join(words)}"]')
 m.append(f'    COORD["Protocol Alpha Finder<br/>{L["coordinate"]}"]')
 for i in range(1,5):m.append(f'    COORD -.-> S{i}')
 m.append(f'    style WALLET0 fill:{PALETTE[3][2]},stroke:{PALETTE[3][2]},color:#ffffff')
 for i,(fill,border,_) in enumerate(SKILL_COLORS):m.append(f'    style S{i+1} fill:{fill},stroke:{border}')
 m.append(f'    %% {L["description"]}')
 (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
