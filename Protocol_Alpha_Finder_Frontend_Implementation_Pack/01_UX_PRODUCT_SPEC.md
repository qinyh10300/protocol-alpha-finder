# 01 — UX & Product Spec

## 1. Product role

Protocol Alpha Finder is an AI-assisted protocol research workspace.

Its job is to reduce the human burden of finding non-obvious Protocol Alpha.

The core loop is:

```text
Known Protocol Alpha
        ↓
Discover Strategy Wallets
        ↓
Investigate each wallet independently
        ↓
Discover Alpha Candidates
        ↓
Validate every Candidate
        ↓
Generate an Alpha Report
        ↓
Human reviews / monitors / acts
        ↓
Optionally promote validated Alpha as a new discovery seed
```

The primary product output is **Alpha Report**.
“Promote to Seed” is secondary; it expands the discovery flywheel but is not the user's end goal.

---

## 2. UX goals

The UI must make three things immediately obvious:

1. **The idea is real:** a known Seed actually expands into real wallet addresses.
2. **The system is running:** each Strategy Wallet is independently researched with real history ingestion and agent analysis.
3. **The output is useful:** every Candidate gets a human-readable report with evidence, current state, and execution conditions.

The UI should feel like a **research workspace**, not a trading terminal and not a developer console.

---

## 3. Information architecture

### Main workspace: `/research`

Use a single-page research workspace with three main columns:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Current Research Run: Seed → Wallets → Candidates → Reports        │
├───────────────────┬────────────────────────┬─────────────────────────┤
│ Wallet            │ Alpha                  │ Alpha                   │
│ Investigations    │ Candidates             │ Reports                 │
│                   │                        │                         │
│ independent jobs  │ discovery outputs      │ human-facing outputs    │
└───────────────────┴────────────────────────┴─────────────────────────┘
```

This is not a linear global progress bar.

The runtime structure is:

```text
Seed
 ├─ Wallet A: History → Analyze → Search Alpha
 ├─ Wallet B: History → Analyze → Search Alpha
 └─ Wallet C: History → Analyze → Search Alpha

Wallet A/B/C may all support the same Candidate.

Candidate X: Validation pipeline → Report
Candidate Y: Validation pipeline → Report
```

The frontend should represent this as **parallel jobs**, not a fake single stepper.

---

## 4. Top research summary

At the top of `/research`, show only these real aggregate objects:

- Current Seed name
- Strategy Wallets found
- Alpha Candidates discovered
- Alpha Reports generated
- Research run status (`Running`, `Completed`, `Paused`, `Failed`)

Example:

```text
Current Seed             17 Strategy Wallets   4 Candidates   3 Reports
Energy Rental Liquidation
```

No TVL, no “alpha score”, no growth percentages.

The top summary is a compact explanation of the current run, not a KPI dashboard.

---

## 5. Wallet Investigations column

### Purpose

Make the transition **Seed Alpha → Strategy Wallets** concrete.

Each row is one independent research job.

### Required row fields

- wallet address (shortened)
- transaction count loaded
- three job stages:
  - `History`
  - `Analyze`
  - `Search Alpha`
- current status:
  - `Queued`
  - `Running`
  - `Completed`
  - `Failed`
- result:
  - number of candidates found, if any

Example:

```text
TJ8e...3K2a    1,842 tx
History ✓  Analyze ✓  Search Alpha ●
2 candidates
```

### Important

Do **not** show:
- protocol tags beside the wallet unless they are directly relevant to the research job
- transaction classifications
- wallet scores
- arbitrary badges like “Smart”, “High activity”, “Expert”

The reason the wallet is here is already known: it was found from the Seed.

### Expansion/drill-down

Clicking a wallet row may open a side drawer with:
- full address
- source Seed
- history range
- ingestion status
- candidate IDs produced from this wallet
- source/evidence links

This drill-down is optional for the demo.

---

## 6. What “Analyze” means

The frontend should not expose low-level internal reasoning.

The backend/agent may internally:
- decode contract calls
- inspect protocol docs/ABI
- reconstruct flows
- group sequences
- compare repeated behavior
- reason about economic effects

But the main UI only needs to show:

```text
History ✓
Analyze ●
Search Alpha ○
```

If the user expands details, a compact activity description is okay:

- “Loaded full wallet history”
- “Resolved contract context”
- “Reconstructed economic flows”
- “Searching for non-obvious protocol opportunities”

Do not present “tagging transactions” as the product.

---

## 7. Alpha Candidates column

### Purpose

This is the center of the product.

A Candidate is a hypothesis that may or may not become actionable Alpha.

Each Candidate should be visually plain and research-oriented.
Avoid decorative icons that imply a known taxonomy.

### Required fields

- candidate title/hypothesis
- one-sentence summary
- source wallet count
- historical evidence count (if available)
- validation state
- report state

Example:

```text
USDD Keeper Reward

Hypothesis:
A public keeper action may generate a protocol-defined reward.

Found from 5 wallets
17 historical executions

