import { ALL_SEEDS, PROTOCOL_SEEDS, SEED_SHORT_NAMES } from "./seeds";
import type {
  AlphaCandidate,
  AlphaReport,
  JobState,
  JobStatus,
  Snapshot,
  StrategyWallet,
} from "./types";

const union = (a: string[] = [], b: string[] = []) => [
  ...new Set([...a, ...b]),
];

const JOB_STATUS_ORDER: Record<JobStatus, number> = {
  queued: 0,
  failed: 1,
  running: 2,
  completed: 3,
};

function advancedJob<T extends JobState>(prior: T | undefined, next: T): T {
  return prior && compareJobs(prior, next) >= 0 ? prior : next;
}

function compareJobs(first: JobState, second: JobState): number {
  if (!!first.illustrative !== !!second.illustrative) {
    return first.illustrative ? -1 : 1;
  }
  return JOB_STATUS_ORDER[first.status] - JOB_STATUS_ORDER[second.status];
}

/** Merge by stable identity, retaining every seed membership and evidence source. */
export function combineSeedSnapshots(snapshots: Snapshot[]): Snapshot {
  const wallets = new Map<string, StrategyWallet>();
  const candidates = new Map<string, AlphaCandidate>();
  const reports = new Map<string, AlphaReport>();
  for (const snapshot of snapshots) {
    const seedId = snapshot.run.seedId;
    const provenance = "recorded";
    for (const wallet of snapshot.wallets) {
      const prior = wallets.get(wallet.address);
      // Illustrative progress must not replace a recorded research stage.
      const historyComparison = prior
        ? compareJobs(prior.historyJob, wallet.historyJob)
        : -1;
      const historySource =
        prior &&
        (historyComparison > 0 ||
          (historyComparison === 0 &&
            (prior.historyJob.txCount ?? -1) >=
              (wallet.historyJob.txCount ?? -1)))
          ? prior
          : wallet;
      const otherHistory = historySource === prior ? wallet : prior;
      const transactionCounts = [
        prior?.historyJob.txCount,
        wallet.historyJob.txCount,
      ].filter((count): count is number => count != null);
      wallets.set(wallet.address, {
        ...wallet,
        provenance,
        sourceSeedId: historySource.sourceSeedId,
        coverageNote: historySource.coverageNote ?? otherHistory?.coverageNote,
        sourceSeedIds: union(
          prior?.sourceSeedIds,
          union(wallet.sourceSeedIds, [seedId]),
        ),
        candidateIds: union(prior?.candidateIds, wallet.candidateIds),
        historyJob: {
          ...historySource.historyJob,
          fromTime:
            historySource.historyJob.fromTime ??
            otherHistory?.historyJob.fromTime,
          toTime:
            historySource.historyJob.toTime ?? otherHistory?.historyJob.toTime,
          // A shared wallet's history is counted once, not once for each seed.
          txCount: transactionCounts.length
            ? Math.max(...transactionCounts)
            : undefined,
        },
        analysisJob: advancedJob(prior?.analysisJob, wallet.analysisJob),
        alphaSearchJob: advancedJob(
          prior?.alphaSearchJob,
          wallet.alphaSearchJob,
        ),
        evidenceRefs: [
          ...new Map(
            [
              ...(prior?.evidenceRefs || []),
              ...(wallet.evidenceRefs || []),
            ].map((ref) => [JSON.stringify(ref), ref]),
          ).values(),
        ],
      });
    }
    for (const candidate of snapshot.candidates) {
      const prior = candidates.get(candidate.id);
      candidates.set(candidate.id, {
        ...candidate,
        provenance,
        sourceSeedIds: union(prior?.sourceSeedIds, [seedId]),
        sourceWallets: union(prior?.sourceWallets, candidate.sourceWallets),
      });
    }
    for (const report of snapshot.reports) {
      const prior = reports.get(report.id);
      reports.set(report.id, {
        ...report,
        provenance,
        sourceSeedIds: union(prior?.sourceSeedIds, [seedId]),
        sourceWallets: union(prior?.sourceWallets, report.sourceWallets),
      });
    }
  }
  const runId = "run-demo-all";
  const statuses = snapshots.map((s) => s.run.status);
  const status = statuses.every((s) => s === "idle")
    ? "idle"
    : statuses.every((s) => s === "completed")
      ? "completed"
      : statuses.includes("failed")
        ? "failed"
        : statuses.includes("paused")
          ? "paused"
          : "running";
  return {
    illustrativeProgress: snapshots.some(
      (snapshot) => snapshot.illustrativeProgress,
    ),
    mode: "demo",
    provenance: "recorded",
    run: {
      id: runId,
      seedId: "all",
      status,
      walletCount: wallets.size,
      candidateCount: candidates.size,
      reportCount: reports.size,
      loadedTransactionCount: [...wallets.values()].reduce(
        (total, wallet) => total + (wallet.historyJob.txCount || 0),
        0,
      ),
    },
    seeds: [
      ALL_SEEDS,
      ...PROTOCOL_SEEDS.map((seed) => {
        const snapshot = snapshots.find((s) => s.run.seedId === seed.id);
        return {
          ...seed,
          ...snapshot?.seeds.find((s) => s.id === seed.id),
          walletCount: snapshot?.wallets.length || 0,
        };
      }),
    ],
    wallets: [...wallets.values()],
    candidates: [...candidates.values()],
    reports: [...reports.values()],
    activity: snapshots.flatMap((snapshot) =>
      snapshot.activity.map((event) => ({
        ...event,
        id: `${snapshot.run.seedId}:${event.id}`,
        runId,
        message: `${SEED_SHORT_NAMES[snapshot.run.seedId]} · ${event.message}`,
      })),
    ),
    skills: snapshots.flatMap((snapshot) =>
      snapshot.skills.map((skill) => ({
        ...skill,
        id: `${snapshot.run.seedId}:${skill.id}`,
        name: `${SEED_SHORT_NAMES[snapshot.run.seedId]} · ${skill.name}`,
      })),
    ),
    note: snapshots.some((snapshot) => snapshot.illustrativeProgress)
      ? "Research replay · USDD stage progress is illustrative; wallet identities and research evidence remain recorded."
      : "Saved Skill research · Replay follows the recorded results and does not run a new on-chain search.",
  };
}
