"""Render one bilingual architecture: workflow, Skill control, evidence and technical architecture."""
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
  'skill_phrases':[
   ['Find','Strategy','Wallets'],
   ['Discover','Alpha','Candidates'],
   ['Validate','Alpha','Candidates'],
   ['Coordinate Three Skills']],
  'coordinate':'Skill 4',
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
  'example':'Illustrative addresses and hypotheses · The highlighted wallet leads to three candidate mechanisms.',
  'technical':'Technical Architecture',
  'tech':[
   ['TRON Data','Calls · Receipts · State'],
   ['Collection & Research','Python collectors · Agent Skills'],
   ['Research Archive','SQLite evidence · JSON findings'],
   ['Research Workspace','Python adapter · React UI']],
  'tech_edges':['Read','Save','Read JSON'],
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
  'skill_phrases':[
   ['寻找策略','钱包'],
   ['发掘 Alpha','候选'],
   ['验证 Alpha','候选'],
   ['协调三个 Skill']],
  'coordinate':'Skill 4',
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
  'example':'地址与候选均为方法示意 · 高亮钱包展开为三个候选机制。',
  'technical':'技术架构',
  'tech':[
   ['TRON 链上数据','合约调用 · 回执 · 协议状态'],
   ['采集与研究','Python 采集器 · Agent Skills'],
   ['研究归档','SQLite 证据 · JSON 研究结论'],
   ['研究工作区','Python 适配器 · React 界面']],
  'tech_edges':['读取','保存','读取 JSON'],
  'solid':'证据流转','dashed':'编排／复查',
 }
}


