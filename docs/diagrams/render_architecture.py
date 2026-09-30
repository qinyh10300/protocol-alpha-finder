"""Render the five-stage research workflow and four coordinated operation badges."""
from pathlib import Path
from svg_diagram import Diagram, PALETTE

ROOT = Path(__file__).resolve().parent
ADDRESSES = ['T8mQ…4kN2', 'TB7p…9wR4', 'TK3v…7dA6', 'TP5n…2sF8', 'TU6c…8hM3', 'TX9r…5bK7']
SKILL_COLOR = ('#eaf2ff','#83a8d8','#214f96')
TRANSACTIONS = [
 [('0xa91f…42c8','liquidate'),('0xb20e…73a1','settle'),('0x18dc…6f02','claim')],
 [('0xc73d…81b6','redeem'),('0xd48a…59e2','swap'),('0x92fb…0ac4','repay')],
 [('0xe52b…37d9','reset'),('0xf90c…12a7','buy'),('0x64ab…95e3','settle')],
]
LABELS = {
 'en': {
  'title':'Protocol Alpha Finder · System Architecture',
  'workflow':'Research Workflow',
  'heads':['1 · Alpha Seeds','2 · Strategy Wallets','3 · History Transactions','4 · Alpha Candidates','5 · Validation'],
  'coordinate':'Coordinate 4 Skills',
  'skill_phrases':[['Find','Strategy','Wallets'],['Monitor','Wallet','History'],['Extract','Alpha','Candidates'],['Validate','Alpha','Candidates']],
  'seeds':[
   ['Energy Rental',['Clear depleted orders and','recover resources and rewards.']],
   ['JustLend',['Repay undercollateralized loans','and receive seized collateral.']],
   ['USDD',['Trigger liquidation, reset auctions,','or buy auction collateral.']]],
  'groups':['Rental executions','Collateral flows','Auction executions'],
  'candidates':[
   ['Rental sequence',['Bundled calls may lower','execution costs.']],
   ['Collateral recycling',['Redeem and swap may release','capital sooner.']],
   ['Auction timing',['Temporary discounts may offer','an opportunity after costs.']]],
  'checks':['Execution evidence','Rewards minus costs','Current protocol conditions'],
  'report':'Alpha Report',
  'outcomes':['Actionable · Monitor','Rejected · Insufficient Evidence'],
  'new':'New Alpha, if supported',
  'solid':'Evidence flow', 'dashed':'Skill coordination',
  'description':'Illustrative addresses and transactions. The selected wallet connects to monitored transaction rows; three dashed evidence groups support three candidate hypotheses, with one shown entering validation. Protocol Alpha Finder coordinates four operations. Monitoring currently uses manually initiated collection and review, with historical coverage recorded explicitly.',
 },
 'zh-CN': {
  'title':'Protocol Alpha Finder · 系统架构',
  'workflow':'研究工作流',
  'heads':['1 · Alpha Seed','2 · 策略钱包','3 · 历史交易','4 · Alpha 候选','5 · 验证'],
  'coordinate':'协调 4 个 Skill',
  'skill_phrases':[['寻找策略','钱包'],['监控钱包','历史'],['提取 Alpha','候选'],['验证 Alpha','候选']],
  'seeds':[
   ['Energy Rental',['清算保证金不足的租赁订单，','回收资源并获得奖励。']],
   ['JustLend',['偿还抵押不足头寸的债务，','获得被清算的抵押品。']],
   ['USDD',['触发清算、重启拍卖，','或购买拍卖中的抵押品。']]],
  'groups':['租赁执行记录','抵押品流动','拍卖执行记录'],
  'candidates':[
   ['租赁组合操作',['合并调用可能降低','整体执行成本。']],
   ['抵押品回收',['赎回并兑换可能更快','释放占用资金。']],
   ['拍卖时机',['短暂折价可能带来机会，','需要结合执行成本验证。']]],
  'checks':['执行证据','奖励扣除成本','协议当前条件'],
  'report':'Alpha 报告',
  'outcomes':['可执行 · 持续观察','已排除 · 证据不足'],
  'new':'验证支持后形成新的 Alpha',
  'solid':'证据流转','dashed':'Skill 编排',
  'description':'地址与交易均为方法示意。选中钱包连接到监控的交易记录，三组虚线标出的证据分别支持三个候选假设，图中选取一个进入验证。Protocol Alpha Finder 统一协调四个操作。监控目前通过手动发起采集与复查完成，并记录历史覆盖情况。',
 }
}


