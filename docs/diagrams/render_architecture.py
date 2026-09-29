"""Render the bilingual architecture overview using only the Python standard library."""

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LABELS = {
    "en": {
        "title": "Protocol Alpha Finder · System Architecture",
        "subtitle": "4 Skills · Evidence → Alpha Reports",
        "ui": ("Research Workspace", "Wallets → Candidates → Reports"),
        "api": ("Python API", "Read saved research"),
        "store": ("Research Archive", "JSON · Markdown"),
        "host": "Host Agent · Research Workflow",
        "orchestrate": "1 · Orchestrate",
        "find": "2 · Find Wallets",
        "investigate": "3 · Investigate",
        "validate": "4 · Validate",
        "wallets": "Strategy wallets",
        "candidates": "Alpha candidates",
        "reports": "Alpha reports",
        "coordinate": "Coordinates three Skills",
        "save": "Save results",
        "read": "Read-only",
        "history": "Each wallet: History → Analyze → Search Alpha",
        "evidence": ("TRON Evidence", "Transactions · Contracts · State"),
        "outcomes": "Report outcomes: Actionable · Monitor · Rejected · Insufficient evidence",
        "description": "TRON evidence feeds a host Agent. One orchestration Skill coordinates wallet discovery, investigation and validation. Saved research reaches the workspace through a local Python API.",
    },
    "zh-CN": {
        "title": "Protocol Alpha Finder · 系统架构",
        "subtitle": "4 个 Skill · 从证据到 Alpha 报告",
        "ui": ("研究工作台", "钱包 → 候选 → 报告"),
        "api": ("Python API", "读取研究留档"),
        "store": ("研究留档", "JSON · Markdown"),
        "host": "宿主 Agent · 研究流程",
        "orchestrate": "1 · 研究编排",
        "find": "2 · 发现钱包",
        "investigate": "3 · 钱包研究",
        "validate": "4 · 候选验证",
        "wallets": "策略钱包",
        "candidates": "Alpha 候选",
        "reports": "Alpha 报告",
        "coordinate": "协调三个 Skill",
        "save": "保存结果",
        "read": "只读查询",
        "history": "每个钱包独立执行：历史 → 分析 → 搜索 Alpha",
        "evidence": ("TRON 链上证据", "交易 · 合约 · 状态"),
        "outcomes": "报告结果：可执行 · 持续观察 · 已排除 · 证据不足",
        "description": "TRON 证据进入宿主 Agent。编排 Skill 协调钱包发现、研究和验证，研究留档通过本地 Python API 展示在工作台中。",
    },
}


def render(lang, labels):
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="880" viewBox="0 0 1440 880" role="img" aria-labelledby="title desc" xml:lang="{lang}">
<title id="title">{escape(labels['title'])}</title>
<desc id="desc">{escape(labels['description'])}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#64788c" stroke-width="1.5"/></marker></defs>
<style>
text {{ font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; fill: #253647; }}
.heading {{ font-size: 28px; font-weight: 700; }}
.box-title {{ font-size: 23px; font-weight: 600; }}
.sub {{ font-size: 20px; fill: #60748a; }}
.skill {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 17px; fill: #486859; }}
.line {{ fill: none; stroke: #64788c; stroke-width: 1.5; marker-end: url(#arrow); }}
.coord {{ fill: none; stroke: #98b2a3; stroke-width: 1.5; stroke-dasharray: 5 5; }}
</style>
<rect width="1440" height="880" fill="#ffffff"/>''']

    def text(x, y, value, cls="sub", anchor="middle"):
        parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(value)}</text>')

    def rect(x, y, w, h, fill="#ffffff", stroke="#cbd6e0"):
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')

    def path(d, cls="line"):
        parts.append(f'<path d="{d}" class="{cls}"/>')

    def box(x, y, w, h, title, subtitle, fill="#ffffff", stroke="#cbd6e0"):
        rect(x, y, w, h, fill, stroke)
        text(x + w / 2, y + 38, title, "box-title")
        text(x + w / 2, y + 69, subtitle)

    text(40, 48, labels["title"], "heading", "start")
    text(1400, 47, labels["subtitle"], anchor="end")

    box(48, 104, 380, 96, *labels["ui"])
    box(555, 104, 330, 96, *labels["api"])
    box(1012, 104, 380, 96, *labels["store"])
    path("M 545 158 H 438")
    text(491, 143, "HTTP")
    path("M 1002 158 H 895")
    text(948, 143, "JSON")

    rect(48, 280, 1344, 386, "#fafcfb", "#bbcec3")
    text(78, 320, labels["host"], "box-title", "start")
    path("M 1202 270 V 210")
    text(1220, 246, labels["save"], anchor="start")

    rect(515, 338, 410, 88, "#eaf4ee", "#83a68e")
    text(720, 372, labels["orchestrate"], "box-title")
    text(720, 402, "protocol-alpha-discovery", "skill")
    path("M 720 426 V 460 M 268 488 V 460 H 1172 V 488 M 720 460 V 488", "coord")
    text(740, 451, labels["coordinate"], anchor="start")

    for x, name, skill, output in [
        (88, "find", "alpha-seed-wallets", "wallets"),
        (540, "investigate", "wallet-alpha-investigation", "candidates"),
        (992, "validate", "protocol-alpha-validation", "reports"),
    ]:
        rect(x, 488, 360, 118)
        text(x + 180, 522, labels[name], "box-title")
        text(x + 180, 553, skill, "skill")
        text(x + 180, 584, labels[output])

    path("M 458 547 H 530")
    path("M 910 547 H 982")
    text(720, 642, labels["history"])

    box(390, 740, 660, 88, *labels["evidence"], "#f1f5fb", "#b2c5df")
    path("M 720 730 V 676")
    text(740, 710, labels["read"], anchor="start")
    text(720, 862, labels["outcomes"])
    parts.append("</svg>\n")
    (ROOT.parent / "images" / f"system-architecture-{lang}.svg").write_text("\n".join(parts))

    # Portable graph source for users who prefer editing in Mermaid.
    def node(key):
        return "<br/>".join(labels[key])

    mermaid = f'''%% Simplified architecture. The README illustration uses render_architecture.py for a fixed layout.
flowchart TB
    subgraph APPLICATION["{labels['ui'][0]}"]
        direction RL
        STORE["{node('store')}"] --> API["{node('api')}"] --> UI["{node('ui')}"]
    end
    subgraph AGENT["{labels['host']}"]
        ORCH["{labels['orchestrate']}<br/>protocol-alpha-discovery"]
        FIND["{labels['find']}<br/>alpha-seed-wallets"]
        INVESTIGATE["{labels['investigate']}<br/>wallet-alpha-investigation"]
        VALIDATE["{labels['validate']}<br/>protocol-alpha-validation"]
        ORCH -.-> FIND
        ORCH -.-> INVESTIGATE
        ORCH -.-> VALIDATE
        FIND --> INVESTIGATE --> VALIDATE
    end
    AGENT -->|{labels['save']}| STORE
    EVIDENCE["{node('evidence')}"] -->|{labels['read']}| AGENT
    style AGENT fill:#fafcfb,stroke:#bbcec3
    style ORCH fill:#eaf4ee,stroke:#83a68e
    style EVIDENCE fill:#f1f5fb,stroke:#b2c5df
'''
    (ROOT / f"system-architecture-{lang}.mmd").write_text(mermaid)


if __name__ == "__main__":
    for language, content in LABELS.items():
        render(language, content)
