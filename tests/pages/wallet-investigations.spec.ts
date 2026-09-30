import { expect, test } from "@playwright/test";
import { groupCandidates } from "../../frontend/src/candidateGroups";
import { combineSeedSnapshots } from "../../frontend/src/seed-snapshots";
import { selectInvestigationWallets } from "../../frontend/src/walletInvestigations";
import energy from "../../frontend/public/research/energy-rental-liquidation.json" with { type: "json" };
import lending from "../../frontend/public/research/justlend-lending-liquidation.json" with { type: "json" };
import usdd from "../../frontend/public/research/usdd-keeper-auction.json" with { type: "json" };
import type { Snapshot } from "../../frontend/src/types";

const energyAddresses = [
  "TNQ8L8oE9cWh6vyfV7VfwGRBTte4xGDW2m",
  "TLEvUfPk1CiGrGMisndJ7aVvxgcmWGvqNo",
  "TE5HK3296fbju3mg25m3fyGidqf9vVaj5Q",
  "TSxn2SM9p518PD1b5TYRuse2X1Q5EdeCXL",
];
const lendingAddresses = [
  "TUAAqYySyBJDLJDxnQKqtcPBW1JXJuqrSS",
  "TEe2PXchaVdLWG1to1fdoYwGC7JieZ8qNH",
  "TS8fpf9YRWaKkA57RRg2KsuDv66m3F3za4",
  "TRCZGydLtU8S3XFt2DUFaoLpkwCH1tCa8B",
];
const usddAddresses = [
  "TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB",
  "TDNLgniuf5TeYwh5fyGMvoFfeVcmvgWmcy",
];

for (const { name, snapshot, addresses } of [
  { name: "Energy", snapshot: energy as Snapshot, addresses: energyAddresses },
  {
    name: "JustLend",
    snapshot: lending as Snapshot,
    addresses: lendingAddresses,
  },
  { name: "USDD", snapshot: usdd as Snapshot, addresses: usddAddresses },
  {
    name: "All",
    snapshot: combineSeedSnapshots([energy, lending, usdd] as Snapshot[]),
    addresses: [...energyAddresses, ...lendingAddresses, usddAddresses[1]],
  },
  {
    name: "Original archive All",
    snapshot: {
      ...combineSeedSnapshots([energy, lending] as Snapshot[]),
      mode: "archive",
    } as Snapshot,
    addresses: [...energyAddresses, ...lendingAddresses],
  },
]) {
  test(`${name} wallet rows retain every mechanism and all original evidence`, () => {
    const before = structuredClone(snapshot);
    const selected = selectInvestigationWallets(snapshot);
    expect(selected.map((wallet) => wallet.address)).toEqual(addresses);
    const selectedAddresses = new Set(addresses);
    for (const group of groupCandidates(snapshot.candidates, snapshot)) {
      expect(
        group.members.some((candidate) =>
          candidate.sourceWallets.some((address) =>
            selectedAddresses.has(address),
          ),
        ),
      ).toBe(true);
    }
    expect(snapshot).toEqual(before);
    for (const wallet of selected) {
      expect(wallet).toBe(
        snapshot.wallets.find((source) => source.address === wallet.address),
      );
    }
  });
}

function findingsSnapshot(
  findings: { address: string; groups: string[] }[],
): Snapshot {
  const candidates = findings.flatMap(({ address, groups }) =>
    groups.map((group) => ({
      id: `${address}-${group}`,
      title: `Mechanism ${group}`,
      summary: `Evidence for mechanism ${group}`,
      sourceWallets: [address],
      status: "discovered" as const,
      createdAt: "2026-09-30T00:00:00Z",
    })),
  );
  return {
    provenance: "recorded",
    mode: "archive",
    run: {
      id: "selection-test",
      seedId: "test-seed",
      status: "completed",
      walletCount: findings.length,
      candidateCount: candidates.length,
      reportCount: 0,
      loadedTransactionCount: 0,
    },
    seeds: [{ id: "test-seed", name: "Test seed", chain: "TRON" }],
    wallets: findings.map(({ address, groups }) => ({
      address,
      sourceSeedId: "test-seed",
      historyJob: { status: "completed" },
      analysisJob: { status: "completed" },
      alphaSearchJob: { status: "completed" },
      candidateIds: groups.map((group) => `${address}-${group}`),
    })),
    candidates,
    reports: [],
    activity: [],
    skills: [],
  };
}

test("a later wallet covering more mechanisms replaces subsets, with stable ties and output order", () => {
  const snapshot = findingsSnapshot([
    { address: "subset-first", groups: ["A"] },
    { address: "unique", groups: ["C"] },
    { address: "broad", groups: ["A", "B"] },
    { address: "duplicate-broad", groups: ["A", "B"] },
  ]);
  const before = structuredClone(snapshot);
  expect(
    selectInvestigationWallets(snapshot).map((wallet) => wallet.address),
  ).toEqual(["unique", "broad"]);
  expect(snapshot).toEqual(before);
});

test("partially overlapping wallets remain when each adds a distinct mechanism", () => {
  const snapshot = findingsSnapshot([
    { address: "first", groups: ["A", "B"] },
    { address: "second", groups: ["B", "C"] },
    { address: "covered", groups: ["A", "C"] },
  ]);
  expect(
    selectInvestigationWallets(snapshot).map((wallet) => wallet.address),
  ).toEqual(["first", "second"]);
});

test("zero-candidate and unresolved wallets stay visible even when known findings are covered", () => {
  const snapshot = findingsSnapshot([
    { address: "broad", groups: ["A", "B"] },
    { address: "zero", groups: [] },
    { address: "unresolved", groups: ["A"] },
    { address: "unknown-only", groups: [] },
  ]);
  snapshot.wallets[2].candidateIds.push("missing-candidate");
  snapshot.wallets[3].candidateIds.push("another-missing-candidate");
  expect(
    selectInvestigationWallets(snapshot).map((wallet) => wallet.address),
  ).toEqual(["broad", "zero", "unresolved", "unknown-only"]);
});