def render(lang, L):
 d=Diagram(2200,1020,L['title'],L['description'],lang)
 d.parts.append('''<style>
.workflow-title { font-size:30px; font-weight:700; }
.skill-title { font-size:24px; font-weight:700; }
.skill-phrase { font-size:18px; font-weight:700; }
.coordinator-title { font-size:32px; font-weight:700; }
.coordinator-description { font-size:23px; font-weight:700; }
.transaction-id { font-family:'SFMono-Regular',Consolas,monospace; font-size:16px; fill:#526579; }
.transaction-action { font-size:14px; fill:#526579; }
.transaction-ellipsis { font-size:27px; fill:#7b8da1; }
.group-label { font-size:19px; font-weight:700; }
</style>''')
 d.text(30,55,L['title'],'title')
 d.arrow(1680,86,1730,86,0,'legend-evidence')
 d.text(1744,92,L['solid'],'small')
 d.arrow(1920,86,1970,86,0,'legend-control',True)
 d.text(1984,92,L['dashed'],'small')
 d.rect(30,120,2140,866,'#f9fbfe','#b8cbe2',8)
 d.text(55,162,L['workflow'],'workflow-title')
 d.rect(780,177,640,86,*SKILL_COLOR[:2],8)
 d.text(1100,214,'Protocol Alpha Finder','coordinator-title','middle',SKILL_COLOR[2])
 d.text(1100,245,L['coordinate'],'coordinator-description','middle',SKILL_COLOR[2])
 centers=[(420,470),(825,460),(1305,470),(1735,470)]
 d.parts.append('<path data-kind="coordination-bus" d="M 1100 263 V 285 M 420 285 H 1735" stroke="#2563b8" stroke-width="1.8" stroke-dasharray="6 6" fill="none"/>')
 for x,y in centers:d.arrow(x,285,x,y-63,0,'skill-coordination',True,True)
 columns=[(60,300),(480,280),(890,350),(1370,300),(1800,340)]
 for (x,w),title in zip(columns,L['heads']):
  d.rect(x,305,w,650,'#ffffff','#c9d6e3',8)
  d.text(x+w/2,342,title,'heading','middle')
 ys=[470,660,850]; wallet_y=[450,498,640,688,830,878]
 for i,y in enumerate(ys):
  for target in wallet_y[2*i:2*i+2]:d.arrow(340,y,498,target,0,'seed-wallet')
 # One selected wallet feeds a monitoring spine with an arrow to each visible row.
 d.arrow(740,wallet_y[0],767,460,0,'wallet-history')
 d.parts.append('<path data-kind="monitor-feed" d="M 881 460 H 914 M 914 418 V 904" stroke="#2563b8" stroke-width="2" fill="none" stroke-linecap="round"/>')
 for y in ys:
  for offset in [-52,-14,54]:d.arrow(914,y+offset,942,y+offset,0,'monitored-transaction')
 for i,y in enumerate(ys):d.arrow(1228,y,1388,y,i,'history-candidate')
 d.arrow(1650,ys[0],1818,470,0,'candidate-validation')
 for i,y in enumerate(ys):
  d.rect(80,y-49,260,98,'#ffffff','#c9d6e3',6)
  d.text(210,y-17,L['seeds'][i][0],'node','middle')
  for j,line in enumerate(L['seeds'][i][1]):d.text(210,y+11+23*j,line,'small','middle')
  # Group color carries the hypothesis; transaction rows retain one neutral style.
  fill,border,accent=PALETTE[i]
  d.parts.append(f'<rect data-kind="transaction-group" x="934" y="{y-80}" width="294" height="156" rx="8" fill="none" stroke="{accent}" stroke-width="2" stroke-dasharray="7 5"/>')
  d.text(944,y-90,L['groups'][i],'group-label','start',accent)
  for (tx,action),offset in zip(TRANSACTIONS[i],[-52,-14,54]):
   cy=y+offset
   d.parts.append('<g data-kind="transaction-row">')
   d.rect(944,cy-15,274,30,'#f8fafc','#d3dce6',5)
   d.text(956,cy+5,tx,'transaction-id')
   d.text(1206,cy+5,action,'transaction-action','end')
   d.parts.append('</g>')
  d.text(1081,y+29,'⋮','transaction-ellipsis','middle')
  d.rect(1390,y-49,260,98,fill,accent if i==0 else border,6)
  d.text(1520,y-17,L['candidates'][i][0],'node','middle',accent)
  for j,line in enumerate(L['candidates'][i][1]):d.text(1520,y+11+23*j,line,'small','middle')
 for i,y in enumerate(wallet_y):
  fill,border,accent=(PALETTE[3][2],PALETTE[3][2],'#ffffff') if i==0 else ('#f8fafc','#d3dce6','#61758a')
  d.rect(500,y-21,240,42,fill,border,6)
  d.text(620,y+7,ADDRESSES[i],'node','middle',accent)
 for i,(x,y) in enumerate(centers):
  fill,border,accent=SKILL_COLOR
  top=y-60
  d.parts.append('<g data-kind="skill-badge">')
  d.rect(x-56,top,112,120,fill,border,7)
  d.text(x,top+29,f'Skill {i+1}','skill-title','middle',accent)
  lines=L['skill_phrases'][i]
  first=top+56+(3-len(lines))*11
  for j,line in enumerate(lines):d.text(x,first+j*23,line,'skill-phrase','middle',accent)
  d.parts.append('</g>')
 d.rect(1820,410,300,142,'#ffffff','#c9d6e3',6)
 for i,line in enumerate(L['checks']):d.text(1970,446+33*i,line,'body','middle')
 d.arrow(1970,558,1970,600,0,'validation-report',False,True)
 d.text(1970,634,L['report'],'node','middle')
 for j,line in enumerate(L['outcomes']):d.text(1970,667+26*j,line,'small','middle')
 d.arrow(1970,715,1970,772,3,'report-new-alpha',False,True)
 d.rect(1820,793,300,70,PALETTE[3][0],PALETTE[3][1],6)
 d.text(1970,835,L['new'],'body','middle',PALETTE[3][2])
 d.save(ROOT.parent/'images'/f'system-architecture-{lang}.svg')

 # Editable topology matches the five-stage picture; package mapping lives in the guide.
 m=['flowchart TB',f'    subgraph FLOW["{L["workflow"]}"]','        direction LR']
 for name,key,head in [('SEED','seeds',0),('WALLET',None,1),('HISTORY','groups',2),('CANDIDATE','candidates',3)]:
  m.append(f'        subgraph {name}S["{L["heads"][head]}"]')
  if key=='groups':
   for i,label in enumerate(L[key]):
    m.append(f'            subgraph HISTORY{i}["{label}"]')
    for j,(tx,action) in enumerate(TRANSACTIONS[i]):
     m.append(f'                TX{i}{j}["{tx} · {action}"]')
    m.append('            end')
  elif key:
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
 for i in range(3):
  for j in range(3):
   label='|Skill 2|' if i==0 and j==0 else ''
   m.append(f'        WALLET0 -->{label} TX{i}{j}')
 for i in range(3):m.append(f'        HISTORY{i} -->|Skill 3| CANDIDATE{i}')
 m.extend(['        CANDIDATE0 -->|Skill 4| CHECK','    end'])
 for i,words in enumerate(L['skill_phrases']):m.append(f'    S{i+1}["Skill {i+1}<br/>{" ".join(words)}"]')
 m.append(f'    COORD["Protocol Alpha Finder<br/>{L["coordinate"]}"]')
 for i in range(1,5):m.append(f'    COORD -.-> S{i}')
 m.append(f'    style WALLET0 fill:{PALETTE[3][2]},stroke:{PALETTE[3][2]},color:#ffffff')
 for i in range(4):m.append(f'    style S{i+1} fill:{SKILL_COLOR[0]},stroke:{SKILL_COLOR[1]},color:{SKILL_COLOR[2]}')
 for i,(fill,border,accent) in enumerate(PALETTE[:3]):
  m.append(f'    style HISTORY{i} fill:#ffffff,stroke:{accent},stroke-dasharray:7 5')
  m.append(f'    style CANDIDATE{i} fill:{fill},stroke:{accent}')
  for j in range(3):m.append(f'    style TX{i}{j} fill:#f8fafc,stroke:#d3dce6,color:#526579')
 m.append(f'    %% {L["description"]}')
 (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
