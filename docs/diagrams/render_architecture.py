"""Render the Seed Alpha → wallet → candidate discovery method in two languages."""

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LABELS = {
    "en": {
        "title": "From Seed Alpha to New Alpha",
        "orchestrate": "Coordinate discovery, investigation and validation",
        "seeds": "Three Alpha Seeds",
        "seed_names": [("Energy Rental", "Liquidation"), ("JustLend", "Lending liquidation"), ("USDD", "Keeper / auction")],
        "wallets": "Strategy Wallets",
        "wallet_names": ["Wallet A", "Wallet B", "Wallet C"],
        "candidates": "Alpha Candidates",
        "candidate_names": ["Candidate 1", "Candidate 2", "Candidate 3"],
        "outputs": "Validation Results",
        "find": "Find & verify executors",
        "investigate": "Study wallet histories",
        "validate": "Validate mechanism & conditions",
        "new_alpha": "New Alpha",
        "established": "If validated",
        "report": "Alpha Reports",
        "report_detail": "Evidence & next checks",
        "caption": "Wallets and candidates are illustrative. Every candidate receives a report.",
        "description": "Three seeds—Energy Rental liquidation, JustLend lending liquidation and USDD keeper or auction actions—lead to strategy wallets through alpha-seed-wallets. wallet-alpha-investigation studies the wallets to form Alpha candidates. protocol-alpha-validation produces reports and, if a mechanism is established, new Alpha. protocol-alpha-discovery coordinates the entire flow.",
    },
    "zh-CN": {
        "title": "从 Seed Alpha 发现新的 Alpha",
        "orchestrate": "协调钱包发现、历史研究与候选验证",
        "seeds": "三个 Alpha Seed",
        "seed_names": [("Energy Rental", "能量租赁清算"), ("JustLend", "借贷清算"), ("USDD", "Keeper／拍卖")],
        "wallets": "Strategy Wallets · 策略钱包",
        "wallet_names": ["钱包 A", "钱包 B", "钱包 C"],
        "candidates": "Alpha 候选",
        "candidate_names": ["候选 1", "候选 2", "候选 3"],
        "outputs": "验证结果",
        "find": "发现并核验执行者",
        "investigate": "研究钱包历史",
        "validate": "验证机制与执行条件",
        "new_alpha": "新的 Alpha",
        "established": "机制得到验证后产出",
        "report": "Alpha 报告",
        "report_detail": "证据与后续检查",
        "caption": "钱包与候选仅为流程示意；每个候选都会生成报告。",
        "description": "从 Energy Rental 清算、JustLend 借贷清算与 USDD keeper／拍卖三个入口，经 alpha-seed-wallets 发现策略钱包，再由 wallet-alpha-investigation 研究钱包历史形成 Alpha 候选。protocol-alpha-validation 验证候选并输出报告，机制得到验证后形成新的 Alpha。protocol-alpha-discovery 协调全流程。",
    },
}


