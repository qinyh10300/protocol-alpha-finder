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
 d=Diagram(1800,1100,L['title'],L['caption'],lang)
 en=lang=='en'
 d.text(40,40,'PROTOCOL ALPHA FINDER  /  RESEARCH METHOD','label')
 d.text(40,94,L['title'],'title')
 d.text(40,132,'Find proven executors. Study their other actions. Validate each new mechanism.' if en else '找到真实执行者，研究他们的其他操作，再验证每个新机制。','body')
 xs=[40,490,940,1390]; widths=[360,360,360,370]
 for i,(x,w) in enumerate(zip(xs,widths)):
  fill,border,accent=PALETTE[i]
  d.rect(x,173,w,569,'#fafbfd','#e3e9f0',20)
  d.rect(x,173,w,75,fill,border,20)
  d.rect(x+18,190,38,38,accent,accent,19)
  d.text(x+37,216,str(i+1),'node','middle','#ffffff')
  d.text(x+69,216,L['heads'][i].split('  ',1)[1],'node')
  d.text(x+20,280,L['subheads'][i],'small')
 sy=[369,512,655]; wy=[337,401,480,544,623,687]
 for i,y in enumerate(sy):
  for target in wy[i*2:i*2+2]:d.arrow(382,y,507,target,0,'seed-wallet')
 for i,y in enumerate(wy):d.arrow(832,y,957,sy[i//2],1,'wallet-candidate')
 for y in sy:d.arrow(1282,y,1407,512,2,'candidate-validation')
 for i,y in enumerate(sy):
  d.rect(58,y-53,324,106,'#ffffff','#dce5ef',12)
  d.text(78,y-19,L['seeds'][i][0],'node')
  for j,line in enumerate(L['seeds'][i][1]):d.text(78,y+12+23*j,line,'small')
  d.rect(958,y-53,324,106,'#ffffff','#ded4ed',12)
  d.text(978,y-19,L['candidates'][i][0],'node')
  for j,line in enumerate(L['candidates'][i][1]):d.text(978,y+12+23*j,line,'small')
 for i,y in enumerate(wy):
  d.rect(508,y-27,324,54,'#ffffff','#dce5ef',10)
  d.rect(520,y-17,34,34,PALETTE[0][0],'none',8)
  d.text(537,y+7,chr(65+i),'node','middle',PALETTE[0][2])
  d.text(566,y+6,L['wallets'][i][1],'body',color='#24384d')
 d.rect(1408,316,334,170,'#ffffff','#c9e5d9',12)
 for i,(a,b) in enumerate(([('Mechanism','Does the evidence explain it?'),('Economics','Do rewards exceed costs?'),('Availability','Can it be executed now?')] if en else [('机制','证据是否支持这个机制？'),('收益','奖励能否覆盖成本？'),('可用性','当前条件是否允许执行？')])):
  d.text(1428,346+49*i,a,'node')
  d.text(1428,367+49*i,b,'small')
 d.text(1428,528,'A report for every candidate' if en else '每个候选都有一份报告','body',color='#24384d')
 for j,line in enumerate(L['outcomes']):d.text(1428,558+26*j,line,'small')
 d.rect(1408,618,334,90,PALETTE[3][0],PALETTE[3][1],12)
 d.text(1428,652,L['new'][0],'node',color=PALETTE[3][2])
 d.text(1428,682,L['new'][1],'small')
 d.text(40,801,'THE FOUR SKILLS' if en else '四个 SKILL 的具体工作','label')
 explanations=([
 ['We identify wallets that executed seed','mechanisms and verify their roles','using transaction receipts.'],
 ['We trace each wallet’s history to','uncover repeated actions and propose','new mechanisms.'],
 ['We test each candidate against','transaction evidence, execution costs,','and current protocol conditions.'],
 ['We coordinate the three research steps,','preserve evidence, and select what','to investigate next.']
 ] if en else [
 ['我们从已知机制的执行记录中找到钱包，','再通过交易回执核验其真实执行角色。'],
 ['我们追踪每个钱包的完整历史，','从重复操作中提出新的机制假设。'],
 ['我们结合交易证据、执行成本与','协议当前条件，逐个检验候选机制。'],
 ['我们协调三个研究步骤、保留证据，','并确定下一轮需要研究的对象。']])
 for i,x in enumerate([40,478,916,1354]):
  fill,border,accent=PALETTE[i]
  d.rect(x,820,406,203,fill,border,16)
  d.text(x+22,853,f'Skill {i+1} · {L["skill_names"][i]}','node',color=accent)
  for j,line in enumerate(explanations[i]):d.text(x+22,893+26*j,line,'body',color='#344b60')
  d.text(x+22,1000,SKILLS[i],'small')
 d.text(40,1070,L['caption'],'small')
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
 for i,name in enumerate(SKILLS):m.append(f'        S{i}["Skill {i+1} · {L["skill_names"][i]}<br/>{" ".join(explanations[i])}<br/>{name}"]')
 m.append('    end')
 for i in range(4):m.append(f'    style S{i} fill:{PALETTE[i][0]},stroke:{PALETTE[i][1]}')
 (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
