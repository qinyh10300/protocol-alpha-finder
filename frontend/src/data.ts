import mockPayload from "../../Protocol_Alpha_Finder_Frontend_Implementation_Pack/06_MOCK_DATA.json";
import type {
  AlphaCandidate,
  AlphaReport,
  ResearchActivityEvent,
  ResearchRun,
  Snapshot,
  StrategyWallet,
} from "./types";

export interface ResearchDataSource {
  createRun(seedId: string): Promise<ResearchRun>;
  getRun(runId: string): Promise<ResearchRun>;
  getWallets(runId: string): Promise<StrategyWallet[]>;
  getCandidates(runId: string): Promise<AlphaCandidate[]>;
  getReports(runId: string): Promise<AlphaReport[]>;
  getReport(reportId: string): Promise<AlphaReport>;
  getSnapshot(runId: string): Promise<Snapshot>;
  subscribe?(
    runId: string,
    cb: (event: ResearchActivityEvent) => void,
  ): () => void;
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    signal: AbortSignal.timeout(10000),
  });
  const data = await response
    .json()
    .catch(() => ({ error: `HTTP ${response.status}` }));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data as T;
}
export class ApiResearchDataSource implements ResearchDataSource {
  constructor(private base = "/api") {}
  createRun(seedId: string) {
    return request<ResearchRun>(`${this.base}/research-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seedId, mode: "archive" }),
    });
  }
  getRun(id: string) {
    return request<ResearchRun>(
      `${this.base}/research-runs/${encodeURIComponent(id)}`,
    );
  }
  getWallets(id: string) {
    return request<StrategyWallet[]>(
      `${this.base}/research-runs/${encodeURIComponent(id)}/wallets`,
    );
  }
  getCandidates(id: string) {
    return request<AlphaCandidate[]>(
      `${this.base}/research-runs/${encodeURIComponent(id)}/candidates`,
    );
  }
  getReports(id: string) {
    return request<AlphaReport[]>(
      `${this.base}/research-runs/${encodeURIComponent(id)}/reports`,
    );
  }
  getReport(id: string) {
    return request<AlphaReport>(
      `${this.base}/reports/${encodeURIComponent(id)}`,
    );
  }
  getSnapshot(id: string) {
    return request<Snapshot>(
      `${this.base}/research-runs/${encodeURIComponent(id)}/snapshot`,
    );
  }
}

export class MockResearchDataSource implements ResearchDataSource {
  private started = false;
  private elapsed = 0;
  private epoch = 0;
  private paused = false;
  private get seconds() {
    return (
      this.elapsed +
      (this.started && !this.paused ? (Date.now() - this.epoch) / 1000 : 0)
    );
  }
  async createRun() {
    this.started = true;
    this.paused = false;
    this.elapsed = 0;
    this.epoch = Date.now();
    return (await this.getSnapshot()).run;
  }
  pause() {
    this.elapsed = this.seconds;
    this.paused = true;
  }
  resume() {
    this.epoch = Date.now();
    this.paused = false;
  }
  async getSnapshot(): Promise<Snapshot> {
    const data = structuredClone(mockPayload);
    const t = this.seconds;
    const wallets: StrategyWallet[] = this.started
      ? data.wallets
          .filter((_, i) => t >= 0.5 + i * 0.4)
          .map((w, i) => {
            const phase = t - i * 0.7;
            const job = (start: number, end: number) => ({
              status:
                phase < start
                  ? ("queued" as const)
                  : phase < end
                    ? ("running" as const)
                    : ("completed" as const),
            });
            return {
              ...w,
              historyJob: {
                ...job(1, 4),
                txCount: phase >= 4 ? w.historyJob.txCount : undefined,
              },
              analysisJob: job(4, 6),
              alphaSearchJob: job(6, 9),
              candidateIds: w.candidateIds.filter(
                (id) =>
                  data.candidates.findIndex((c) => c.id === id) * 1.4 + 9 <= t,
              ),
            };
          })
      : [];
    const candidates: AlphaCandidate[] = this.started
      ? data.candidates
          .filter((_, i) => t >= 9 + i * 1.4)
          .map((c, i) => ({
            ...c,
            status:
              t >= 13 + i * 1.8
                ? "report_ready"
                : t >= 10 + i * 1.4
                  ? "validating"
                  : "discovered",
            reportId: t >= 13 + i * 1.8 ? c.reportId : undefined,
          }))
      : [];
    const reports = data.reports
      .filter((r) => candidates.some((c) => c.reportId === r.id))
      .map((r) => ({
        ...r,
        historicalExecutionCount: data.candidates.find(
          (c) => c.id === r.candidateId,
        )?.historicalExecutionCount,
      })) as AlphaReport[];
    const run: ResearchRun = {
      ...data.run,
      walletCount: wallets.length,
      candidateCount: candidates.length,
      reportCount: reports.length,
      loadedTransactionCount: wallets.reduce(
        (n, w) => n + (w.historyJob.txCount || 0),
        0,
      ),
      status: !this.started
        ? "idle"
        : t >= 17
          ? "completed"
          : this.paused
            ? "paused"
            : "running",
    };
    const activity: ResearchActivityEvent[] = candidates.map((c, i) => ({
      id: `demo-c-${i}`,
      runId: run.id,
      timestamp: c.createdAt,
      eventType: "candidate_created",
      message: c.title,
      entityType: "candidate",
      entityId: c.id,
    }));
    reports.forEach((r) =>
      activity.push({
        id: r.id,
        runId: run.id,
        timestamp: r.generatedAt,
        eventType: "report_generated",
        message: r.title + " · " + r.outcome,
        entityType: "report",
        entityId: r.id,
      }),
    );
    return {
      run,
      seeds: [data.seed],
      wallets,
      candidates,
      reports,
      activity,
      skills: [],
      mode: "demo",
      note: "Synthetic demo · Timed replay of the implementation-pack mock data. Addresses, opportunity claims and timestamps are illustrative.",
    };
  }
  async getRun() {
    return (await this.getSnapshot()).run;
  }
  async getWallets() {
    return (await this.getSnapshot()).wallets;
  }
  async getCandidates() {
    return (await this.getSnapshot()).candidates;
  }
  async getReports() {
    return (await this.getSnapshot()).reports;
  }
  async getReport(id: string) {
    const report = mockPayload.reports.find((r) => r.id === id);
    if (!report) throw new Error("Report not found");
    return {
      ...report,
      historicalExecutionCount: mockPayload.candidates.find(
        (c) => c.id === report.candidateId,
      )?.historicalExecutionCount,
    } as AlphaReport;
  }
}
