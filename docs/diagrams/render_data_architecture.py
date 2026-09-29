"""Draw the evidence-to-wallet research cycle without storage implementation details."""
from pathlib import Path
from svg_diagram import Diagram, PALETTE

ROOT=Path(__file__).resolve().parent
LABELS={
'en':{
 'title':'How history reveals the next Alpha',
 'subtitle':'Historical evidence identifies strategy wallets. Fresh activity gives us the next research question.',
 'heads':['Read historical evidence','Find repeatable behavior','Identify strategy wallets','Observe fresh activity','Form a new Alpha candidate','Validate and learn'],
 'rows':[
  [('Contract calls','Which functions did the wallet execute?'),('Receipts & event logs','Did those actions actually succeed?'),('Token transfers & fees','What entered, left, and remained?'),('Protocol state','What conditions made the action possible?')],
  [('Match known seed actions','Link successful calls to their executors.'),('Reconstruct the sequence','Follow calls, asset movements, and costs.'),('Compare repeated executions','Separate recurring behavior from one-offs.')],
  [('Keep the actual executor','Distinguish wallets from relayers and helpers.'),('Attach the evidence','Record the seed, calls, receipts, and role.'),('Build a research shortlist','Investigate each wallet beyond its seed.')],
  [('Read new transactions','Look for new contracts and call sequences.'),('Compare with wallet history','Find changed behavior and repeated actions.'),('Recheck protocol conditions','See whether earlier opportunities reappear.')],
  [('Describe the possible mechanism','Explain how the observed actions earn value.'),('Attach supporting executions','Keep transaction evidence and cost estimates.'),('Write a checkable hypothesis','State what would confirm or disprove it.')],
  [('Test evidence, costs, and current state','Separate an observed pattern from an edge.'),('Produce a report for every candidate','Evidence, outcome, and the next checks to run.'),('Expand only after validation','An established mechanism can become a seed.')]
 ],
 'tags':['INPUT: ON-CHAIN HISTORY','ANALYSIS: ACTIONS + ASSET FLOWS','OUTPUT: EVIDENCE-BACKED WALLETS','MONITORING: NEW ACTIVITY + STATE','OUTPUT: HYPOTHESIS + EVIDENCE','OUTPUT: REPORT + NEXT CHECKS'],
 'handoff':['verified executors','wallet shortlist','new behavior','candidate + evidence'],
 'loop':'Use an established mechanism as a new seed; repeat with fresh evidence.',
 'note':'Monitoring describes repeated collection and review. The current workflow runs these checks manually.',
},
'zh-CN':{
 'title':'从历史数据找到下一个 Alpha',
 'subtitle':'历史证据帮助识别策略钱包；钱包的新活动提出下一轮需要验证的问题。',
 'heads':['读取历史证据','识别重复行为','找到策略钱包','观察新增活动','形成新的 Alpha 候选','验证并继续研究'],
 'rows':[
  [('合约调用','钱包调用了哪些合约与函数？'),('交易回执与事件日志','这些操作是否真正执行成功？'),('代币流动与费用','哪些资产流入、流出，最终剩余多少？'),('协议状态','什么条件让这次操作成为可能？')],
  [('匹配已知 Seed 操作','从成功调用中找到真实执行者。'),('还原执行过程','串联合约调用、资产流动与执行成本。'),('对比多次执行','区分重复行为与偶发操作。')],
  [('保留真实执行者','区分钱包、中继者与辅助合约。'),('附上可追溯的证据','记录入口、调用、回执及执行角色。'),('形成待研究的钱包名单','继续研究钱包在原始 Seed 之外的活动。')],
  [('读取新增交易','寻找新合约与新的调用序列。'),('与已有钱包历史对比','识别行为变化和重复发生的操作。'),('重新检查协议条件','观察先前的机会是否再次出现。')],
  [('描述可能成立的机制','解释这些操作如何产生收益。'),('保留支持这一判断的执行记录','附交易证据与成本估计。'),('写出可以检验的假设','说明什么证据能够支持或推翻它。')],
  [('检查证据、成本和当前状态','判断观察到的行为是否构成实际优势。'),('为每个候选生成报告','可执行 · 持续观察 · 已排除 · 证据不足'),('验证支持后再扩展','已确认的机制可以成为新的 Seed。')]
 ],
 'tags':['输入：链上历史数据','分析：操作序列与资产流','产出：有执行证据的钱包','监控：新增活动与协议状态','产出：候选假设与支持证据','产出：报告与后续检查'],
 'handoff':['已核验的执行记录','策略钱包名单','新行为','候选与证据'],
 'loop':'将已确认的机制作为新 Seed，结合新增证据继续下一轮研究。',
 'note':'这里的监控指重复采集与复查；当前工作流通过手动运行完成这些检查。',
}}


def render(lang,L):
 d=Diagram(1800,1110,L['title'],L['subtitle'],lang)
 d.text(40,40,'PROTOCOL ALPHA FINDER  /  EVIDENCE CYCLE','label')
 d.text(40,94,L['title'],'title');d.text(40,134,L['subtitle'],'body')
 positions=[(40,195),(640,195),(1240,195),(1240,635),(640,635),(40,635)]
 colors=[0,1,0,1,2,3]
 # A conventional serpentine process: left-to-right, then right-to-left.
 for a,b,y,c,k in [(560,638,390,0,'history-analysis'),(1160,1238,390,0,'analysis-wallet'),(1238,1162,823,1,'monitor-candidate'),(638,562,823,2,'candidate-validation')]:
  d.arrow(a,y,b,y,c,k)
 d.arrow(1500,555,1500,627,0,'wallet-monitor',False,True)
 for i,(x,y) in enumerate(positions):
  fill,border,accent=PALETTE[colors[i]]
  d.rect(x,y,520,360,'#ffffff',border,18)
  d.rect(x,y,520,78,fill,border,18)
  d.rect(x+22,y+20,38,38,accent,accent,19)
  d.text(x+41,y+47,str(i+1),'node','middle','#ffffff')
  d.text(x+76,y+48,L['heads'][i],'heading')
  spacing=55 if i==0 else 71
  for j,(title,desc) in enumerate(L['rows'][i]):
   yy=y+112+j*spacing
   d.text(x+24,yy,title,'node')
   d.text(x+24,yy+25,desc,'body')
  d.line(x+24,y+316,x+496,y+316)
  d.text(x+24,y+342,L['tags'][i],'label',color=accent)
 # The loop returns only established mechanisms, not unverified hypotheses.
 d.arrow(300,633,300,563,3,'validated-seed-loop',True,True)
 d.text(340,597,L['loop'],'small',color=PALETTE[3][2])
 d.text(40,1090,L['note'],'small')
 d.save(ROOT.parent/'images'/f'data-architecture-{lang}.svg')
 m=['flowchart LR']
 for i,head in enumerate(L['heads']):
  rows='<br/>'.join(title for title,_ in L['rows'][i])
  m.append(f'    N{i}["{i+1}. {head}<br/>{rows}"]')
  if i:m.append(f'    N{i-1} --> N{i}')
 m.append(f'    N5 -. "{L["loop"]}" .-> N0')
 (ROOT/f'data-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__=='__main__':
 for lang,labels in LABELS.items():render(lang,labels)
