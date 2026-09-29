"""Render bilingual, evidence-backed examples of the four-Skill discovery pipeline."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKILLS = ["protocol-alpha-discovery", "alpha-seed-wallets", "wallet-alpha-investigation", "protocol-alpha-validation"]
COLORS = [("#eaf6ef", "#7caa90"), ("#eaf3ff", "#84abe0"), ("#f4edff", "#b79ad8"), ("#fff4df", "#d4ad65")]
LABELS = {
    "en": {
        "title": "From Seed Alpha to New Alpha",
        "orchestrate": "Orchestrate the research",
        "scope": "Set scope · Coordinate evidence handoffs · Decide next checks",
        "headers": ["Alpha Seeds", "Strategy Wallets", "Candidate Mechanisms", "Validation Results"],
        "seeds": [
            ["Energy Rental", "Liquidate rental orders", "Resources + rewards"],
            ["JustLend", "Liquidate unhealthy debt", "Receive collateral"],
            ["USDD", "Trigger / reset / buy", "Keeper / auction actions"],
        ],
        "wallets": [
            ["Wallet A", "TNQ8…GDW2m", "Energy Rental liquidations", "Also rents and returns resources"],
            ["Wallet B", "TUAA…uqrSS", "JustLend liquidations", "Also executes cross-pool swaps"],
            ["Wallet C", "TFaz…hVFB", "JustLend liquidations", "Also redeems seized collateral"],
        ],
        "candidates": [
            ["Rent → Liquidate → Return", ["Bundling rental and liquidation", "may lower execution costs."], "Evidence: ordered receipt events"],
            ["Liquidate → Redeem → Swap", ["Redeeming and swapping collateral", "may recycle capital in one transaction."], "Evidence: liquidation + asset flows"],
            ["Cross-pool round trip", ["Same-token round trips may capture", "price differences between pools."], "Evidence: decoded swaps + transfers"],
        ],
        "actions": [
            ["Find & verify executors", "Calls · Receipts · Executor roles"],
            ["Investigate wallet history", "Sequences · Flows · Hypotheses"],
            ["Validate each candidate", "Mechanism · State · Costs / risks"],
        ],
        "new_alpha": ["New Alpha", "If the mechanism is established", "Record its execution conditions", "Consider it as a new seed"],
        "report": ["Alpha Report", "Mechanism + evidence", "Current state + next checks", "Actionable · Monitor", "Rejected · Insufficient Evidence"],
        "caption": "Selected wallets from the saved run; candidate cards group related mechanisms. USDD has no verified wallet in this run.",
        "status": "Saved results: 3 Monitor · 2 Insufficient Evidence · No candidate promoted to a new seed",
        "description": "Three Alpha seeds lead through colored Skill arrows to real example wallets and candidate mechanisms. Wallet A executes Energy Rental liquidation; wallets B and C execute JustLend liquidation. Their activity motivates rental-liquidation-return, liquidation-redemption-swap and cross-pool round-trip hypotheses. Validation produces evidence reports and may establish new Alpha. The saved run has not promoted any new seed.",
    },
    "zh-CN": {
        "title": "从 Seed Alpha 发现新的 Alpha",
        "orchestrate": "编排整条研究流程",
        "scope": "确定研究范围 · 协调证据交接 · 决定后续检查",
        "headers": ["Alpha Seed", "Strategy Wallets · 策略钱包", "候选机制", "验证结果"],
        "seeds": [
            ["Energy Rental", "清算符合条件的租赁订单", "回收资源并获得协议奖励"],
            ["JustLend", "清算抵押不足的借贷头寸", "获得被清算的抵押品"],
            ["USDD", "清算／重启／购买", "检查 keeper 与拍卖操作"],
        ],
        "wallets": [
            ["钱包 A", "TNQ8…GDW2m", "执行 Energy Rental 清算", "同时出现资源租赁与归还操作"],
            ["钱包 B", "TUAA…uqrSS", "执行 JustLend 清算", "其他历史中还存在跨池兑换"],
            ["钱包 C", "TFaz…hVFB", "执行 JustLend 清算", "还会赎回获得的抵押品"],
        ],
        "candidates": [
            ["租赁 → 清算 → 归还", ["同笔组合租赁与清算，", "可能降低执行成本。"], "证据：回执中的有序事件"],
            ["清算 → 赎回 → 兑换", ["赎回并兑换抵押品，", "可能在一笔交易中回收资金。"], "证据：清算记录与资产流"],
            ["跨池循环兑换", ["同一资产跨池兑换后回到起点，", "可能利用池间价差。"], "证据：已解码兑换与转账"],
        ],
        "actions": [
            ["发现并核验执行者", "调用 · 成功回执 · 执行者身份"],
            ["研究钱包历史", "调用序列 · 资产流 · 机制假设"],
            ["逐个验证候选", "机制 · 当前状态 · 成本与风险"],
        ],
        "new_alpha": ["新的 Alpha", "机制得到验证后产出", "记录适用的执行条件", "评估是否成为新的 Seed"],
        "report": ["Alpha 报告", "机制判断与支持证据", "当前状态与后续检查", "可执行 · 持续观察", "已排除 · 证据不足"],
        "caption": "钱包取自留档中的部分真实样本；候选按相近机制归类。本次 USDD 查询未找到已核验钱包。",
        "status": "留档结果：3 份持续观察 · 2 份证据不足 · 尚无候选被提升为新 Seed",
        "description": "三个 Alpha Seed 通过不同颜色的 Skill 箭头找到真实钱包样本，再形成候选机制。钱包 A 执行 Energy Rental 清算，钱包 B 和 C 执行 JustLend 清算。钱包活动形成租赁清算归还、清算赎回兑换和跨池循环兑换三类假设。候选验证产出证据报告，机制成立后可形成新 Alpha。本次留档尚未产生新的 Seed。",
    },
}


def render(lang, labels):
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="2180" height="1090" viewBox="0 0 2180 1090" role="img" aria-labelledby="title desc" xml:lang="{lang}">
<title id="title">{escape(labels['title'])}</title>
<desc id="desc">{escape(labels['description'])}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#62778c" stroke-width="1.5"/></marker></defs>
<style>
text {{ font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; fill: #253647; }}
.heading {{ font-size: 34px; font-weight: 700; }}
.section {{ font-size: 24px; font-weight: 600; }}
.node {{ font-size: 23px; font-weight: 600; }}
.sub {{ font-size: 19px; fill: #536d82; }}
.detail {{ font-size: 17px; fill: #60788b; }}
.skill {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 16px; font-weight: 600; }}
.line {{ fill: none; stroke: #788c9e; stroke-width: 1.6; }}
.arrow {{ fill: none; stroke: #788c9e; stroke-width: 1.6; marker-end: url(#arrow); }}
.orchestrate {{ fill: none; stroke: #89a998; stroke-width: 1.5; stroke-dasharray: 6 5; marker-end: url(#arrow); }}
</style>
<rect width="2180" height="1090" fill="#ffffff"/>''']

    def text(x, y, value, cls="sub", anchor="middle"):
        parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(value)}</text>')

    def rect(x, y, w, h, fill="#ffffff", stroke="#cbd6e0"):
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="11" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')

    def path(d, cls="line"):
        parts.append(f'<path d="{d}" class="{cls}"/>')

    text(40, 52, labels["title"], "heading", "start")
    path("M 150 240 V 170 H 2005 V 240", "orchestrate")
    rect(740, 100, 700, 138, *COLORS[0])
    text(1090, 138, labels["orchestrate"], "node")
    text(1090, 174, SKILLS[0], "skill")
    text(1090, 210, labels["scope"])

    for x, heading in zip([150, 710, 1350, 2005], labels["headers"]):
        text(x, 294, heading, "section")

    # Column cards: factual behavior on wallets; one-sentence hypotheses on candidates.
    for i, y in enumerate([340, 560, 780]):
        cy = y + 85
        seed = labels["seeds"][i]
        wallet = labels["wallets"][i]
        candidate = labels["candidates"][i]
        rect(40, y, 220, 170, "#f7faff", "#bfd0e5")
        text(150, y + 43, seed[0], "node")
        text(150, y + 91, seed[1], "detail")
        text(150, y + 121, seed[2], "detail")
        rect(570, y, 280, 170)
        text(710, y + 36, wallet[0], "node")
        text(710, y + 65, wallet[1], "detail")
        text(710, y + 110, wallet[2], "detail")
        text(710, y + 139, wallet[3], "detail")
        rect(1170, y, 360, 170, "#fcfaff", "#d8cce8")
        text(1350, y + 36, candidate[0], "node")
        for dy, line in zip([77, 104], candidate[1]):
            text(1350, y + dy, line)
        text(1350, y + 144, candidate[2], "detail")
        path(f"M 260 {cy} H 270 M 850 {cy} H 860 M 1530 {cy} H 1540")
        path(f"M 560 {cy} H 570", "arrow")
        path(f"M 1160 {cy} H 1170", "arrow")

    # Buses collect sets of evidence; they do not imply one-to-one row mappings.
    for x in [270, 560, 860, 1160, 1540]:
        path(f"M {x} 425 V 865")
    path("M 270 645 H 560")
    path("M 860 645 H 1160")
    path("M 1540 645 H 1860")
    path("M 1860 450 V 795")
    path("M 1860 450 H 1870", "arrow")
    path("M 1860 795 H 1870", "arrow")

    # Colored Skill labels sit on each transition arrow.
    for i, (cx, width) in enumerate([(415, 260), (1010, 280), (1700, 280)], start=1):
        rect(cx - width / 2, 579, width, 132, *COLORS[i])
        text(cx, 611, SKILLS[i], "skill")
        text(cx, 651, labels["actions"][i - 1][0])
        text(cx, 684, labels["actions"][i - 1][1], "detail")

    rect(1870, 350, 270, 200, "#eaf6ef", "#7caa90")
    for dy, value in zip([46, 92, 127, 162], labels["new_alpha"]):
        text(2005, 350 + dy, value, "node" if dy == 46 else "detail")
    rect(1870, 685, 270, 220)
    for dy, value in zip([43, 85, 119, 162, 190], labels["report"]):
        text(2005, 685 + dy, value, "node" if dy == 43 else "detail")
    text(1090, 1014, labels["caption"])
    text(1090, 1054, labels["status"])
    parts.append("</svg>\n")
    (ROOT.parent / "images" / f"system-architecture-{lang}.svg").write_text("\n".join(parts))

    def lines(values):
        return "<br/>".join(values)

    m = ['%% Colored Skill nodes annotate the transitions between research artifacts.', 'flowchart LR']
    for group, key in [('SEEDS', 'seeds'), ('WALLETS', 'wallets'), ('CANDIDATES', 'candidates')]:
        m.append(f'    subgraph {group}["{labels["headers"][["SEEDS", "WALLETS", "CANDIDATES"].index(group)]}"]')
        for i, card in enumerate(labels[key]):
            flattened = [card[0], *card[1], card[2]] if key == 'candidates' else card
            m.append(f'        {group}{i}["{lines(flattened)}"]')
        m.append('    end')
    for i, skill in enumerate(SKILLS):
        action = labels['scope'] if i == 0 else lines(labels['actions'][i-1])
        m.append(f'    S{i}["{skill}<br/>{action}"]')
    m.extend([
        f'    ALPHA["{lines(labels["new_alpha"])}"]',
        f'    REPORT["{lines(labels["report"])}"]',
        '    SEEDS --> S1 --> WALLETS --> S2 --> CANDIDATES --> S3',
        '    S3 --> ALPHA', '    S3 --> REPORT',
        '    S0 -.-> S1', '    S0 -.-> S2', '    S0 -.-> S3',
    ])
    for i, (fill, stroke) in enumerate(COLORS):
        m.append(f'    style S{i} fill:{fill},stroke:{stroke}')
    (ROOT / f"system-architecture-{lang}.mmd").write_text('\n'.join(m) + '\n')


if __name__ == "__main__":
    for language, content in LABELS.items():
        render(language, content)
