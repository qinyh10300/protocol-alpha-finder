"""Generate bilingual diagrams of the four-Skill research method (standard library only)."""

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LABELS = {
    "en": {
        "title": "Strategy Wallet Discovery Pipeline",
        "subtitle": "Seed Alpha → Strategy Wallet → New Alpha",
        "orchestrate": "1 · Orchestrate Research",
        "scope": "Research scope · Stage handoffs · Stopping rules",
        "seed": "Seed Alpha",
        "known": "Known mechanism",
        "find": "2 · Find & Verify Wallets",
        "find_logic": ["Match calls and successful receipts", "Identify the actual executor"],
        "wallets": "Strategy Wallets",
        "investigate": "3 · Discover Candidates",
        "investigate_logic": ["Study broader wallet history", "Form new mechanism hypotheses"],
        "candidates": "Alpha Candidates",
        "validate": "4 · Validate Candidates",
        "validate_logic": ["Test mechanism and current state", "Check costs and execution conditions"],
        "reports": "Alpha Reports",
        "loop": "Established mechanism → next Seed Alpha within research scope",
        "outcomes": "Report outcomes: Actionable · Monitor · Rejected · Insufficient Evidence",
        "seeds": "TRON seeds: Energy Rental liquidation · JustLend liquidation · USDD keeper / auction",
        "description": "Seed Alpha identifies evidenced strategy wallets. Their broader history produces candidate mechanisms, which are validated for current conditions and execution requirements. One Skill orchestrates the three research Skills. Only an established mechanism may become a new seed.",
    },
    "zh-CN": {
        "title": "Strategy Wallet 发现与验证流程",
        "subtitle": "已知 Alpha → 策略钱包 → 新 Alpha",
        "orchestrate": "1 · 编排研究",
        "scope": "研究范围 · 阶段交接 · 停止条件",
        "seed": "Seed Alpha",
        "known": "已知协议机制",
        "find": "2 · 发现并核验钱包",
        "find_logic": ["匹配合约调用与成功回执", "确认真实执行者"],
        "wallets": "Strategy Wallets · 策略钱包",
        "investigate": "3 · 发现候选",
        "investigate_logic": ["研究钱包更广泛的历史活动", "形成新的机制假设"],
        "candidates": "Alpha Candidates · 候选",
        "validate": "4 · 验证候选",
        "validate_logic": ["验证机制与当前状态", "核查成本及执行条件"],
        "reports": "Alpha Reports · 报告",
        "loop": "机制得到验证 → 在研究范围内作为新的 Seed Alpha",
        "outcomes": "报告结果：可执行 · 持续观察 · 已排除 · 证据不足",
        "seeds": "TRON 入口：Energy Rental 清算 · JustLend 清算 · USDD keeper／拍卖",
        "description": "以已知 Alpha 识别有交易证据的策略钱包，从钱包更广泛的历史中形成候选机制，再验证其当前状态与执行条件。一个编排 Skill 协调其余三个研究 Skill，只有机制得到验证后才可作为新的入口。",
    },
}


def render(lang, labels):
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="700" viewBox="0 0 1600 700" role="img" aria-labelledby="title desc" xml:lang="{lang}">
<title id="title">{escape(labels['title'])}</title>
<desc id="desc">{escape(labels['description'])}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#64788c" stroke-width="1.5"/></marker></defs>
<style>
text {{ font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; fill: #253647; }}
.heading {{ font-size: 30px; font-weight: 700; }}
.box-title {{ font-size: 24px; font-weight: 600; }}
.sub {{ font-size: 20px; fill: #60748a; }}
.result {{ font-size: 22px; font-weight: 600; fill: #365f4b; }}
.skill {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 18px; fill: #486859; }}
.line {{ fill: none; stroke: #64788c; stroke-width: 1.6; marker-end: url(#arrow); }}
.coord {{ fill: none; stroke: #98b2a3; stroke-width: 1.5; stroke-dasharray: 5 5; }}
.loop {{ fill: none; stroke: #64788c; stroke-width: 1.5; stroke-dasharray: 6 5; marker-end: url(#arrow); }}
</style>
<rect width="1600" height="700" fill="#ffffff"/>''']

    def text(x, y, value, cls="sub", anchor="middle"):
        parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(value)}</text>')

    def rect(x, y, w, h, fill="#ffffff", stroke="#cbd6e0"):
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')

    def path(d, cls="line"):
        parts.append(f'<path d="{d}" class="{cls}"/>')

    text(40, 48, labels["title"], "heading", "start")
    text(1560, 47, labels["subtitle"], anchor="end")
    rect(570, 106, 650, 118, "#eaf4ee", "#83a68e")
    text(895, 143, labels["orchestrate"], "box-title")
    text(895, 175, "protocol-alpha-discovery", "skill")
    text(895, 206, labels["scope"])
    path("M 895 224 V 260 M 500 300 V 260 H 1365 V 300 M 930 260 V 300", "coord")

    rect(40, 300, 220, 212, "#f1f5fb", "#b2c5df")
    text(150, 398, labels["seed"], "box-title")
    text(150, 432, labels["known"], "sub")
    path("M 270 406 H 300")

    for x, width, key, skill, result in [
        (310, 380, "find", "alpha-seed-wallets", "wallets"),
        (740, 380, "investigate", "wallet-alpha-investigation", "candidates"),
        (1170, 390, "validate", "protocol-alpha-validation", "reports"),
    ]:
        rect(x, 300, width, 212)
        cx = x + width / 2
        text(cx, 338, labels[key], "box-title")
        text(cx, 369, skill, "skill")
        parts.append(f'<path d="M {x + 22} 389 H {x + width - 22}" stroke="#e4ebe7"/>')
        for y, label in zip([420, 450], labels[f"{key}_logic"]):
            text(cx, y, label)
        text(cx, 490, labels[result], "result")

    path("M 700 406 H 730")
    path("M 1130 406 H 1160")
    path("M 1365 522 V 563 H 150 V 522", "loop")
    text(800, 594, labels["loop"])
    text(800, 642, labels["outcomes"])
    text(800, 680, labels["seeds"])
    parts.append("</svg>\n")
    (ROOT.parent / "images" / f"system-architecture-{lang}.svg").write_text("\n".join(parts))

    def stage(key, skill, result):
        return "<br/>".join([labels[key], skill, *labels[f"{key}_logic"], labels[result]])

    mermaid = f'''%% Four-Skill method. render_architecture.py generates the fixed-layout README illustration.
flowchart LR
    SEED["{labels['seed']}<br/>{labels['known']}"]
    ORCH["{labels['orchestrate']}<br/>protocol-alpha-discovery<br/>{labels['scope']}"]
    FIND["{stage('find', 'alpha-seed-wallets', 'wallets')}"]
    INVESTIGATE["{stage('investigate', 'wallet-alpha-investigation', 'candidates')}"]
    VALIDATE["{stage('validate', 'protocol-alpha-validation', 'reports')}"]
    SEED --> FIND --> INVESTIGATE --> VALIDATE
    ORCH -.-> FIND
    ORCH -.-> INVESTIGATE
    ORCH -.-> VALIDATE
    VALIDATE -.->|{labels['loop']}| SEED
    style ORCH fill:#eaf4ee,stroke:#83a68e
    style SEED fill:#f1f5fb,stroke:#b2c5df
'''
    (ROOT / f"system-architecture-{lang}.mmd").write_text(mermaid)


if __name__ == "__main__":
    for language, content in LABELS.items():
        render(language, content)
