"""Render the research pipeline with every Skill in a separate bottom strip."""
from pathlib import Path
from svg_diagram import Diagram, PALETTE

ROOT = Path(__file__).resolve().parent
SKILLS = ['alpha-seed-wallets', 'wallet-alpha-investigation', 'protocol-alpha-validation', 'protocol-alpha-discovery']
LABELS = {
 'en': {
  'title':'From Seed Alpha to New Alpha',
  'heads':['01  Alpha Seeds','02  Strategy Wallets','03  Alpha Candidates','04  Validation'],
  'subheads':['Three known protocol mechanisms','Two illustrative wallets per seed','Explain why each idea is worth testing','Test the claim, then report the result'],
  'seeds':[
   ['Energy Rental',['Clear depleted rental orders,','recover resources and rewards.']],
   ['JustLend',['Repay undercollateralized loans','and receive seized collateral.']],
   ['USDD',['Trigger liquidation, restart auctions,','or purchase auction collateral.']]],
  'wallets':[['Wallet A','Rental liquidations'],['Wallet B','Resource bundling'],['Wallet C','Lending liquidations'],['Wallet D','Collateral redemption'],['Wallet E','Keeper actions'],['Wallet F','Auction purchases']],
  'candidates':[['Rental sequence',['Bundled calls may lower','execution costs.']],['Collateral recycling',['Redeem + swap may release','capital sooner.']],['Auction timing',['Temporary discounts may justify','a closer look at execution costs.']]],
  'new':['New Alpha','Only if validation supports it'],
  'report':['Alpha Report','Evidence + next checks','For every candidate'],
  'outcomes':['Actionable · Monitor','Rejected · Insufficient Evidence'],
  'skill_names':['Find wallets','Investigate wallets','Validate candidates','Direct the research'],
  'caption':'Method illustration · Two wallets per seed · USDD wallets and auction hypothesis are illustrative, not recorded findings.',
 },
 'zh-CN': {
  'title':'从 Seed Alpha 发现新的 Alpha',
  'heads':['01  ALPHA SEED','02  策略钱包','03  ALPHA 候选','04  VALIDATION 验证'],
  'subheads':['从已知协议机制出发','寻找值得研究的真实执行者','从钱包行为形成候选假设','机制 · 当前状态 · 成本'],
  'seeds':[['Energy Rental',['清算保证金不足的租赁订单，','回收资源并获得奖励。']],['JustLend',['偿还抵押不足头寸的债务，','获得被清算的抵押品。']],['USDD',['触发清算、重启拍卖，','或购买拍卖中的抵押品。']]],
  'wallets':[['钱包 A','租赁清算'],['钱包 B','资源组合操作'],['钱包 C','借贷清算'],['钱包 D','抵押品赎回'],['钱包 E','Keeper 操作'],['钱包 F','拍卖购买']],
  'candidates':[['租赁组合操作',['合并调用可能降低','整体执行成本。']],['抵押品回收',['赎回并兑换可能更快','释放占用资金。']],['拍卖时机',['短暂折价可能带来机会，','需要结合执行成本验证。']]],
  'new':['新的 Alpha','验证支持后产出'],
  'report':['Alpha 报告','证据与后续检查','每个候选均有报告'],
  'outcomes':['可执行 · 持续观察','已排除 · 证据不足'],
  'skill_names':['发现并核验钱包','研究钱包历史','验证候选','协调 Skill 1–3'],
  'caption':'方法示意 · 每个 Seed 展开两个钱包 · USDD 钱包与拍卖假设属于示例，不是本次留档发现。',
 }
}


