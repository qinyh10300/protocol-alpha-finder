# 03 — Frontend Data Contract & Field Provenance

The frontend should consume backend APIs. It should not directly scan TRON in the browser for MVP.

The key rule:

> Every displayed field should have a clear source.

---

## 1. SeedAlpha

```ts
type SeedAlpha = {
  id: string
  name: string
  chain: "TRON" | string
  protocol?: string
  contractAddress?: string
  functionSignature?: string
  description?: string
  createdAt: string
}
```

### Source
Curated/backend database or config.

Do not add tags such as “permissionless”, “off-UI”, etc. unless backend explicitly provides and verifies them.

---

## 2. ResearchRun

```ts
type ResearchRun = {
  id: string
  seedId: string
  status: "idle" | "running" | "completed" | "failed" | "paused"
  startedAt?: string
  updatedAt?: string

  walletCount: number
  candidateCount: number
  reportCount: number
  loadedTransactionCount: number
}
```

### Source
Backend orchestration service.

---

## 3. StrategyWallet

```ts
type StrategyWallet = {
  address: string
  sourceSeedId: string

  discoveryEvidence?: {
    successfulSeedExecutions?: number
    firstSeen?: string
    lastSeen?: string
    txHashes?: string[]
  }

  historyJob: JobState & {
    txCount?: number
    fromBlock?: number
    toBlock?: number
    fromTime?: string
    toTime?: string
  }

  analysisJob: JobState
  alphaSearchJob: JobState

  candidateIds: string[]
}
```

```ts
type JobState = {
  status: "queued" | "running" | "completed" | "failed"
  startedAt?: string
  completedAt?: string
  error?: string
}
```

### Source
- wallet discovery: backend Seed scanner
- txCount/history range: wallet history ingestion service
- job states: agent/orchestration backend
- candidateIds: discovery engine

Possible TRON backend sources:
- TronGrid contract events / account transactions
- TRON RPC
- TronScan APIs
- indexed local database

Frontend only receives normalized data.

---

## 4. AlphaCandidate

```ts
type AlphaCandidate = {
  id: string
  title: string
  summary: string

  sourceWallets: string[]
  historicalExecutionCount?: number

  status: "discovered" | "validating" | "report_ready"

  validationId?: string
  reportId?: string

  createdAt: string
}
```

### Source
Discovery Agent / candidate synthesis backend.

Important:
- `title` is a hypothesis label generated after discovery.
- Do not attach a taxonomy icon.
- `historicalExecutionCount` must be backed by reconstructed supporting executions, not guessed.

---

## 5. CandidateValidation

```ts
type CandidateValidation = {
  id: string
  candidateId: string
  status: "queued" | "running" | "completed" | "failed"

  mechanism: ValidationSection
  historicalEvidence: ValidationSection
  currentState: ValidationSection
  executionConditions: ValidationSection

  outcome?: "ACTIONABLE" | "MONITOR" | "REJECTED" | "INSUFFICIENT_EVIDENCE"
  completedAt?: string
}
```

```ts
type ValidationSection = {
  status: "pending" | "running" | "confirmed" | "not_confirmed" | "uncertain"
  summary?: string
  evidenceRefs?: EvidenceRef[]
}
```

### Source
Validation backend combining:
- deterministic on-chain analysis
- agent reasoning
- current state reads
- economic calculation

---

## 6. AlphaReport

```ts
type AlphaReport = {
  id: string
  candidateId: string
  title: string
  outcome: "ACTIONABLE" | "MONITOR" | "REJECTED" | "INSUFFICIENT_EVIDENCE"

  executiveSummary: string

  mechanism: ReportSection
  historicalEvidence: ReportSection
  currentState: ReportSection
  executionConditions: ReportSection

  sourceWallets: string[]
  evidenceRefs: EvidenceRef[]

  generatedAt: string
  lastCheckedAt?: string
}
```

```ts
type ReportSection = {
  summary: string
  items?: {
    label: string
    value: string
  }[]
}
```

### Source
Report generator after/alongside validation.

Every Candidate can produce a Report, regardless of outcome.

---

## 7. EvidenceRef

```ts
type EvidenceRef =
  | {
      type: "transaction"
      chain: string
      txHash: string
      url?: string
    }
  | {
      type: "contract"
      chain: string
      address: string
      url?: string
    }
  | {
      type: "block"
      chain: string
      blockNumber: number
    }
  | {
      type: "document"
      title: string
      url: string
    }
```

Evidence refs make the research auditable.

---

## 8. ResearchActivityEvent

```ts
type ResearchActivityEvent = {
  id: string
  runId: string
  timestamp: string
  eventType:
    | "seed_scan"
    | "wallet_found"
    | "history_loaded"
    | "analysis_started"
    | "candidate_created"
    | "validation_started"
    | "report_generated"
    | "error"

  message: string

  entityType?: "wallet" | "candidate" | "report"
  entityId?: string
}
```

Used only in the optional activity drawer.

---

## 9. Suggested API shape

```text
GET  /api/research-runs/:id
POST /api/research-runs
GET  /api/research-runs/:id/wallets
GET  /api/research-runs/:id/candidates
GET  /api/research-runs/:id/reports
GET  /api/reports/:id
GET  /api/research-runs/:id/activity
```

For live updates:
- Server-Sent Events preferred for MVP
- WebSocket also acceptable
- polling every 1–2s acceptable for hackathon demo

Example SSE:
```text
GET /api/research-runs/:id/events
```

---

## 10. No-fake-data rule

Do not display a field unless:
- backend returns it, or
- demo mock explicitly contains it.

Avoid invented:
- success rates
- confidence scores
- “potential” scores
- wallet quality scores
- projected profit
unless backend has a real definition and calculation.
