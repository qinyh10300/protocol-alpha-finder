<p align="right">
  🌐 <strong>Language</strong>: <strong>English</strong> · <a href="README.zh-CN.md">简体中文</a>
</p>

<h1 align="center">
  <img src="docs/images/protocol-alpha-logo.svg" alt="Protocol Alpha Finder logo" width="44" height="42" />
  Protocol Alpha Finder
</h1>

Find protocol opportunities on TRON by studying wallets that executed known liquidations or keeper actions.

**[Download Pitch Deck — PPTX, 11 slides](pitch-deck/Protocol_Alpha_Finder_TRON_Pitch.pptx)** · **[Live Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html)**

## Background

The project began with a liquidation research question: when another wallet executes an opportunity first, what else might its history reveal? That execution gives us a concrete starting point for investigating the wallet's other protocol activity.

| Concept | Meaning in this project |
| --- | --- |
| **Alpha Seed** | A known protocol mechanism used to find its actual executors. Energy Rental liquidations, JustLend lending liquidations, and USDD keeper actions are the initial seeds. |
| **Strategy Wallet** | A wallet selected for research because transaction evidence shows it executed a relevant mechanism. That evidence identifies a research target; profitability still needs validation. |
| **Alpha Candidate** | A hypothesis about another mechanism found in a wallet's activity, with supporting transactions and questions that still need to be tested. |

We use known mechanisms to find wallets, examine their broader transaction history, and turn candidate mechanisms into evidence-backed reports. An established mechanism can become a new seed for a further research pass. The long-term goal described in the [Pitch Deck](pitch-deck/Protocol_Alpha_Finder_TRON_Pitch.pptx) is a graph connecting protocol opportunities to the wallets that execute them.

## Features

1. **Find strategy wallets from three TRON seeds.** Start with Energy Rental liquidations, JustLend lending liquidations, or USDD keeper actions. Verify execution evidence and deduplicate wallets while preserving their seed sources.

2. **Discover new mechanisms in wallet history.** Follow **History → Analyze → Search Alpha** to examine contract calls and asset movements beyond the original seed. Each candidate retains supporting transactions and questions to investigate.

3. **Validate each candidate.** Check the mechanism, current contract state, rewards, costs, and execution conditions. Record unresolved questions and distinguish historical evidence from current availability.

4. **Review and share research reports.** Browse wallets, candidates, and reports in one workspace. Each report records an outcome—**Actionable**, **Monitor**, **Rejected**, or **Insufficient Evidence**—with evidence, next checks, and options to share or export.

## Demo

Choose a seed in the [Live Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html) and select **Replay Demo**. Energy Rental and USDD use labeled synthetic examples; JustLend replays saved chain research. Replay does not query the chain.

![Research workspace showing saved Skill results](docs/images/workspace-en.png)

[Demo data and refresh instructions](docs/RECORDED_DEMO.md)

## System architecture

**Alpha Seeds → Strategy Wallets → History Transactions → Alpha Candidates → Alpha Reports.** Each candidate passes through validation and produces its own report.

[![System architecture with structured report fields: opportunity, occurrences, and capacity](docs/images/system-architecture-en.svg?v=4bcbeaa)](docs/images/system-architecture-en.svg)

Each Alpha Report card summarizes **opportunity availability, historical occurrences, and estimated capacity**.

[Method and Skills](docs/ARCHITECTURE.md) · [Evidence and wallet observation](docs/DATA_ARCHITECTURE.md)

## Skill implementation

The repository contains **four Skill packages: one coordinator and three research Skills**. Each `SKILL.md` gives a host Agent the procedure and handoff requirements. Python scripts collect and check evidence; the Agent interprets it and develops hypotheses.

The diagram labels four operations. **Skills 2 and 3 are both implemented by `wallet-alpha-investigation`**; `protocol-alpha-discovery` is the coordinator above them.

### Coordinate the research

[protocol-alpha-discovery](skills/protocol-alpha-discovery/SKILL.md) takes the seed mechanisms, network, time window, and research limits. It runs wallet discovery, investigates each deduplicated wallet, and sends candidate evidence to validation. The final [research record](skills/protocol-alpha-discovery/references/research-record.md) preserves seed coverage, findings, unknowns, and next checks. Only an established mechanism can become a new seed for another research pass.

### Skill 1 — Find strategy wallets

[alpha-seed-wallets](skills/alpha-seed-wallets/SKILL.md) matches seed calls or events to successful transaction receipts. It distinguishes the originating wallet, execution contract, and reward recipient, then deduplicates wallets while retaining every seed source. Its [wallet handoff](skills/alpha-seed-wallets/references/wallet-handoff.md) includes selection reasons, supporting transactions, role ambiguities, and retrieval coverage.

The bundled [Energy Rental collector](scripts/collect_energy_rental.py) fetches liquidation events, verifies receipt logs, and identifies transaction initiators. JustLend and USDD discovery use the host Agent's chain tools or supplied evidence.

### Skills 2–3 — Fetch history and extract candidates

[wallet-alpha-investigation](skills/wallet-alpha-investigation/SKILL.md) takes the wallet shortlist and examines activity beyond the original seed. It groups contract calls and asset movements into repeated sequences. Each candidate retains supporting transactions, an explanation of the mechanism, alternative explanations, and checks that could disprove it.

The collector stores primary transactions, token records, and internal records with SQLite checkpoints for deduplication and incremental retrieval. The [summarizer](scripts/summarize_energy_rental.py) produces coverage and activity summaries, plus alerts for new target contracts; the [verifier](scripts/verify_energy_rental.py) checks transaction byte hashes. Monitoring currently uses manually repeated collection and review.

### Skill 4 — Validate candidates and write reports

[protocol-alpha-validation](skills/protocol-alpha-validation/SKILL.md) reconstructs capital flows, rewards, returned principal, and costs for each candidate. It checks current contract state, execution conditions, and alternative explanations, then returns a report with evidence, assumptions, and next checks.

Reports keep mechanism validation separate from current opportunity status: `ACTIVE`, `DEGRADED`, `EXPIRED`, or `UNCERTAIN`. The [research adapter](scripts/research_adapter.py) checks saved handoff references and exposes the results to the frontend, where report outcomes are displayed separately. The workspace reads saved results; it does not launch the Skills.

## Installation and usage

### Run the workspace

Requires Node.js 20.19+ or 22.12+, and Python 3.10+.

```bash
git clone https://github.com/qinyh10300/protocol-alpha-finder.git
cd protocol-alpha-finder
npm ci
npm run dev
```

Open [the local Demo](http://127.0.0.1:5173/research?mode=demo). Demo mode works with the files in this repository. The local **Skill results** mode requires saved `data/` artifacts, which are excluded from Git.

### Run a research workflow

Place the four directories under `skills/` in a host Agent's Skill directory, keeping them together, or ask the Agent to read `skills/protocol-alpha-discovery/SKILL.md` directly. Give it access to chain data or supply transaction and contract evidence.

Example request:

> Use protocol-alpha-discovery to find strategy wallets from Energy Rental, JustLend, and USDD on TRON. Investigate their history, validate each candidate, and report evidence, coverage gaps, and next checks.

[Skill setup](skills/README.md) · [Development guide](frontend/README.md) · [Pitch notes](pitch-deck/README.md)
