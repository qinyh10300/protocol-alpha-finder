const $ = (id) => document.getElementById(id);
const stages = ['Seed', 'Wallet', 'Candidate', 'Validation'];
let scenarios = [], selected = 0, stage = 0, timer;
function stop() { clearInterval(timer); timer = undefined; $('replay').textContent = '开始流程演示'; }
function el(tag, text, className) { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; }
function render() {
 const s = scenarios[selected];
 $('seeds').replaceChildren(...scenarios.map((item, index) => {
  const b = el('button', '', `seed ${index === selected ? 'selected' : ''}`);
  b.setAttribute('aria-pressed', String(index === selected));
  b.append(el('span', item.tier, 'tier'), el('strong', item.name), el('p', item.why));
  b.onclick = () => { stop(); selected = index; stage = 0; render(); }; return b;
 }));
 $('steps').replaceChildren(...stages.map((name, index) => {
  const b = el('button', `${String(index + 1).padStart(2, '0')} ${name}`, `step ${index === stage ? 'current' : index < stage ? 'done' : ''}`);
  if (index === stage) b.setAttribute('aria-current', 'step');
  b.onclick = () => { stop(); stage = index; render(); }; return b;
 }));
 $('progress').textContent = `示例步骤 ${stage + 1} / 4`;
 const d = $('detail'); d.replaceChildren();
 if (stage === 0) d.append(el('h3', s.name), el('p', s.why), el('p', '研究入口：从可识别的协议机制出发，核验真实执行者。'));
 if (stage === 1) d.append(el('h3', 'A wallet is a research path.'), el('span', s.wallet, 'wallet'), el('p', '虚构钱包标识。真实研究需从成功交易中解析实际调用者、代理与奖励接收者，避免把路由合约误认成策略钱包。'));
 if (stage === 2) {
  const seq = el('div', '', 'sequence'); seq.append(...s.sequence.map(x => el('span', x)));
  d.append(el('h3', s.candidate), seq, el('p', s.hypothesis));
 }
 if (stage === 3) {
  const list = el('ul', ''); list.append(...s.missing.map(x => el('li', x)));
  d.append(el('h3', 'Evidence before confidence.'), el('p', '当前状态：UNCERTAIN。以下证据缺失，候选不能升级为已验证 Alpha。'), list);
 }
 $('risks').textContent = s.risks.join(' · ');
}
$('replay').onclick = () => {
 if (timer) { stop(); return; }
 stage = 0; render(); $('replay').textContent = '暂停演示';
 timer = setInterval(() => { stage++; render(); if (stage === 3) stop(); }, 1600);
};
try {
 const res = await fetch('../demo/scenarios.json');
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 if (!Array.isArray(data.scenarios) || !data.scenarios.length) throw new Error('Missing scenarios');
 scenarios = data.scenarios; render(); $('replay').disabled = false;
} catch (error) { $('seeds').textContent = '示例加载失败。请从仓库根目录启动 HTTP 服务后刷新。'; $('progress').textContent = 'Load failed'; console.error(error); }