def render(lang, labels):
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1740" height="650" viewBox="0 0 1740 650" role="img" aria-labelledby="title desc" xml:lang="{lang}">
<title id="title">{escape(labels['title'])}</title>
<desc id="desc">{escape(labels['description'])}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#62778c" stroke-width="1.5"/></marker></defs>
<style>
text {{ font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; fill: #253647; }}
.heading {{ font-size: 32px; font-weight: 700; }}
.section {{ font-size: 23px; font-weight: 600; }}
.node {{ font-size: 23px; font-weight: 600; }}
.sub {{ font-size: 19px; fill: #60748a; }}
.skill {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 17px; fill: #38654c; }}
.line {{ fill: none; stroke: #62778c; stroke-width: 1.6; }}
.arrow {{ fill: none; stroke: #62778c; stroke-width: 1.6; marker-end: url(#arrow); }}
.orchestrate {{ fill: none; stroke: #89a998; stroke-width: 1.5; stroke-dasharray: 6 5; marker-end: url(#arrow); }}
</style>
<rect width="1740" height="650" fill="#ffffff"/>''']

    def text(x, y, value, cls="sub", anchor="middle"):
        parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(value)}</text>')

    def rect(x, y, w, h, fill="#ffffff", stroke="#cbd6e0"):
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')

    def path(d, cls="line"):
        parts.append(f'<path d="{d}" class="{cls}"/>')

    text(40, 48, labels["title"], "heading", "start")
    text(870, 105, "protocol-alpha-discovery", "skill")
    text(870, 132, labels["orchestrate"])
    path("M 150 179 V 153 H 1580 V 179", "orchestrate")

    for x, name in [(150, "seeds"), (590, "wallets"), (1070, "candidates"), (1580, "outputs")]:
        text(x, 222, labels[name], "section")

    for y, seed, wallet, candidate in zip([270, 380, 490], labels["seed_names"], labels["wallet_names"], labels["candidate_names"]):
        cy = y + 40
        rect(40, y, 220, 80, "#f1f5fb", "#b2c5df")
        text(150, y + 33, seed[0], "node")
        text(150, y + 61, seed[1])
        rect(500, y, 180, 80)
        text(590, y + 48, wallet, "node")
        rect(980, y, 180, 80, "#f7f4fc", "#d6c9e9")
        text(1070, y + 48, candidate, "node")
        path(f"M 260 {cy} H 280 M 680 {cy} H 690 M 1160 {cy} H 1170")
        path(f"M 480 {cy} H 490", "arrow")
        path(f"M 970 {cy} H 980", "arrow")

    # Shared connectors show a many-to-many discovery flow, not one seed per wallet.
    for x in [280, 480, 690, 970, 1170]:
        path(f"M {x} 310 V 530")
    for start, end, center, skill, action in [
        (280, 480, 380, "alpha-seed-wallets", "find"),
        (690, 970, 830, "wallet-alpha-investigation", "investigate"),
        (1170, 1470, 1320, "protocol-alpha-validation", "validate"),
    ]:
        text(center, 367, skill, "skill")
        text(center, 395, labels[action])
        path(f"M {start} 420 H {end}")

    # All candidates produce reports; new Alpha requires an established mechanism.
    path("M 1470 335 V 525")
    path("M 1470 335 H 1480", "arrow")
    path("M 1470 525 H 1480", "arrow")
    rect(1490, 287, 220, 96, "#eaf4ee", "#83a68e")
    text(1600, 326, labels["new_alpha"], "node")
    text(1600, 358, labels["established"])
    rect(1490, 477, 220, 96)
    text(1600, 516, labels["report"], "node")
    text(1600, 548, labels["report_detail"])
    text(870, 627, labels["caption"])
    parts.append("</svg>\n")
    (ROOT.parent / "images" / f"system-architecture-{lang}.svg").write_text("\n".join(parts))

    # Matching graph for readers who prefer Mermaid editing.
    mermaid = f'''%% Entity nodes; research Skills label the transitions.
flowchart LR
    subgraph SEEDS["{labels['seeds']}"]
        E["{'<br/>'.join(labels['seed_names'][0])}"]
        J["{'<br/>'.join(labels['seed_names'][1])}"]
        U["{'<br/>'.join(labels['seed_names'][2])}"]
    end
    subgraph WALLETS["{labels['wallets']}"]
        W1["{labels['wallet_names'][0]}"]
        W2["{labels['wallet_names'][1]}"]
        W3["{labels['wallet_names'][2]}"]
    end
    subgraph CANDIDATES["{labels['candidates']}"]
        C1["{labels['candidate_names'][0]}"]
        C2["{labels['candidate_names'][1]}"]
        C3["{labels['candidate_names'][2]}"]
    end
    subgraph RESULTS["{labels['outputs']}"]
        ALPHA["{labels['new_alpha']}<br/>{labels['established']}"]
        REPORTS["{labels['report']}<br/>{labels['report_detail']}"]
    end
    SEEDS -->|alpha-seed-wallets| WALLETS
    WALLETS -->|wallet-alpha-investigation| CANDIDATES
    CANDIDATES -->|protocol-alpha-validation| RESULTS
    SEEDS -.->|protocol-alpha-discovery| RESULTS
    style SEEDS fill:#f1f5fb,stroke:#b2c5df
    style CANDIDATES fill:#f7f4fc,stroke:#d6c9e9
    style ALPHA fill:#eaf4ee,stroke:#83a68e
'''
    (ROOT / f"system-architecture-{lang}.mmd").write_text(mermaid)


if __name__ == "__main__":
    for language, content in LABELS.items():
        render(language, content)