def render(lang, L):
 d=Diagram(1800,1150,L['title'],L['caption'],lang)
 en=lang=='en'
 d.text(32,53,'Protocol Alpha Finder · Research Method' if en else 'Protocol Alpha Finder · 研究方法','title')
 d.arrow(1150,87,1200,87,0,'legend-flow')
 d.text(1210,93,'Evidence & results' if en else '证据与结果','small')
 d.arrow(1430,87,1480,87,3,'legend-coordination',True)
 d.text(1490,93,'Skill coordination' if en else 'Skill 编排','small')
 # Large frames describe research boundaries; nested rectangles hold evidence.
 d.rect(32,130,326,530,'#ffffff','#c9d6e3',8)
 d.text(195,169,'1 · Alpha Seeds' if en else '1 · Alpha Seed','heading','middle')
 d.text(195,200,'Known protocol mechanisms' if en else '已知协议机制','small','middle')
 d.rect(432,130,1336,530,'#fafcfb','#b8d2c6',8)
 d.text(456,169,'Research Workflow' if en else '研究工作流','heading')
 for x,w,title in [(462,326,'2 · Strategy Wallets' if en else '2 · 策略钱包'),(910,350,'3 · Alpha Candidates' if en else '3 · Alpha 候选'),(1390,350,'4 · Validation' if en else '4 · 验证')]:
  d.rect(x,194,w,438,'#ffffff','#c9d6e3',8)
  d.text(x+w/2,228,title,'heading','middle')
 sy=[303,436,569]; wy=[277,329,410,462,543,595]
 for i,y in enumerate(sy):
  for target in wy[i*2:i*2+2]:d.arrow(336,y,480,target,0,'seed-wallet')
 for i,y in enumerate(wy):d.arrow(770,y,928,sy[i//2],1,'wallet-candidate')
 for y in sy:d.arrow(1242,y,1406,322,2,'candidate-validation')
 for i,y in enumerate(sy):
  d.rect(54,y-49,282,98,'#ffffff','#c9d6e3',6)
  d.text(195,y-17,L['seeds'][i][0],'node','middle')
  for j,line in enumerate(L['seeds'][i][1]):d.text(195,y+11+23*j,line,'small','middle')
  d.rect(928,y-49,314,98,'#ffffff','#d8cfe5',6)
  d.text(1085,y-17,L['candidates'][i][0],'node','middle')
  for j,line in enumerate(L['candidates'][i][1]):d.text(1085,y+11+23*j,line,'small','middle')
 for i,y in enumerate(wy):
  d.rect(480,y-21,290,42,'#ffffff','#c9d6e3',6)
  label=f'{chr(65+i)} · {L["wallets"][i][1]}'
  d.text(625,y+6,label,'body','middle',color='#344b60')
 d.rect(1410,254,310,136,'#ffffff','#c9d6e3',6)
 d.text(1565,283,'Check the mechanism' if en else '检验机制是否成立','node','middle')
 checks=['Execution evidence','Rewards minus costs','Current protocol conditions'] if en else ['执行证据','奖励扣除成本','协议当前条件']
 for i,line in enumerate(checks):d.text(1565,313+27*i,line,'body','middle')
 d.arrow(1565,394,1565,418,2,'validation-report',False,True)
 d.text(1565,450,'Alpha Report' if en else 'Alpha 报告','node','middle')
 for j,line in enumerate(L['outcomes']):d.text(1565,478+25*j,line,'small','middle')
 d.arrow(1565,509,1565,532,3,'report-new-alpha',False,True)
 d.rect(1410,535,310,73,PALETTE[3][0],PALETTE[3][1],6)
 d.text(1565,565,L['new'][0],'node','middle',PALETTE[3][2])
 d.text(1565,590,L['new'][1],'small','middle')
 d.text(900,692,'Each candidate receives a report, including when evidence is incomplete.' if en else '每个候选都有报告，包括证据尚不完整的候选。','small','middle')
 explanations=([
 ['We identify wallets that executed seed mechanisms', 'and verify their roles using transaction receipts.'],
 ['We trace each wallet’s history to uncover repeated', 'actions and propose new mechanisms.'],
 ['We test each candidate against transaction evidence,', 'execution costs, and current protocol conditions.'],
 ['We coordinate the three research steps, preserve evidence,', 'and select what to investigate next.']
 ] if en else [
 ['我们从已知机制的执行记录中找到钱包，','再通过交易回执核验其真实执行角色。'],
 ['我们追踪每个钱包的完整历史，','从重复操作中提出新的机制假设。'],
 ['我们结合交易证据、执行成本与','协议当前条件，逐个检验候选机制。'],
 ['我们协调三个研究步骤、保留证据，','并确定下一轮需要研究的对象。']])
 for i,x in enumerate([40,640,1240]):
  fill,border,accent=PALETTE[i]
  d.rect(x,724,520,150,fill,border,8)
  d.text(x+260,757,f'Skill {i+1} · {L["skill_names"][i]}','heading','middle',accent)
  for j,line in enumerate(explanations[i]):d.text(x+260,792+27*j,line,'body','middle')
  d.text(x+260,851,SKILLS[i],'small','middle',accent)
 # The coordinator sits below its three workers; dashed arrows mean control.
 d.parts.append(f'<path data-kind="coordination-bus" d="M 900 947 V 907 M 300 907 H 1500" fill="none" stroke="{PALETTE[3][2]}" stroke-width="1.8" stroke-dasharray="6 6"/>')
 for x in [300,900,1500]:d.arrow(x,907,x,877,3,'skill-coordination',True,True)
 d.rect(1060,891,280,29,'#ffffff','none',0)
 d.text(1200,911,'Coordinates Skills 1–3' if en else '协调 Skill 1–3','small','middle',PALETTE[3][2])
 d.rect(580,947,640,122,PALETTE[3][0],PALETTE[3][1],8)
 d.text(900,977,f'Skill 4 · {L["skill_names"][3]}','heading','middle',PALETTE[3][2])
 for j,line in enumerate(explanations[3]):d.text(900,1007+25*j,line,'body','middle')
 d.text(900,1055,SKILLS[3],'small','middle',PALETTE[3][2])
 d.text(32,1120,L['caption'],'small')
 d.save(ROOT.parent/'images'/f'system-architecture-{lang}.svg')
 m=['%% Solid lines show evidence/results; dashed lines show Skill coordination.','flowchart LR']
 for group,key in [('SEED','seeds'),('WALLET','wallets'),('CANDIDATE','candidates')]:
  if group=='WALLET':m.append('    subgraph RESEARCH["Research Workflow"]')
  label={'SEED':L['heads'][0],'WALLET':L['heads'][1],'CANDIDATE':L['heads'][2]}[group]
  m.append(f'    subgraph {group}S["{label}"]')
  for i,row in enumerate(L[key]):
   parts=[row[0],*row[1]] if isinstance(row[1],list) else row
   m.append(f'        {group}{i}["{"<br/>".join(parts)}"]')
  m.append('    end')
 m.extend([f'    subgraph VALIDATE["{L["heads"][3]}"]',f'    VALIDATION["{"<br/>".join(checks)}"]',f'    NEW["{"<br/>".join(L["new"])}"]',f'    REPORT["{"<br/>".join(L["report"])}<br/>{"<br/>".join(L["outcomes"])}"]','    VALIDATION --> REPORT','    REPORT --> NEW','    end','    end'])
 for i in range(3):
  for j in [2*i,2*i+1]:m.extend([f'    SEED{i} --> WALLET{j}',f'    WALLET{j} --> CANDIDATE{i}'])
  m.append(f'    CANDIDATE{i} --> VALIDATION')
 m.append('    subgraph SKILLS["Skills"]')
 for i,name in enumerate(SKILLS):m.append(f'        S{i}["Skill {i+1} · {L["skill_names"][i]}<br/>{" ".join(explanations[i])}<br/>{name}"]')
 m.append('    end')
 for i in range(3):m.append(f'    S3 -. coordinates .-> S{i}')
 for i in range(4):m.append(f'    style S{i} fill:{PALETTE[i][0]},stroke:{PALETTE[i][1]}')
 (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
