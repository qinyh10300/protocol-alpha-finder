# Protocol Alpha Finder

**English** · [Chinese](README.zh-CN.md)

Find protocol opportunities on TRON by studying wallets that executed known liquidations or keeper actions.

**[Pitch Deck](pitch-deck/Protocol_Alpha_Finder_TRON_Pitch.pptx)** · **[Live Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html)**

## Features

- **Find strategy wallets:** start from Energy Rental liquidations, JustLend lending liquidations, and USDD keeper or auction actions.
- **Investigate each wallet:** examine transaction history, contract calls, and asset movements to find other protocol mechanisms.
- **Review every candidate:** produce an Alpha Report with evidence, costs, current conditions, and missing checks.

Every candidate gets a report: **Actionable**, **Monitor**, **Rejected**, or **Insufficient Evidence**.

## Demo

Choose a seed in the [Live Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html) and select **Replay Demo**. Energy Rental and USDD use labeled synthetic examples; JustLend replays saved chain research. Replay does not query the chain.

![Research workspace showing saved Skill results](docs/images/workspace-en.png)

[Demo data and refresh instructions](docs/RECORDED_DEMO.md)

## System architecture

**Alpha Seeds → Strategy Wallets → History Transactions → Alpha Candidates → Alpha Reports.** Each candidate passes through validation and produces its own report.

[![System architecture: wallet discovery, history collection, candidate extraction, and reports](docs/images/system-architecture-en.svg)](docs/images/system-architecture-en.svg)

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
