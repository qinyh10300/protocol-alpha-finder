import energyReplay from "../public/research/energy-rental-liquidation.json" with { type: "json" };
import lendingReplay from "../public/research/justlend-lending-liquidation.json" with { type: "json" };
import usddReplay from "../public/research/usdd-keeper-auction.json" with { type: "json" };
import { ALL_SEEDS, DEFAULT_DEMO_SEED, PROTOCOL_SEEDS } from "./seeds";
import { combineSeedSnapshots } from "./seed-snapshots";
import type {
  AlphaCandidate,
  AlphaReport,
  ResearchActivityEvent,
  ResearchRun,
  Snapshot,
  StrategyWallet,
} from "./types";

// Checked-in exports are usable on GitHub Pages without the local Python API.
const recordedReplays: Record<string, Snapshot> = {
  "energy-rental-liquidation": energyReplay as Snapshot,
  "justlend-lending-liquidation": lendingReplay as Snapshot,
  "usdd-keeper-auction": usddReplay as Snapshot,
};

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

export class RecordedResearchDataSource implements ResearchDataSource {
  private seedId = DEFAULT_DEMO_SEED;
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
  selectSeed(seedId: string) {
    if (
      seedId !== "all" &&
      !PROTOCOL_SEEDS.some((seed) => seed.id === seedId)
    ) {
      throw new Error("Unknown research seed");
    }
    if (this.seedId === seedId) return;
    this.seedId = seedId;
    this.started = false;
    this.paused = false;
    this.elapsed = 0;
    this.epoch = 0;
  }
  async createRun(seedId = this.seedId) {
    this.selectSeed(seedId);
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
    if (this.seedId === "all") {
      return combineSeedSnapshots(
        await Promise.all(
          PROTOCOL_SEEDS.map((seed) => this.getSeedSnapshot(seed.id)),
        ),
      );
    }
    return this.getSeedSnapshot(this.seedId);
  }
  private async getSeedSnapshot(seedId: string): Promise<Snapshot> {
    const data = structuredClone(recordedReplays[seedId]);
    const t = this.seconds;
    const wallets: StrategyWallet[] = this.started
      ? data.wallets
          .filter((_, i) => t >= 0.5 + i * 0.4)
          .map((w, i) => {
            const phase = t - i * 0.7;
            const job = (
              start: number,
              end: number,
              final: StrategyWallet["analysisJob"],
            ) => ({
              ...final,
              status:
                phase < start
                  ? ("queued" as const)
                  : phase < end
                    ? ("running" as const)
                    : final.status,
            });
            return {
              ...w,
              sourceSeedId: seedId,
              historyJob: {
                ...job(1, 4, w.historyJob),
                txCount: phase >= 4 ? w.historyJob.txCount : undefined,
              },
              analysisJob: job(4, 6, w.analysisJob),
              alphaSearchJob: job(6, 9, w.alphaSearchJob),
              candidateIds: data.candidates
                .filter(
                  (candidate, index) =>
                    candidate.sourceWallets.includes(w.address) &&
                    index * 1.4 + 9 <= t,
                )
                .map((candidate) => candidate.id),
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
                ? c.reportId
                  ? "report_ready"
                  : "discovered"
                : t >= 10 + i * 1.4
                  ? "validating"
                  : "discovered",
            reportId: t >= 13 + i * 1.8 ? c.reportId : undefined,
          }))
      : [];
    const reports = data.reports.filter((report) =>
      candidates.some((candidate) => candidate.reportId === report.id),
    );
    const run: ResearchRun = {
      ...data.run,
      id: `run-demo-${seedId}`,
      seedId: seedId,
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
    const activity = data.activity
      .filter((event) => {
        if (event.entityType === "wallet")
          return wallets.some(
            (w) =>
              w.address === event.entityId &&
              (event.eventType !== "history_loaded" ||
                w.historyJob.txCount != null),
          );
        if (event.entityType === "candidate")
          return candidates.some((c) => c.id === event.entityId);
        if (event.entityType === "report")
          return reports.some((r) => r.id === event.entityId);
        return this.started && t >= 1;
      })
      .map((event) => ({ ...event, runId: run.id }));
    return {
      run,
      seeds: [
        { ...ALL_SEEDS },
        ...PROTOCOL_SEEDS.map((seed) => ({
          ...seed,
          ...structuredClone(
            recordedReplays[seed.id].seeds.find(
              (entry) => entry.id === seed.id,
            ),
          ),
        })),
      ],
      wallets,
      candidates,
      reports,
      activity,
      skills: data.skills.map((skill, index) => ({
        ...skill,
        status:
          !this.started || t < [0, 3, 12][index]
            ? "queued"
            : t >= [3, 12, 17][index]
              ? skill.status
              : "running",
        completedAt:
          this.started && t >= [3, 12, 17][index]
            ? skill.completedAt
            : undefined,
      })),
      mode: "demo",
      provenance: "recorded",
      window: data.window,
      note: data.note,
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
    const report = Object.values(recordedReplays)
      .flatMap((snapshot) => snapshot.reports)
      .find((report) => report.id === id);
    if (!report) throw new Error("Report not found");
    return structuredClone(report);
  }
}
