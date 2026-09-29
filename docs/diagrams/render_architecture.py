"""Render the numbered four-Skill method, with explicit two-wallet seed fan-out."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKILLS = ['alpha-seed-wallets', 'wallet-alpha-investigation', 'protocol-alpha-validation', 'protocol-alpha-discovery']
COLORS = [('#edf4ff', '#b7cff5', '#5c88cc'), ('#f4effc', '#d3c2ee', '#9671be'), ('#fff5e5', '#ecd1a2', '#c19349'), ('#edf6f0', '#bad8c6', '#4d8064')]
LABELS = {
    'en': {
        'title': 'From Three Alpha Seeds to New Alpha',
        'actions': ['Find & verify wallets', 'Investigate history', 'Validate Alpha', 'Coordinate the pipeline'],
        'headers': ['Alpha Seeds', 'Strategy Wallets', 'Alpha Candidates', 'Validation Outcomes'],
        'summaries': [
            ['Three known mechanisms', 'provide starting points', 'for wallet discovery.'],
            ['Wallets with verified execution', 'become targets for', 'deeper research.'],
            ['Repeated wallet behaviors', 'suggest mechanisms worth', 'testing with evidence.'],
            ['Validate mechanisms and current', 'conditions before reporting', 'new Alpha.'],
        ],
        'seeds': [
            ['Energy Rental', ['Liquidate depleted rental', 'orders to recover resources', 'and earn rewards.']],
            ['JustLend', ['Repay undercollateralized', 'loans and receive seized', 'collateral through liquidation.']],
            ['USDD', ['Trigger liquidations, restart', 'auctions, or buy collateral', 'through keeper actions.']],
        ],
        'wallets': [
            ['Wallet A', 'Rental liquidations'], ['Wallet B', 'Resource bundling'],
            ['Wallet C', 'Lending liquidations'], ['Wallet D', 'Collateral redemption'],
            ['Wallet E', 'Keeper actions'], ['Wallet F', 'Auction purchases'],
        ],
        'candidates': [
            ['Rental sequence', ['Bundled rental and liquidation', 'may lower execution costs', 'within one transaction.']],
            ['Collateral recycling', ['Redeeming collateral for swaps', 'may recycle capital faster', 'after a liquidation.']],
            ['Auction timing', ['Auction resets may create', 'temporary discounts worth testing', 'against execution costs.']],
        ],
        'checks': ['Mechanism · State · Costs'],
        'new_alpha': ['New Alpha', 'If validation supports it'],
        'report': ['Alpha Report', 'Evidence + next checks', 'For every candidate'],
        'caption': 'Method illustration: two wallets per seed. USDD wallets and the auction candidate are illustrative, not recorded findings.',
        'description': 'Skill 1 finds two illustrative wallets from each of three Alpha seeds through six arrows. Skill 2 investigates all six wallets to form three candidate mechanisms. Skill 3 validates mechanisms and current conditions to produce reports and conditional new Alpha. Skill 4 coordinates the full workflow. Stages are numbered separately from Skills.',
    },
    'zh-CN': {
        'title': '从三个 Alpha Seed 发现新的 Alpha',
        'actions': ['发现并核验钱包', '研究钱包历史', '验证候选', '协调整条研究流程'],
        'headers': ['Alpha Seed', '策略钱包', 'Alpha 候选', 'Validation · 验证结果'],
        'summaries': [
            ['从三个已知协议机制出发，', '寻找真实执行过它们的钱包。'],
            ['以已核验的执行行为为依据，', '筛选值得进一步研究的钱包。'],
            ['从重复的钱包行为形成假设，', '再用交易证据逐项检验。'],
            ['核验机制与当前执行条件，', '再判断能否形成新的 Alpha。'],
        ],
        'seeds': [
            ['Energy Rental', ['清算保证金不足的订单，', '回收资源，', '并获得协议奖励。']],
            ['JustLend', ['偿还抵押不足头寸的债务，', '通过协议清算，', '获得被清算的抵押品。']],
            ['USDD', ['触发清算、重启拍卖，', '或通过 keeper 操作', '购买抵押品。']],
        ],
        'wallets': [
            ['钱包 A', '租赁清算'], ['钱包 B', '资源组合操作'],
            ['钱包 C', '借贷清算'], ['钱包 D', '抵押品赎回'],
            ['钱包 E', 'Keeper 操作'], ['钱包 F', '拍卖购买'],
        ],
        'candidates': [
            ['租赁组合操作', ['在同一交易中组合租赁与清算，', '可能降低', '整体执行成本。']],
            ['抵押品回收', ['清算后赎回并兑换抵押品，', '可能更快地', '回收占用资金。']],
            ['拍卖时机', ['拍卖重启可能出现短暂折价，', '需要结合执行成本', '验证是否成立。']],
        ],
        'checks': ['机制 · 当前状态 · 成本'],
        'new_alpha': ['新的 Alpha', '验证支持后产出'],
        'report': ['Alpha 报告', '证据与后续检查', '每个候选均有报告'],
        'caption': '方法示意：每个 Seed 展开两个钱包。USDD 钱包与拍卖候选是流程示例，不是本次留档发现。',
        'description': 'Skill 1 通过六条箭头从三个 Alpha Seed 各找到两个示意钱包，Skill 2 研究六个钱包形成三类候选机制，Skill 3 核验机制与当前条件并输出报告及有条件的新 Alpha，Skill 4 协调全流程。阶段编号与 Skill 编号分别标注。',
    },
}


def render(lang, labels):
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="2280" height="1140" viewBox="0 0 2280 1140" role="img" aria-labelledby="title desc" xml:lang="{lang}">
<title id="title">{escape(labels['title'])}</title><desc id="desc">{escape(labels['description'])}</desc><defs>''']
    for i, (_, _, accent) in enumerate(COLORS):
        size = 7 if i == 3 else 11
        parts.append(f'<marker id="arrow-{i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="{size}" markerHeight="{size}" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 L 2.5 5 Z" fill="{accent}"/></marker>')
    parts.append('''</defs><style>
text { font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; fill: #23374c; }
.heading { font-size: 34px; font-weight: 700; }
.section { font-size: 22px; font-weight: 650; }
.node { font-size: 22px; font-weight: 600; }
.sub { font-size: 17px; fill: #647b91; }
.skill { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 15px; }
.action { font-size: 19px; font-weight: 600; }
.number { font-size: 17px; font-weight: 700; fill: #748a9e; }
.caption { font-size: 17px; fill: #7c8d9e; }
</style><rect width="2280" height="1140" fill="#ffffff"/>''')

    def text(x, y, value, cls='sub', anchor='middle', color=None):
        fill = f' style="fill:{color}"' if color else ''
        parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{fill}>{escape(value)}</text>')

    def rect(x, y, w, h, fill='#ffffff', stroke='#dce5ef', radius=18):
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="1.3"/>')

    def curve(x1, y1, x2, y2, color, kind, width=3.2, dashed=False):
        dx = (x2 - x1) * .48
        d = f'M {x1} {y1} C {x1+dx} {y1} {x2-dx} {y2} {x2} {y2}'
        style = ' stroke-dasharray="4 7" opacity="0.4"' if dashed else ''
        parts.append(f'<path data-kind="{kind}" d="{d}" fill="none" stroke="{COLORS[color][2]}" stroke-width="{width}" stroke-linecap="round" marker-end="url(#arrow-{color})"{style}/>')

    text(40, 54, labels['title'], 'heading', 'start')
    # Skill 4 coordinates the three transformation Skills, rather than following them.
    for cx in [500, 1120, 1770]:
        parts.append(f'<path data-kind="orchestration" d="M 1140 197 C 1140 238 {cx} 220 {cx} 266" fill="none" stroke="{COLORS[3][2]}" stroke-width="1.6" stroke-dasharray="4 7" opacity="0.5" marker-end="url(#arrow-3)"/>')

    columns = [(40, 300), (660, 300), (1280, 340), (1920, 320)]
    for i, (x, w) in enumerate(columns):
        rect(x, 360, w, 710, '#fbfcfe')
        text(x+24, 403, f'0{i+1}', 'number', 'start')
        text(x+62, 403, labels['headers'][i], 'section', 'start')
        for j, line in enumerate(labels['summaries'][i]):
            text(x+24, 439+24*j, line, 'sub', 'start')
        parts.append(f'<path d="M {x+24} 506 H {x+w-24}" stroke="#e5ebf2"/>')

    seed_y = [595, 775, 955]
    wallet_y = [550, 640, 730, 820, 910, 1000]
    # Exactly two direct arrows per seed, with no bus hiding their destinations.
    for i, sy in enumerate(seed_y):
        for wy in wallet_y[2*i:2*i+2]:
            curve(320, sy, 678, wy, 0, 'seed-wallet')
    for i, wy in enumerate(wallet_y):
        curve(940, wy, 1298, seed_y[i//2], 1, 'wallet-candidate')
    for sy in seed_y:
        curve(1600, sy, 1910, 775, 2, 'candidate-validation')

    for i, cy in enumerate(seed_y):
        rect(60, cy-73, 260, 146, '#f5f9ff', '#d7e5f7', 13)
        text(80, cy-36, labels['seeds'][i][0], 'node', 'start')
        for j, line in enumerate(labels['seeds'][i][1]):
            text(80, cy-5+25*j, line, 'sub', 'start')
        rect(1300, cy-73, 300, 146, '#faf7ff', '#e2d9f0', 13)
        text(1320, cy-36, labels['candidates'][i][0], 'node', 'start')
        for j, line in enumerate(labels['candidates'][i][1]):
            text(1320, cy-5+25*j, line, 'sub', 'start')

    for i, cy in enumerate(wallet_y):
        rect(680, cy-34, 260, 68, '#ffffff', '#e0e7ef', 12)
        text(700, cy-4, labels['wallets'][i][0], 'node', 'start')
        text(700, cy+21, labels['wallets'][i][1], 'sub', 'start')

    # One numbered Skill box above each whole bundle of arrows.
    for i, (cx, w) in enumerate([(500, 280), (1120, 280), (1770, 260)]):
        fill, border, accent = COLORS[i]
        rect(cx-w/2, 268, w, 86, fill, border, 14)
        text(cx, 295, f'Skill {i+1} · {labels["actions"][i]}', 'action', color=accent)
        text(cx, 327, SKILLS[i], 'skill', color=accent)
    rect(850, 108, 580, 88, COLORS[3][0], COLORS[3][1], 16)
    text(1140, 141, f'Skill 4 · {labels["actions"][3]}', 'action', color=COLORS[3][2])
    text(1140, 172, SKILLS[3], 'skill', color=COLORS[3][2])

    text(2080, 547, labels['checks'][0], 'sub')
    rect(1944, 600, 272, 130, '#edf6f0', '#cce2d5', 14)
    text(1968, 650, labels['new_alpha'][0], 'node', 'start', COLORS[3][2])
    text(1968, 686, labels['new_alpha'][1], 'sub', 'start')
    rect(1944, 840, 272, 155, '#ffffff', '#e0e7ef', 14)
    for dy, line in zip([45, 81, 116], labels['report']):
        text(1968, 840+dy, line, 'node' if dy == 45 else 'sub', 'start')
    text(1140, 1114, labels['caption'], 'caption')
    parts.append('</svg>\n')
    (ROOT.parent/'images'/f'system-architecture-{lang}.svg').write_text('\n'.join(parts))

    m = ['%% Skill 1 labels six seed-to-wallet arrows once. Wallets are illustrative.', 'flowchart LR']
    for group, key in [('SEEDS', 'seeds'), ('WALLETS', 'wallets'), ('CANDIDATES', 'candidates')]:
        idx = ['SEEDS', 'WALLETS', 'CANDIDATES'].index(group)
        m.append(f'    subgraph {group}["0{idx+1} · {labels["headers"][idx]}"]')
        for i, card in enumerate(labels[key]):
            lines = [card[0], *card[1]] if isinstance(card[1], list) else card
            m.append(f'        {group}{i}["{"<br/>".join(lines)}"]')
        m.append('    end')
    m.extend([f'    subgraph RESULTS["04 · {labels["headers"][3]}"]', f'        ALPHA["{"<br/>".join(labels["new_alpha"])}"]', f'        REPORT["{"<br/>".join(labels["report"])}"]', '    end'])
    for i in range(3):
        for j in range(2*i, 2*i+2):
            m.append(f'    SEEDS{i} --> WALLETS{j}')
            m.append(f'    WALLETS{j} --> CANDIDATES{i}')
        m.append(f'    CANDIDATES{i} --> RESULTS')
    for i, skill in enumerate(SKILLS):
        m.append(f'    S{i}["Skill {i+1} · {labels["actions"][i]}<br/>{skill}"]')
        m.append(f'    style S{i} fill:{COLORS[i][0]},stroke:{COLORS[i][1]}')
    m.extend(['    S0 -.- WALLETS', '    S1 -.- CANDIDATES', '    S2 -.- RESULTS', '    S3 -.-> S0', '    S3 -.-> S1', '    S3 -.-> S2'])
    (ROOT/f'system-architecture-{lang}.mmd').write_text('\n'.join(m)+'\n')


if __name__ == '__main__':
    for language, content in LABELS.items():
        render(language, content)