Validation: Running
Report: Draft
```

### Candidate statuses

Use states that have clear meaning:

- `DISCOVERED`
- `VALIDATING`
- `REPORT_READY`

Do not use vague “Potential: High/Medium/Low” unless the backend actually defines and computes that metric.

---

## 8. Validation model

Every Candidate should go through its own validation pipeline.

Validation is important and visible, but it is not a global stage.

Use four evidence groups:

1. **Mechanism**
   - What protocol rule creates the economic opportunity?
2. **Historical Evidence**
   - Was this actually executed historically?
   - By how many wallets / how many times?
3. **Current State**
   - Does the contract/mechanism still exist now?
4. **Execution Conditions**
   - What conditions must hold for execution to be profitable or possible?

Candidate outcome is one of:

- `ACTIONABLE`
- `MONITOR`
- `REJECTED`
- `INSUFFICIENT_EVIDENCE`

Important: every Candidate can still have a Report.
A non-actionable Candidate may be useful to monitor or document.

---

## 9. Alpha Reports column

### Purpose

This is the main human-facing product output.

Every Candidate produces a report object. The report outcome may differ.

The main workspace shows a compact report preview.
Clicking it opens a dedicated report page.

### Report preview fields

- Alpha name
- outcome (`ACTIONABLE`, `MONITOR`, `REJECTED`, `INSUFFICIENT_EVIDENCE`)
- source wallet count
- historical execution count
- one-sentence summary
- `Open Full Report`

Do not show decorative charts by default.

---

## 10. Dedicated Alpha Report page: `/reports/:reportId`

The report should read like a research memo, not a dashboard.

### Sections

#### A. Executive Summary
- What is the opportunity?
- Is it actionable now?
- What is the main caveat?

#### B. Mechanism
- protocol
- contract(s)
- function(s)
- mechanism explanation

#### C. Historical Evidence
- source wallets
- successful executions
- observed date range
- example tx hashes / explorer links
- historical economics if calculable

#### D. Current State
- contract active?
- mechanism still available?
- relevant parameters
- last checked timestamp

#### E. Execution Conditions
- capital/resource requirements
- timing requirements
- competition
- transaction cost / Energy / gas
- conditions required for profitability

#### F. Outcome
- `ACTIONABLE`
- `MONITOR`
- `REJECTED`
- `INSUFFICIENT_EVIDENCE`

#### G. Human actions
- Save Report
- Export / Share
- Monitor Opportunity
- Promote to Discovery Seed (secondary)

---

## 11. “Realness” without over-detail

Use real data to establish credibility, but do not drown the UI in detail.

Good:
- 17 wallets found
- 3,883 transactions loaded
- 5 source wallets
- 17 historical executions
- contract address
- tx hash
- last checked timestamp

Bad:
- meaningless progress score
- fabricated success rate
- decorative charts
- dozens of transaction rows
- arbitrary Wallet Intelligence Score

Principle:

> **Transactions are evidence volume, not the main UI content. Alpha is the content.**

---

## 12. Run activity

A large permanent “Live Evidence” panel is not required.

Use a compact run status strip:

```text
Running · 17 wallets found · 3,883 tx loaded · 4 candidates · 3 reports
```

Add a `View run activity` drawer for demo credibility.

The drawer may show timestamped events:

```text
14:22 Seed scan started
14:23 Wallet TJ8... found
14:24 1,842 tx loaded for TJ8...
14:26 Candidate USDD Keeper Reward created
14:27 Validation started
14:29 Report generated
```

The log supports trust but is not the product.

---

## 13. Interaction model

Primary interaction is low-touch.

### Main demo flow

1. User selects/starts from Seed
2. Click `Run Discovery`
3. Wallet jobs appear progressively
4. Wallet jobs run independently
5. Candidate cards appear when produced
6. Candidate validation begins automatically
7. Reports appear when ready
8. User opens a Report for human review

Optional interactions:
- open wallet details
- view source tx/explorer
- open candidate details
- open report
- replay demo

The demo should work even if the user only clicks `Run Discovery` and then `Open Full Report`.

---

## 14. Animation / transition guidance

Use motion only to make causality visible.

### Wallet discovery
New wallet rows appear one by one.

### Wallet investigation
Each wallet row progresses independently:
`History → Analyze → Search Alpha`

### Candidate creation
Candidate card slides/fades into the Candidate column from the related wallet investigation completion.

### Validation
Validation state changes on Candidate:
`DISCOVERED → VALIDATING → REPORT_READY`

### Report
A report preview appears in the Reports column.

Avoid:
- particle effects
- animated graphs
- pulsing badges everywhere
- decorative number counters

---

## 15. Demo storytelling

The UI should visually support this narration:

> We start from a known Protocol Alpha.
> It gives us a set of Strategy Wallets.
> Every wallet becomes an independent research job.
> The agent searches their full history for non-obvious protocol opportunities.
> Those hypotheses become Alpha Candidates.
> Each Candidate is validated and turned into an Alpha Report.
> Humans use the report to decide whether to act, monitor, or reject the opportunity.

This is the core UX.