def render(lang, L):
 d=Diagram(1800,1210,L['title'],L['example'],lang)
 d.parts.append('''<style>
.skill-title { font-size:18px; font-weight:700; fill:#24384d; }
.skill-description { font-size:16px; font-weight:700; fill:#526579; }
.coordinator-title { font-size:23px; font-weight:700; }
.coordinator-description { font-size:20px; font-weight:700; }
</style>''')
 d.text(40,55,L['title'],'title')
 d.arrow(1200,90,1250,90,0,'legend-evidence')
 d.text(1262,96,L['solid'],'small')
 d.arrow(1440,90,1490,90,3,'legend-control',True)
 d.text(1502,96,L['dashed'],'small')
 # All four stages share one research boundary, including the seed entry point.
 d.rect(40,125,1720,674,'#fafcfb','#b8d2c6',8)
 d.text(65,166,L['workflow'],'heading')
 # Keep the existing coordinator center and use a compact action phrase.
 d.rect(675,182,450,64,PALETTE[3][0],PALETTE[3][1],8)
 d.text(900,207,L['coordinate'],'coordinator-title','middle',PALETTE[3][2])
 d.text(900,232,L['skill_phrases'][3][0],'coordinator-description','middle',PALETTE[3][2])
 # Dashed control bus terminates at the three Skill badges in the main flow.
 d.parts.append(f'<path data-kind="coordination-bus" d="M 900 246 V 265 M 425 265 H 1330" stroke="{PALETTE[3][2]}" stroke-width="1.8" stroke-dasharray="6 6" fill="none"/>')
 for x,stop in [(425,355),(875,355),(1330,365)]:
  d.arrow(x,265,x,stop,3,'skill-coordination',True,True)
 columns=[(65,300),(485,320),(945,330),(1385,350)]
 for (x,w),title in zip(columns,L['heads']):
  d.rect(x,300,w,459,'#ffffff','#c9d6e3',8)
  d.text(x+w/2,336,title,'heading','middle')
 sy=[410,547,684]; wy=[390,443,527,580,664,717]
 # Every seed yields two illustrative wallets; only one example is expanded.
 for i,y in enumerate(sy):
  for target in wy[i*2:i*2+2]:d.arrow(345,y,503,target,0,'seed-wallet')
 for target in sy:d.arrow(785,wy[0],963,target,3,'wallet-candidate')
 d.arrow(1255,sy[0],1403,410,2,'candidate-validation')
 for i,y in enumerate(sy):
  d.rect(85,y-49,260,98,'#ffffff','#c9d6e3',6)
  d.text(215,y-17,L['seeds'][i][0],'node','middle')
  for j,line in enumerate(L['seeds'][i][1]):d.text(215,y+11+23*j,line,'small','middle')
  fill,border,accent=PALETTE[3]
  d.rect(965,y-49,290,98,fill,border,6)
  d.text(1110,y-17,L['candidates'][i][0],'node','middle',accent)
  for j,line in enumerate(L['candidates'][i][1]):d.text(1110,y+11+23*j,line,'small','middle')
 for i,y in enumerate(wy):
  fill,border,accent=(PALETTE[3][2],PALETTE[3][2],'#ffffff') if i==0 else ('#f8fafc','#d3dce6','#61758a')
  d.rect(505,y-21,280,42,fill,border,6)
  d.text(645,y+7,ADDRESSES[i],'node','middle',accent)
 # Short phrases stay at the same three transition centers.
 for i,(x,y) in enumerate([(425,400),(875,400),(1330,410)]):
  top=y-42
  d.rect(x-52,top,104,84,'#f5f8fb','#9eb0c1',7)
  d.text(x,top+18,f'Skill {i+1}','skill-title','middle','#24384d')
  lines=L['skill_phrases'][i]
  first=top+38+(3-len(lines))*9
  for j,line in enumerate(lines):d.text(x,first+j*18,line,'skill-description','middle')
 d.rect(1405,361,310,124,'#ffffff','#c9d6e3',6)
 for i,line in enumerate(L['checks']):d.text(1560,394+29*i,line,'body','middle')
 d.arrow(1560,489,1560,523,2,'validation-report',False,True)
 d.text(1560,554,L['report'],'node','middle')
 for j,line in enumerate(L['outcomes']):d.text(1560,584+26*j,line,'small','middle')
 d.arrow(1560,624,1560,659,3,'report-new-alpha',False,True)
 d.rect(1405,666,310,59,PALETTE[3][0],PALETTE[3][1],6)
 d.text(1560,702,L['new'],'body','middle',PALETTE[3][2])
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
 # A single technical scope connects data, research, archived evidence and display.
 d.rect(40,998,1720,182,'#f8fafc','#c9d6e3',8)
 d.text(65,1035,L['technical'],'heading')
 tech_x=[65,510,955,1400]; tech_w=335
 for x,(heading,detail) in zip(tech_x,L['tech']):
  d.rect(x,1056,tech_w,99,'#ffffff','#c9d6e3',8)
  d.text(x+tech_w/2,1092,heading,'node','middle')
  d.text(x+tech_w/2,1125,detail,'small','middle')
 for i in range(3):
  start=tech_x[i]+tech_w+6; end=tech_x[i+1]-7
  d.arrow(start,1114,end,1114,0,'technical-flow')
  d.text((start+end)/2,1099,L['tech_edges'][i],'small','middle')
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
 for i in range(3):m.append(f'        WALLET0 -->|Skill 2| CANDIDATE{i}')
 m.extend(['        CANDIDATE0 -->|Skill 3| CHECK','    end'])
 for i in range(3):m.append(f'    S{i+1}["Skill {i+1}<br/>{" ".join(L["skill_phrases"][i])}"]')
 m.append(f'    S4["{L["coordinate"]}<br/>{"<br/>".join(L["skill_phrases"][3])}"]')
 for i in range(1,4):m.append(f'    S4 -.-> S{i}')
 m.extend([f'    HISTORY["{L["history"]}<br/>{L["history_detail"]}"]',f'    OBSERVE["{L["observe"]}<br/>{L["observe_detail"]}"]','    HISTORY --> FLOW','    HISTORY --> OBSERVE','    OBSERVE -.-> FLOW',f'    %% {L["example"]}',f'    %% {L["observe_note"]}'])
 m.append(f'    style WALLET0 fill:{PALETTE[3][2]},stroke:{PALETTE[3][2]},color:#ffffff')
 for i in range(1,6):m.append(f'    style WALLET{i} fill:#f8fafc,stroke:#d3dce6')
 for i in range(3):m.append(f'    style CANDIDATE{i} fill:{PALETTE[3][0]},stroke:{PALETTE[3][1]}')
 m.extend([f'    subgraph TECH["{L["technical"]}"]','        direction LR'])
 for i,(heading,detail) in enumerate(L['tech']):
  m.append(f'        T{i}["{heading}<br/>{detail}"]')
  if i:m.append(f'        T{i-1} -->|{L["tech_edges"][i-1]}| T{i}')
 m.append('    end')
 (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
