"""Render a compact bilingual discovery pipeline with curved, Skill-labeled transitions."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKILLS = ["protocol-alpha-discovery", "alpha-seed-wallets", "wallet-alpha-investigation", "protocol-alpha-validation"]
COLORS = [
    ("#edf6f0", "#bad8c6", "#4d8064"),
    ("#edf4ff", "#b7cff5", "#5c88cc"),
    ("#f4effc", "#d3c2ee", "#9671be"),
    ("#fff5e5", "#ecd1a2", "#c19349"),
]
LABELS = {
    "en": {
        "title": "From Seed Alpha to New Alpha",
        "orchestrate": "Coordinate the pipeline",
        "headers": ["Alpha Seeds", "Strategy Wallets", "Alpha Candidates", "Outcomes"],
        "seeds": [
            ["Energy Rental", "Rental liquidation"],
            ["JustLend", "Lending liquidation"],
            ["USDD", "Keeper / auction"],
        ],
        "wallets": [
            ["Wallet A · Rental", "Rent → liquidate → return"],
            ["Wallet B · Lending", "Liquidation + cross-pool swaps"],
            ["Wallet C · Lending", "Liquidation + redemption"],
        ],
        "candidates": [
            ["Rental sequence", "Bundled calls may lower costs."],
            ["Collateral recycling", "Redeem + swap may free capital."],
            ["Cross-pool loop", "Price gaps may reward a round trip."],
        ],
        "actions": ["Find & verify", "Investigate history", "Validate mechanism"],
        "new_alpha": ["New Alpha", "If validated"],
        "report": ["Alpha Report", "Evidence + next checks"],
        "caption": "Saved research examples · USDD: no verified wallet in this run · New Alpha remains conditional",
        "description": "Energy Rental, JustLend and USDD seed a four-Skill pipeline. Curved blue, purple and amber arrows connect seed mechanisms, selected wallet behaviors, candidate hypotheses and validation outcomes. A green orchestration Skill coordinates the research. The saved run has no promoted new seed; sources and evidence limits are described in the architecture document.",
    },
    "zh-CN": {
        "title": "从 Seed Alpha 发现新的 Alpha",
        "orchestrate": "协调整条研究流程",
        "headers": ["Alpha Seed", "策略钱包", "Alpha 候选", "验证结果"],
        "seeds": [
            ["Energy Rental", "能量租赁清算"],
            ["JustLend", "借贷清算"],
            ["USDD", "Keeper／拍卖"],
        ],
        "wallets": [
            ["钱包 A · 租赁清算", "租赁 → 清算 → 归还"],
            ["钱包 B · 借贷清算", "清算 + 跨池兑换"],
            ["钱包 C · 借贷清算", "清算 + 抵押品赎回"],
        ],
        "candidates": [
            ["租赁组合操作", "合并调用可能降低执行成本。"],
            ["抵押品回收", "赎回并兑换可能加快资金回收。"],
            ["跨池循环兑换", "往返兑换可能利用池间价差。"],
        ],
        "actions": ["发现并核验", "研究钱包历史", "验证机制"],
        "new_alpha": ["新的 Alpha", "验证成立后产出"],
        "report": ["Alpha 报告", "证据与后续检查"],
        "caption": "留档研究样本 · 本次 USDD 查询无已核验钱包 · 新 Alpha 仍需验证",
        "description": "Energy Rental、JustLend 与 USDD 构成三个研究入口。蓝、紫、橙色曲线及 Skill 标签连接入口机制、钱包行为、候选假设与验证结果，绿色编排 Skill 协调整条流程。留档中尚无候选被提升为新 Seed，样本来源和证据限制见架构文档。",
    },
}


def render(lang, labels):
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1960" height="830" viewBox="0 0 1960 830" role="img" aria-labelledby="title desc" xml:lang="{lang}">
<title id="title">{escape(labels['title'])}</title>
<desc id="desc">{escape(labels['description'])}</desc>
<defs>''']
    for i, (_, _, accent) in enumerate(COLORS):
        size = 7 if i == 0 else 12
        parts.append(f'<marker id="arrow-{i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="{size}" markerHeight="{size}" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 L 2.5 5 Z" fill="{accent}"/></marker>')
    parts.append('''</defs>
<style>
text { font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; fill: #23374c; }
.heading { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
.section { font-size: 23px; font-weight: 650; }
.node { font-size: 21px; font-weight: 600; }
.sub { font-size: 17px; fill: #677c91; }
.skill { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 14px; }
.action { font-size: 19px; font-weight: 600; }
.caption { font-size: 16px; fill: #7c8d9e; }
</style>
<rect width="1960" height="830" fill="#ffffff"/>
''')

    def text(x, y, value, cls="sub", anchor="middle", color=None):
        fill = f' style="fill:{color}"' if color else ''
        parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{fill}>{escape(value)}</text>')

    def rect(x, y, w, h, fill="#ffffff", stroke="#dce5ef", radius=20):
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="1.3"/>')

    def curve(d, color_index, width=4, dashed=False):
        accent = COLORS[color_index][2]
        dash = ' stroke-dasharray="4 7" opacity="0.4"' if dashed else ''
        parts.append(f'<path d="{d}" fill="none" stroke="{accent}" stroke-width="{width}" stroke-linecap="round" marker-end="url(#arrow-{color_index})"{dash}/>')

    text(40, 52, labels["title"], "heading", "start")

    # Soft orchestration links and stronger S curves establish the visual hierarchy.
    curve("M 980 177 C 980 252 400 250 400 393", 0, 1.6, True)
    curve("M 980 177 C 980 250 945 300 945 393", 0, 1.6, True)
    curve("M 980 177 C 980 210 1555 190 1555 393", 0, 1.6, True)
    curve("M 280 475 C 390 475 410 535 512 535", 1)
    curve("M 800 535 C 930 535 958 475 1082 475", 2)
    curve("M 1410 475 C 1540 475 1560 505 1692 505", 3)

    # One calm panel per entity group, with compact rows instead of nested boxes.
    panels = [(40, 270, 240, 'seeds'), (520, 330, 280, 'wallets'), (1090, 270, 320, 'candidates')]
    for column, (x, y, w, key) in enumerate(panels):
        rect(x, y, w, 410, "#fbfcfe")
        text(x + 24, y + 44, labels["headers"][column], "section", "start")
        parts.append(f'<path d="M {x+24} {y+65} H {x+w-24}" stroke="#e5ebf2"/>')
        for i, row in enumerate(labels[key]):
            ry = y + 109 + 103 * i
            text(x + 24, ry, row[0], "node", "start")
            text(x + 24, ry + 29, row[1], "sub", "start")
            if i < 2:
                parts.append(f'<path d="M {x+24} {ry+57} H {x+w-24}" stroke="#edf1f6"/>')

    # The colored label boxes annotate the curves, leaving the arrow direction visible.
    for i, (x, y, w) in enumerate([(294, 394, 212), (820, 394, 250), (1430, 394, 250)], start=1):
        fill, border, accent = COLORS[i]
        rect(x, y, w, 70, fill, border, 14)
        text(x + w/2, y + 27, labels['actions'][i-1], 'action', color=accent)
        text(x + w/2, y + 51, SKILLS[i], 'skill', color=accent)

    rect(740, 92, 480, 84, COLORS[0][0], COLORS[0][1], 17)
    text(980, 126, labels['orchestrate'], 'action', color=COLORS[0][2])
    text(980, 152, SKILLS[0], 'skill', color=COLORS[0][2])

    rect(1700, 360, 220, 290, '#fbfcfe')
    text(1724, 404, labels['headers'][3], 'section', 'start')
    rect(1715, 426, 190, 90, '#edf6f0', '#edf6f0', 12)
    text(1730, 462, labels['new_alpha'][0], 'node', 'start', COLORS[0][2])
    text(1730, 491, labels['new_alpha'][1], 'sub', 'start')
    text(1724, 569, labels['report'][0], 'node', 'start')
    text(1724, 600, labels['report'][1], 'sub', 'start')
    text(980, 792, labels['caption'], 'caption')
    parts.append('</svg>\n')
    (ROOT.parent / 'images' / f'system-architecture-{lang}.svg').write_text('\n'.join(parts))

    m = ['%% Compact entity groups; colored Skills annotate the transitions.', '%% SVG uses cubic S curves; edit its layout in render_architecture.py.', 'flowchart LR']
    for j, (group, key) in enumerate([('SEEDS', 'seeds'), ('WALLETS', 'wallets'), ('CANDIDATES', 'candidates')]):
        m.append(f'    subgraph {group}["{labels["headers"][j]}"]')
        for i, card in enumerate(labels[key]):
            m.append(f'        {group}{i}["{"<br/>".join(card)}"]')
        m.append('    end')
    for i, skill in enumerate(SKILLS):
        action = labels['orchestrate'] if i == 0 else labels['actions'][i-1]
        m.append(f'    S{i}["{action}<br/>{skill}"]')
    m.extend([
        f'    ALPHA["{"<br/>".join(labels["new_alpha"])}"]',
        f'    REPORT["{"<br/>".join(labels["report"])}"]',
        '    SEEDS --> S1 --> WALLETS --> S2 --> CANDIDATES --> S3',
        '    S3 --> ALPHA', '    S3 --> REPORT',
        '    S0 -.-> S1', '    S0 -.-> S2', '    S0 -.-> S3',
    ])
    for i, (fill, stroke, _) in enumerate(COLORS):
        m.append(f'    style S{i} fill:{fill},stroke:{stroke}')
    (ROOT / f'system-architecture-{lang}.mmd').write_text('\n'.join(m) + '\n')


if __name__ == '__main__':
    for language, content in LABELS.items():
        render(language, content)
