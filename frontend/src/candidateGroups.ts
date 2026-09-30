import type { AlphaCandidate, AlphaReport, Snapshot } from "./types";

export type CandidateGroup = {
  /** Stable within the raw research data, regardless of presentation language. */
  key: string;
  /** A presentation copy; source candidates and reports are never changed. */
  candidate: AlphaCandidate;
  members: AlphaCandidate[];
  reportIds: string[];
};

type GroupingContext = Pick<
  Snapshot,
  "seeds" | "wallets" | "reports" | "run" | "provenance" | "mode"
>;

const normalize = (value: string) =>
  value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const unique = <T>(values: T[]) => [...new Set(values)];

function memberReports(candidate: AlphaCandidate, reports: AlphaReport[]) {
  return reports.filter(
    (report) =>
      report.candidateId === candidate.id || report.id === candidate.reportId,
  );
}

function groupKey(candidate: AlphaCandidate, context: GroupingContext): string {
  const wallets = context.wallets.filter((wallet) =>
    candidate.sourceWallets.includes(wallet.address),
  );
  const reports = memberReports(candidate, context.reports);
  const seedIds = unique([
    ...(candidate.sourceSeedIds || []),
    ...wallets.flatMap((wallet) => [
      wallet.sourceSeedId,
      ...(wallet.sourceSeedIds || []),
    ]),
    ...reports.flatMap((report) => report.sourceSeedIds || []),
  ]);
  if (!seedIds.length) seedIds.push(context.run.seedId);
  const chains = unique(
    seedIds.map((id) => {
      const chain = context.seeds.find((seed) => seed.id === id)?.chain;
      return chain ? normalize(chain) : "";
    }),
  );
  const provenance = unique([
    ...(candidate.provenance ? [candidate.provenance] : []),
    ...wallets.flatMap((wallet) =>
      wallet.provenance ? [wallet.provenance] : [],
    ),
    ...reports.flatMap((report) =>
      report.provenance ? [report.provenance] : [],
    ),
  ]);
  if (
    !provenance.length &&
    context.provenance !== "mixed" &&
    context.provenance
  ) {
    provenance.push(context.provenance);
  }
  if (
    !provenance.length &&
    !context.provenance &&
    context.mode === "archive" &&
    ![...context.wallets, ...context.reports].some(
      (entity) => entity.provenance === "synthetic",
    )
  ) {
    // Older archive responses predate provenance fields. Demo and mixed data
    // still require explicit provenance to establish a shared source scope.
    provenance.push("recorded");
  }

  // Unknown/mixed scope cannot establish that two mechanisms are equivalent.
  // Exact mechanism text is required; identical titles alone are insufficient.
  const summary = normalize(candidate.summary);
  if (
    !summary ||
    chains.length !== 1 ||
    !chains[0] ||
    provenance.length !== 1
  ) {
    return JSON.stringify(["candidate", candidate.id]);
  }
  return JSON.stringify([
    "mechanism",
    chains[0],
    provenance[0],
    normalize(candidate.title),
    summary,
  ]);
}

function executionCount(
  members: AlphaCandidate[],
  reports: AlphaReport[],
): number | undefined {
  if (members.length === 1) return members[0].historicalExecutionCount;
  const evidenceLabels = unique(
    members.map(
      (candidate) => candidate.evidenceCountLabel || "historical executions",
    ),
  );
  if (evidenceLabels.length !== 1) return undefined;
  const transactions = new Set<string>();
  for (const candidate of members) {
    const hashes = unique(
      memberReports(candidate, reports).flatMap((report) =>
        report.evidenceRefs.flatMap((ref) =>
          ref.type === "transaction" && ref.txHash
            ? [ref.txHash.toLowerCase()]
            : [],
        ),
      ),
    );
    // Only sum evidence we can deduplicate. Partial references cannot establish
    // whether separate wallets' execution counts overlap.
    if (hashes.length !== candidate.historicalExecutionCount) return undefined;
    hashes.forEach((hash) => transactions.add(hash));
  }
  return transactions.size;
}

/**
 * Group raw, unlocalized candidates for display, preserving wallet-specific
 * findings and reports. Filter candidates by wallet before calling this helper
 * when the card totals should describe only that wallet's evidence.
 */
export function groupCandidates(
  candidates: AlphaCandidate[],
  context: GroupingContext,
): CandidateGroup[] {
  const groups = new Map<string, AlphaCandidate[]>();
  const seenIds = new Set<string>();
  for (const candidate of candidates) {
    if (seenIds.has(candidate.id)) continue;
    seenIds.add(candidate.id);
    const key = groupKey(candidate, context);
    const members = groups.get(key) || [];
    members.push(candidate);
    groups.set(key, members);
  }
  return [...groups].map(([key, members]) => {
    const reportIds = unique(
      members.flatMap((candidate) => [
        ...(candidate.reportId ? [candidate.reportId] : []),
        ...memberReports(candidate, context.reports).map((report) => report.id),
      ]),
    );
    const sourceSeedIds = unique(
      members.flatMap((candidate) => candidate.sourceSeedIds || []),
    );
    const status = members.every(
      (candidate) => candidate.status === "report_ready",
    )
      ? "report_ready"
      : members.some((candidate) => candidate.status === "validating")
        ? "validating"
        : "discovered";
    return {
      key,
      members,
      reportIds,
      candidate: {
        ...members[0],
        sourceWallets: unique(
          members.flatMap((candidate) => candidate.sourceWallets),
        ),
        ...(sourceSeedIds.length ? { sourceSeedIds } : {}),
        historicalExecutionCount: executionCount(members, context.reports),
        status,
        reportId: reportIds[0],
      },
    };
  });
}
