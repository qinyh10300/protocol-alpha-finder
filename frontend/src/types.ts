export type JobStatus = "queued" | "running" | "completed" | "failed";
export type Outcome =
  "ACTIONABLE" | "MONITOR" | "REJECTED" | "INSUFFICIENT_EVIDENCE";
export type JobState = {
  status: JobStatus;
  error?: string;
  completedAt?: string;
};
export type EvidenceRef = {
  type: "transaction" | "contract" | "document" | "block";
  title?: string;
  url?: string;
  txHash?: string;
  address?: string;
  blockNumber?: number;
};
export type Seed = {
  id: string;
  name: string;
  chain: string;
  protocol?: string;
  description?: string;
  walletCount?: number;
  coverage?: string;
  gaps?: string[];
};
export type ResearchRun = {
  id: string;
  seedId: string;
  status: "idle" | "running" | "completed" | "failed" | "paused";
  startedAt?: string;
  updatedAt?: string;
  walletCount: number;
  candidateCount: number;
  reportCount: number;
  loadedTransactionCount: number;
};
export type StrategyWallet = {
  provenance?: "recorded" | "synthetic";
  address: string;
  sourceSeedId: string;
  sourceSeedIds?: string[];
  historyJob: JobState & {
    txCount?: number;
    fromTime?: string;
    toTime?: string;
  };
  analysisJob: JobState;
  alphaSearchJob: JobState;
  candidateIds: string[];
  evidenceRefs?: EvidenceRef[];
  coverageNote?: string;
};
export type AlphaCandidate = {
  provenance?: "recorded" | "synthetic";
  sourceSeedIds?: string[];
  id: string;
  title: string;
  summary: string;
  sourceWallets: string[];
  historicalExecutionCount?: number;
  evidenceCountLabel?: string;
  status: "discovered" | "validating" | "report_ready";
  reportId?: string;
  createdAt: string;
  validation?: {
    mechanism: string;
    historicalEvidence: string;
    currentState: string;
    executionConditions: string;
  };
};
export type ReportSection = {
  summary: string;
  items?: { label: string; value: string }[];
};
export type AlphaReport = {
  sourceSeedIds?: string[];
  provenance?: "recorded" | "synthetic";
  id: string;
  candidateId: string;
  title: string;
  outcome: Outcome;
  executiveSummary: string;
  mechanism: ReportSection;
  historicalEvidence: ReportSection;
  currentState: ReportSection;
  executionConditions: ReportSection;
  sourceWallets: string[];
  evidenceRefs: EvidenceRef[];
  generatedAt: string;
  lastCheckedAt?: string;
  historicalExecutionCount?: number;
  evidenceCountLabel?: string;
  rawCurrentState?: string;
  outcomeReason?: string;
  missingEvidence?: string[];
  nextChecks?: string[];
  alternativeExplanations?: string[];
};
export type ResearchActivityEvent = {
  id: string;
  runId: string;
  timestamp: string;
  eventType: string;
  message: string;
  entityType?: string;
  entityId?: string;
  sourceUrl?: string;
  skill?: string;
};
export type SkillStage = {
  id: string;
  name: string;
  summary: string;
  status: JobStatus;
  completedAt?: string;
  sourceUrl: string;
  artifactUrl: string;
};
export type Snapshot = {
  provenance?: "recorded" | "synthetic" | "mixed";
  run: ResearchRun;
  seeds: Seed[];
  wallets: StrategyWallet[];
  candidates: AlphaCandidate[];
  reports: AlphaReport[];
  activity: ResearchActivityEvent[];
  skills: SkillStage[];
  mode: "archive" | "demo";
  window?: { from: string; to: string };
  note?: string;
};
