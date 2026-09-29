# Protocol Alpha Finder

**English** · [简体中文](README.zh-CN.md)

Find protocol opportunities on TRON by studying wallets that executed known liquidations or keeper actions.

**[Pitch Deck](pitch-deck/Protocol_Alpha_Finder_TRON_Pitch.pptx)** · **[Live Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html)** — choose a seed and select **Run Discovery**. Energy Rental uses synthetic examples; JustLend and USDD replay saved chain research. [Demo data and refresh instructions](docs/RECORDED_DEMO.md).

## How it works

1. Start from a known mechanism: Energy Rental, JustLend liquidation, or USDD keeper actions.
2. Find its executors and investigate each wallet's broader history.
3. Validate candidates and produce reports with evidence and next checks.

Every candidate gets a report: **Actionable**, **Monitor**, **Rejected**, or **Insufficient Evidence**.

![Research workspace showing saved Skill results](docs/images/workspace-en.png)

## Recorded results

Research run validated on 29 September 2026: **10 wallets · 52,582 unique primary transactions · 5 reports**.

Outcomes: **3 Monitor, 2 Insufficient Evidence**. All five opportunities remain uncertain; current profitability is unproven.

## System architecture

Three seeds—**Energy Rental, JustLend and USDD**—lead to strategy wallets, then candidate mechanisms and validated new Alpha. The Skills label each transition below.

- **Orchestrate:** set scope and coordinate the research.
- **Find wallets:** verify calls, receipts, and executor roles.
- **Investigate:** turn wallet activity into candidate mechanisms.
- **Validate:** check the mechanism, current state, and execution conditions.

![System architecture](docs/images/system-architecture-en.svg)

[Architecture details](docs/ARCHITECTURE.md)

## Run locally

Requires Node.js 20.19+ or 22.12+, and Python 3.10+.

```bash
git clone https://github.com/qinyh10300/protocol-alpha-finder.git
cd protocol-alpha-finder
npm ci
npm run dev
```

Open [the local Demo](http://127.0.0.1:5173/research?mode=demo). The JustLend and USDD replays include published research snapshots. The full local Skill-results mode requires the saved `data/` artifacts, which are excluded from Git.

[Skill setup](skills/README.md) · [Development guide](frontend/README.md) · [Pitch notes](pitch-deck/README.md)
