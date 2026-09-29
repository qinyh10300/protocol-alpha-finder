# 05 — Coding Agent Implementation Brief

## Goal

Implement a polished hackathon MVP frontend for **Protocol Alpha Finder**.

The frontend must communicate the product idea clearly and credibly:

> Known Protocol Alpha → Strategy Wallets → Independent Wallet Investigations → Alpha Candidates → Alpha Reports

The product is an AI-assisted protocol research tool, not a trading dashboard.

---

## Required routes

### `/research`
Main workspace.

Layout:
1. Header
2. Research run summary
3. Three-column workspace:
   - Wallet Investigations
   - Alpha Candidates
   - Alpha Reports
4. Optional run activity drawer

### `/reports/:reportId`
Human-readable Alpha Report page.

Optional:
### `/reports`
Report library

---

## Required components

- `AppHeader`
- `ResearchRunSummary`
- `WalletInvestigationList`
- `WalletInvestigationRow`
- `AlphaCandidateList`
- `AlphaCandidateCard`
- `AlphaReportList`
- `AlphaReportPreview`
- `AlphaReportPage`
- `ResearchActivityDrawer`
- `StatusChip`
- `PipelineStatus`

---

## Main workspace behavior

### ResearchRunSummary
Show:
- current Seed
- wallets found
- candidates
- reports
- run status

No decorative KPI cards beyond these actual objects.

### Wallet Investigations
Each wallet row:
- address
- tx count
- independent pipeline:
  - History
  - Analyze
  - Search Alpha
- status
- candidate count

Do not list transactions.

### Alpha Candidates
Each card:
- title
- one-sentence hypothesis
- source wallet count
- historical execution count
- validation/report status
- action: `Open Report` when available

Do not use category icons.

### Alpha Reports
Each preview:
- title
- outcome
- executive summary
- source wallet count
- historical execution count
- last checked
- `Open Full Report`

---

## Report page

Sections:
1. Executive Summary
2. Mechanism
3. Historical Evidence
4. Current State
5. Execution Conditions
6. Source Evidence
7. Human Actions

Outcomes:
- ACTIONABLE
- MONITOR
- REJECTED
- INSUFFICIENT_EVIDENCE

Every Candidate can produce a report.

---

## Visual style

Use:
- light theme
- white / very light gray background
- blue primary
- restrained status colors
- cards with thin borders
- 8px spacing system
- medium corner radius
- minimal shadows
- Inter/Geist/system font

Avoid:
- TRON red/black branding theme
- neon/cyber styling
- decorative charts
- candidate category icons
- giant text
- meaningless badges
- gradients unless very subtle

---

## Runtime integration

Support two modes:

### 1. Demo mode
Use `06_MOCK_DATA.json` and timed event updates.

### 2. API mode
Use normalized endpoints described in `03_DATA_CONTRACT.md`.

Prefer one data adapter layer:

```ts
interface ResearchDataSource {
  createRun(seedId: string): Promise<ResearchRun>
  getRun(runId: string): Promise<ResearchRun>
  getWallets(runId: string): Promise<StrategyWallet[]>
  getCandidates(runId: string): Promise<AlphaCandidate[]>
  getReports(runId: string): Promise<AlphaReport[]>
  getReport(reportId: string): Promise<AlphaReport>
  subscribe?(runId: string, cb: (event: ResearchActivityEvent) => void): () => void
}
```

Implement:
- `MockResearchDataSource`
- `ApiResearchDataSource`

This allows backend replacement without changing UI.

---

## Recommended stack

- React / Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui optional
- Lucide icons only for generic UI actions
- no category-specific Candidate icons
- SSE or polling for run updates

---

## Acceptance criteria

A reviewer should understand within 30 seconds:

1. We start from a Seed Protocol Alpha.
2. That Seed discovers Strategy Wallets.
3. Each Wallet is independently investigated.
4. Wallet investigations produce Protocol Alpha Candidates.
5. Each Candidate is validated and gets an Alpha Report.
6. Reports help humans decide: Actionable / Monitor / Rejected / Insufficient Evidence.

The page should feel like a real research tool, not a pitch slide.

---

## Important implementation rule

If a piece of information does not have a backend/mock field in the data contract, do not invent it for visual decoration.
