# System architecture

**English** · [简体中文](ARCHITECTURE.zh-CN.md) · [Project overview](../README.md) · [Pitch Deck](../pitch-deck/README.md)

Protocol Alpha Finder connects a host Agent's research workflow to an evidence-focused web workspace. The design follows the Pitch Deck's discovery loop and separates interpretation, verification, saved results, and human review.

![System architecture](images/system-architecture-en.svg)

[Editable Mermaid source](diagrams/system-architecture-en.mmd) · [Chinese diagram](images/system-architecture-zh-CN.svg)

## 1. Evidence and discovery scope

The three default seeds are Energy Rental liquidation, JustLend lending liquidation, and USDD keeper / auction actions. Each seed supplies a mechanism to investigate and a path to evidenced executors.

The repository's collector implements Energy Rental discovery and history pagination through a read-only provider API. The host Agent needs additional tools or supplied evidence for the other seeds. Receipts, decoded actions, asset movements, ABIs, protocol materials, and state reads support the research. A provider's completed query describes its requested interval and indexes; the saved coverage record retains gaps.

## 2. Host Agent and four Skills

`protocol-alpha-discovery` coordinates scope, stage handoffs, coverage, and stopping conditions. It spans three working stages:

1. **`alpha-seed-wallets`** verifies actual executors, distinguishes sender / helper / recipient roles, and merges wallet records while preserving all seed memberships.
2. **`wallet-alpha-investigation`** studies each wallet independently. The product presents History → Analyze → Search Alpha. The Agent investigates broader activity and produces candidate hypotheses, source transactions, alternative explanations, and falsification checks.
3. **`protocol-alpha-validation`** assesses the candidate's mechanism, historical evidence, current state, execution conditions, and missing checks.

Agent reasoning interprets observations and proposes hypotheses. Deterministic reconstruction, accounting, and state checks provide evidence for validation. The repository has collector and handoff checks; a general economics engine remains planned. The Skills run in the host Agent environment, using its tools and permissions.

## 3. Saved handoffs

The local `data/` directory is excluded from Git. These files connect the research stages to the application:

| Artifact | Producer / role |
| --- | --- |
| `strategy-wallet-discovery/strategy-wallets.json` | Seed coverage, wallet identities, discovery evidence |
| `wallet-alpha-investigation/history-summary.json` | Per-wallet history counts and coverage |
| `wallet-alpha-investigation/validation-handoff.json` | Candidate IDs, wallet provenance, supporting transactions, hypotheses |
| `protocol-alpha-validation/validation-results.json` | Candidate assessments, current observations, execution conditions |
| `protocol-alpha-validation/historical-ledgers.json` | Reconciled historical samples |
| `protocol-alpha-validation/state-index.json` and `supplement.json` | Saved current-state evidence |
| `protocol-alpha-discovery-test/research-record.json` | Final orchestration record and stopping reason |

Stage Markdown reports and original evidence remain available through allowlisted artifact links. The UI displays artifact timestamps for the saved run; these timestamps are distinct from individual wallet execution times.

## 4. Local application

### Adapter and API

[`research_adapter.py`](../scripts/research_adapter.py) normalizes saved artifacts into the frontend contract. It verifies candidate IDs, wallet identity, source-transaction correspondence, and the investigation input SHA-256 recorded by validation. A mismatch returns an error instead of attaching old validation to changed research.

[`serve_research.py`](../scripts/serve_research.py) exposes snapshot, wallet, candidate, report, activity, and allowlisted artifact endpoints. In development, the API uses port `5174` behind Vite on `5173`. After a build, the same Python server serves the application and API on `4173`.

`POST /api/research-runs` opens a view of saved research. The API reads existing artifacts; it has no integrated Agent runner or transaction-execution endpoint.

### Frontend

`ApiResearchDataSource` supplies the React + TypeScript workspace. The browser polls snapshots every five seconds, with an explicit Refresh results action. Its main surfaces are:

- independent wallet investigations;
- Alpha candidates with source evidence;
- report previews, a report library, and dedicated report pages;
- an auxiliary activity drawer exposing the four Skill stages.

English is the default. Chinese translations apply at the presentation layer while preserving identifiers, addresses, source URLs, and raw artifacts. The language preference, saved reports, and watchlist are stored locally in the browser. Markdown exports use the selected language.

### Synthetic Demo

`MockResearchDataSource` reads the implementation pack's mock data and feeds the same UI through an isolated timed replay. It simulates wallet progress and candidate validation over roughly 17 seconds, with pause and replay controls. Switching modes clears the current research view and selects the other data source. Run Discovery or replay restarts the synthetic run.

The [hosted Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html) is a static GitHub Pages build. It selects this mock data source and uses query-string routes for report links. The Python API and saved research artifacts remain local. The Pages workflow builds and deploys the frontend when `main` is updated.

## 5. Report outcomes and the discovery loop

Every candidate can produce an Alpha Report. The report disposition and the original opportunity assessment are separate fields:

| Report disposition | Meaning for review |
| --- | --- |
| `ACTIONABLE` | Evidence supports current execution under stated conditions |
| `MONITOR` | Preserve the supported historical mechanism and recheck current conditions |
| `REJECTED` | Record the evidence and reasons for excluding the candidate |
| `INSUFFICIENT_EVIDENCE` | Retain the hypothesis and the checks needed to assess it |

The current archive contains five reports: three Monitor and two Insufficient Evidence. All five retain `UNCERTAIN` as the original opportunity status. No candidate in this saved run has been promoted to a new seed.

An established mechanism may be proposed as a seed for a later research pass, carrying its current status and limits. Automatic seed expansion and the Protocol Alpha Graph are future capabilities.

## Current implementation and next work

| Available now | Planned |
| --- | --- |
| Host-executed Skills and saved handoffs | Integrated backend Agent runner |
| Snapshot polling and activity reconstructed from artifacts | Live job events |
| Collector verification and handoff consistency checks | General cash-flow, cost, and profitability validation |
| Local saved reports and watchlist | Scheduled monitoring jobs |
| Explicit next checks in every assessment | Reviewed seed expansion and Alpha Graph |

## Diagram sources

The overview keeps each box brief for presentations. English and Chinese SVGs share a fixed layout and are generated by [render_architecture.py](diagrams/render_architecture.py), using the Python standard library:

```bash
python3 docs/diagrams/render_architecture.py
```

The script also produces matching Mermaid files for graph editing. Detailed behavior and future work are documented above. Product screenshots were captured on 30 September 2026.
