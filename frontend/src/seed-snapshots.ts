import { ALL_SEEDS, PROTOCOL_SEEDS, SEED_SHORT_NAMES } from "./seeds";
import type {
  AlphaCandidate,
  AlphaReport,
  Snapshot,
  StrategyWallet,
} from "./types";

const union = (a: string[] = [], b: string[] = []) => [
  ...new Set([...a, ...b]),
];

/** Merge by stable identity, retaining every seed membership and evidence source. */
export function combineSeedSnapshots(snapshots: Snapshot[]): Snapshot {
  const wallets = new Map<string, StrategyWallet>();
  const candidates = new Map<string, AlphaCandidate>();
  const reports = new Map<string, AlphaReport>();
  for (const snapshot of snapshots) {
    const seedId = snapshot.run.seedId;
    const provenance =
      snapshot.provenance === "recorded" ? "recorded" : "synthetic";
    for (const wallet of snapshot.wallets) {
      const prior = wallets.get(wallet.address);
      wallets.set(wallet.address, {
        ...wallet,
        provenance,
        sourceSeedIds: union(
          prior?.sourceSeedIds,
          union(wallet.sourceSeedIds, [seedId]),
        ),
        candidateIds: union(prior?.candidateIds, wallet.candidateIds),
        historyJob: {
          ...wallet.historyJob,
          // A shared wallet's history is counted once, not once for each seed.
          txCount:
            prior?.historyJob.txCount == null
              ? wallet.historyJob.txCount
              : Math.max(
                  prior.historyJob.txCount,
                  wallet.historyJob.txCount || 0,
                ),
        },
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
    mode: "demo",
    provenance: "mixed",
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
    note: "All seeds · Energy Rental uses synthetic examples. JustLend and USDD use recorded research. Playback does not start a new on-chain search.",
  };
}
