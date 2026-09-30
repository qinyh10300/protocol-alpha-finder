import { test, expect } from "@playwright/test";
import { groupCandidates } from "../../frontend/src/candidateGroups";
import lending from "../../frontend/public/research/justlend-lending-liquidation.json" with { type: "json" };
import type { Snapshot } from "../../frontend/src/types";

const snapshot = () => structuredClone(lending) as Snapshot;

function legacyArchive() {
  const data = snapshot();
  data.mode = "archive";
  delete data.provenance;
  for (const entity of [...data.candidates, ...data.wallets, ...data.reports]) {
    delete entity.provenance;
  }
  return data;
}

test("legacy archive responses group without explicit provenance fields", () => {
  const data = legacyArchive();
  const groups = groupCandidates(data.candidates, data);

  expect(groups).toHaveLength(2);
  expect(groups[0].members.map((candidate) => candidate.id)).toEqual([
    "WAI-LENDING-01",
    "WAI-LENDING-02",
  ]);
  expect(groups[0].candidate.historicalExecutionCount).toBe(4);
});

test("legacy archive fallback never overrides an explicitly mixed scope", () => {
  const data = legacyArchive();
  data.provenance = "mixed";

  expect(groupCandidates(data.candidates, data)).toHaveLength(3);
});

test("missing provenance in demo mode is not assumed to be recorded", () => {
  const data = legacyArchive();
  data.mode = "demo";

  expect(groupCandidates(data.candidates, data)).toHaveLength(3);
});

test("duplicate JustLend mechanisms retain both wallets, samples and reports", () => {
  const data = snapshot();
  const groups = groupCandidates(data.candidates, data);

  expect(groups).toHaveLength(2);
  const combined = groups[0];
  expect(combined.members.map((candidate) => candidate.id)).toEqual([
    "WAI-LENDING-01",
    "WAI-LENDING-02",
  ]);
  expect(combined.candidate.sourceWallets).toEqual([
    "TUAAqYySyBJDLJDxnQKqtcPBW1JXJuqrSS",
    "TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB",
  ]);
  expect(combined.candidate.historicalExecutionCount).toBe(4);
  expect(combined.reportIds).toEqual([
    "report-WAI-LENDING-01",
    "report-WAI-LENDING-02",
  ]);
  expect(groups[1].members.map((candidate) => candidate.id)).toEqual([
    "WAI-CYCLE-01",
  ]);
});

test("grouping leaves the original candidates, reports and snapshot unchanged", () => {
  const data = snapshot();
  const before = structuredClone(data);
  const groups = groupCandidates(data.candidates, data);

  expect(data).toEqual(before);
  expect(groups[0].candidate).not.toBe(data.candidates[0]);
  expect(groups[0].candidate.sourceWallets).not.toBe(
    data.candidates[0].sourceWallets,
  );
  expect(data.candidates[0].historicalExecutionCount).toBe(2);
  expect(data.candidates[1].historicalExecutionCount).toBe(2);
});

test("filtering to the second source wallet selects its own report and evidence", () => {
  const data = snapshot();
  const wallet = "TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB";
  const groups = groupCandidates(
    data.candidates.filter((candidate) =>
      candidate.sourceWallets.includes(wallet),
    ),
    data,
  );

  expect(groups).toHaveLength(1);
  expect(groups[0].members.map((candidate) => candidate.id)).toEqual([
    "WAI-LENDING-02",
  ]);
  expect(groups[0].candidate.sourceWallets).toEqual([wallet]);
  expect(groups[0].candidate.historicalExecutionCount).toBe(2);
  expect(groups[0].candidate.reportId).toBe("report-WAI-LENDING-02");
  expect(groups[0].reportIds).toEqual(["report-WAI-LENDING-02"]);
});

test("matching titles cannot merge different mechanisms", () => {
  const data = snapshot();
  data.candidates[1].summary =
    "Sell seized collateral without redeeming its underlying asset.";

  expect(groupCandidates(data.candidates, data)).toHaveLength(3);
});

test("matching mechanisms cannot merge recorded and synthetic findings", () => {
  const data = snapshot();
  const candidate = data.candidates[1];
  data.provenance = "mixed";
  candidate.provenance = "synthetic";
  data.reports.find(
    (report) => report.candidateId === candidate.id,
  )!.provenance = "synthetic";
  data.wallets.find((wallet) =>
    candidate.sourceWallets.includes(wallet.address),
  )!.provenance = "synthetic";

  expect(groupCandidates(data.candidates, data)).toHaveLength(3);
});

test("matching mechanisms cannot merge findings from different chains", () => {
  const data = snapshot();
  const candidate = data.candidates[1];
  data.seeds.push({
    id: "ethereum-lending",
    name: "Lending",
    chain: "Ethereum",
  });
  candidate.sourceSeedIds = ["ethereum-lending"];
  const wallet = data.wallets.find((item) =>
    candidate.sourceWallets.includes(item.address),
  )!;
  wallet.sourceSeedId = "ethereum-lending";
  wallet.sourceSeedIds = ["ethereum-lending"];
  data.reports.find(
    (report) => report.candidateId === candidate.id,
  )!.sourceSeedIds = ["ethereum-lending"];

  expect(groupCandidates(data.candidates, data)).toHaveLength(3);
});

test("shared transaction evidence is counted once across wallets", () => {
  const data = snapshot();
  const first = data.reports.find(
    (report) => report.id === "report-WAI-LENDING-01",
  )!;
  const second = data.reports.find(
    (report) => report.id === "report-WAI-LENDING-02",
  )!;
  const sharedHash = first.evidenceRefs.find(
    (ref) => ref.type === "transaction",
  )!.txHash!;
  const duplicate = second.evidenceRefs.find(
    (ref) => ref.type === "transaction",
  )!;
  duplicate.txHash = sharedHash.toUpperCase();

  const combined = groupCandidates(data.candidates, data)[0];
  expect(combined.candidate.historicalExecutionCount).toBe(3);
  expect(
    combined.members.map((candidate) => candidate.historicalExecutionCount),
  ).toEqual([2, 2]);
});

test("an unknown member count does not become a fabricated aggregate", () => {
  const data = snapshot();
  delete data.candidates[1].historicalExecutionCount;

  const combined = groupCandidates(data.candidates, data)[0];
  expect(combined.candidate.historicalExecutionCount).toBeUndefined();
  expect(
    combined.members.map((candidate) => candidate.historicalExecutionCount),
  ).toEqual([2, undefined]);
});

test("partial evidence references do not imply disjoint execution counts", () => {
  const data = snapshot();
  const report = data.reports.find(
    (item) => item.id === "report-WAI-LENDING-02",
  )!;
  report.evidenceRefs = report.evidenceRefs.filter(
    (ref) => ref.type !== "transaction",
  );

  const combined = groupCandidates(data.candidates, data)[0];
  expect(combined.candidate.historicalExecutionCount).toBeUndefined();
  expect(
    combined.members.map((candidate) => candidate.historicalExecutionCount),
  ).toEqual([2, 2]);
  expect(combined.reportIds).toHaveLength(2);
});
