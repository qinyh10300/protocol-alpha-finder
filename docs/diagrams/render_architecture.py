"""Render the research pipeline with every Skill in a separate bottom strip."""
from pathlib import Path
from svg_diagram import Diagram, PALETTE

ROOT = Path(__file__).resolve().parent
SKILLS = ['alpha-seed-wallets', 'wallet-alpha-investigation', 'protocol-alpha-validation', 'protocol-alpha-discovery']
LABELS = {
 'en': {
  'title':'From Seed Alpha to New Alpha',
  'heads':['01  ALPHA SEEDS','02  STRATEGY WALLETS','03  ALPHA CANDIDATES','04  VALIDATION'],
  'subheads':['Known mechanisms to start from','Verified executors to investigate','Hypotheses from wallet behavior','Mechanism · State · Costs'],
  'seeds':[
   ['Energy Rental',['Clear depleted rental orders,','recover resources and rewards.']],
   ['JustLend',['Repay undercollateralized loans','and receive seized collateral.']],
   ['USDD',['Trigger liquidation, restart auctions,','or purchase auction collateral.']]],
  'wallets':[['Wallet A','Rental liquidations'],['Wallet B','Resource bundling'],['Wallet C','Lending liquidations'],['Wallet D','Collateral redemption'],['Wallet E','Keeper actions'],['Wallet F','Auction purchases']],
  'candidates':[['Rental sequence',['Bundled calls may lower','execution costs.']],['Collateral recycling',['Redeem + swap may release','capital sooner.']],['Auction timing',['Temporary discounts may justify','a closer look at execution costs.']]],
  'new':['New Alpha','Only if validation supports it'],
  'report':['Alpha Report','Evidence + next checks','For every candidate'],
  'outcomes':['Actionable · Monitor','Rejected · Insufficient Evidence'],
  'skill_names':['Find & verify wallets','Investigate history','Validate candidates','Coordinate Skills 1–3'],
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
 d=Diagram(2100,960,L['title'],L['caption'],lang)
 d.text(40,55,L['title'],'title')
 cols=[40,570,1110,1700]
 for x,head,sub in zip(cols,L['heads'],L['subheads']):
  d.text(x,137,head,'heading')
  d.text(x,173,sub,'small')
 seed_y=[310,470,630]; wallet_y=[270,350,430,510,590,670]
 # Draw curves behind the cards, preserving all six individual connections.
 for i,sy in enumerate(seed_y):
  for wy in wallet_y[2*i:2*i+2]:d.arrow(320,sy,568,wy,0,'seed-wallet')
 for i,wy in enumerate(wallet_y):d.arrow(840,wy,1108,seed_y[i//2],1,'wallet-candidate')
 for sy in seed_y:d.arrow(1440,sy,1690,470,2,'candidate-validation')
 for i,cy in enumerate(seed_y):
  d.rect(40,cy-61,280,122,'#f7faff','#dce6f4')
  d.text(60,cy-22,L['seeds'][i][0],'node')
  for j,line in enumerate(L['seeds'][i][1]):d.text(60,cy+11+25*j,line,'small')
  d.rect(1110,cy-61,330,122,'#fcfaff','#e4dcef')
  d.text(1130,cy-22,L['candidates'][i][0],'node')
  for j,line in enumerate(L['candidates'][i][1]):d.text(1130,cy+11+25*j,line,'body')
 for i,cy in enumerate(wallet_y):
  d.rect(570,cy-31,270,62)
  d.text(590,cy-3,L['wallets'][i][0],'node')
  d.text(590,cy+21,L['wallets'][i][1],'small')
 d.rect(1700,249,360,452,'#fbfcfe')
 d.rect(1720,291,320,126,PALETTE[3][0],PALETTE[3][1])
 d.text(1744,340,L['new'][0],'node',color=PALETTE[3][2])
 d.text(1744,376,L['new'][1],'body')
 d.line(1724,462,2036,462)
 d.text(1744,538,L['report'][0],'node')
 d.text(1744,577,L['report'][1],'body')
 d.text(1744,610,L['report'][2],'small')
 for j,line in enumerate(L['outcomes']):d.text(1744,649+24*j,line,'label')
 # Skills are entirely below the flow; colors map them to the arrows above.
 d.line(40,751,2060,751)
 for i,x in enumerate([40,555,1070,1585]):
  fill,border,accent=PALETTE[i]
  d.rect(x,786,475,92,fill,border,14)
  d.text(x+22,823,f'Skill {i+1} · {L["skill_names"][i]}','node',color=accent)
  d.text(x+22,854,SKILLS[i],'code',color=accent)
 d.text(1050,924,L['caption'],'small','middle')
 d.save(ROOT.parent/'images'/f'system-architecture-{lang}.svg')
 m=['%% Skill labels belong below the flow in the SVG illustration.','flowchart LR']
 for group,key in [('SEED','seeds'),('WALLET','wallets'),('CANDIDATE','candidates')]:
  for i,row in enumerate(L[key]):
   parts=[row[0],*row[1]] if isinstance(row[1],list) else row
   m.append(f'    {group}{i}["{"<br/>".join(parts)}"]')
 for i in range(3):
  for j in [2*i,2*i+1]:m.extend([f'    SEED{i} --> WALLET{j}',f'    WALLET{j} --> CANDIDATE{i}'])
  m.append(f'    CANDIDATE{i} --> VALIDATION')
 m.extend([f'    VALIDATION["{L["heads"][3]}"]',f'    NEW["{"<br/>".join(L["new"])}"]',f'    REPORT["{"<br/>".join(L["report"])}"]','    VALIDATION --> NEW','    VALIDATION --> REPORT'])
 m.append('    subgraph SKILLS["Skills"]')
 for i,name in enumerate(SKILLS):m.append(f'        S{i}["Skill {i+1} · {L["skill_names"][i]}<br/>{name}"]')
 m.append('    end')
 for i in range(4):m.append(f'    style S{i} fill:{PALETTE[i][0]},stroke:{PALETTE[i][1]}')
 (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
