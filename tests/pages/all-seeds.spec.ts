import { test, expect } from "@playwright/test";
import { combineSeedSnapshots } from "../../frontend/src/seed-snapshots";
import { RecordedResearchDataSource } from "../../frontend/src/data";
import lending from "../../frontend/public/research/justlend-lending-liquidation.json" with { type: "json" };
import usddPlan from "../../frontend/public/replay/usdd-keeper-auction.json" with { type: "json" };
import type { ReplayPlan, Snapshot } from "../../frontend/src/types";

test("All merges shared identities without double-counting a wallet's history", () => {
  const first = structuredClone(lending) as Snapshot;
  const second = structuredClone(first);
  second.run.seedId = "energy-rental-liquidation";
  const result = combineSeedSnapshots([first, second]);
  expect(result.run.walletCount).toBe(5);
  expect(result.run.candidateCount).toBe(3);
  expect(result.run.reportCount).toBe(3);
  expect(result.run.loadedTransactionCount).toBe(3814);
  for (const entity of [
    ...result.wallets,
    ...result.candidates,
    ...result.reports,
  ]) {
    expect(entity.sourceSeedIds).toEqual([
      "justlend-lending-liquidation",
      "energy-rental-liquidation",
    ]);
  }
  expect(new Set(result.activity.map((event) => event.id)).size).toBe(
    result.activity.length,
  );
  expect(first).toEqual(lending);
});

test("Discovery-only USDD wallets preserve shared research and unknown history counts", () => {
  const researched = structuredClone(lending) as Snapshot;
  const shared = researched.wallets.find(
    (wallet) => wallet.address === "TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB",
  )!;
  const discovery: Snapshot = {
    ...structuredClone(researched),
    run: { ...researched.run, seedId: "usdd-keeper-auction" },
    wallets: [shared.address, "TDNLgniuf5TeYwh5fyGMvoFfeVcmvgWmcy"].map(
      (address) => ({
        address,
        sourceSeedId: "usdd-keeper-auction",
        sourceSeedIds: ["usdd-keeper-auction"],
        historyJob: { status: "queued" },
        analysisJob: { status: "queued" },
        alphaSearchJob: { status: "queued" },
        candidateIds: [],
        coverageNote:
          "Historical USDD execution verified; wallet history awaits investigation.",
        evidenceRefs: [
          { type: "transaction", txHash: "usdd-discovery-evidence" },
        ],
      }),
    ),
    candidates: [],
    reports: [],
    activity: [],
    skills: [],
  };

  for (const snapshots of [
    [researched, discovery],
    [discovery, researched],
  ]) {
    const result = combineSeedSnapshots(snapshots);
    const merged = result.wallets.find(
      (wallet) => wallet.address === shared.address,
    )!;
    expect(merged.historyJob).toEqual(shared.historyJob);
    expect(merged.analysisJob).toEqual(shared.analysisJob);
    expect(merged.alphaSearchJob).toEqual(shared.alphaSearchJob);
    expect(merged.sourceSeedId).toBe(shared.sourceSeedId);
    expect(merged.coverageNote).toBe(shared.coverageNote);
    expect(merged.sourceSeedIds).toEqual(
      expect.arrayContaining([
        "justlend-lending-liquidation",
        "usdd-keeper-auction",
      ]),
    );
    expect(merged.candidateIds).toEqual(shared.candidateIds);
    expect(merged.evidenceRefs).toEqual(
      expect.arrayContaining([
        ...shared.evidenceRefs!,
        { type: "transaction", txHash: "usdd-discovery-evidence" },
      ]),
    );
    const uninvestigated = result.wallets.find(
      (wallet) => wallet.address === discovery.wallets[1].address,
    )!;
    expect(uninvestigated.historyJob).toEqual({ status: "queued" });
    expect(uninvestigated.historyJob.txCount).toBeUndefined();
    expect(result.run.walletCount).toBe(6);
    expect(result.run.loadedTransactionCount).toBe(3814);
    expect(result.run.candidateCount).toBe(3);
    expect(result.run.reportCount).toBe(3);
  }
  expect(researched).toEqual(lending);
});

test("All preserves recorded shared-wallet stages while USDD illustrative progress advances", async () => {
  const originalNow = Date.now;
  let now = 1_000_000;
  Date.now = () => now;
  try {
    const all = new RecordedResearchDataSource(async (seedId) =>
      seedId === "usdd-keeper-auction" ? (usddPlan as ReplayPlan) : undefined,
    );
    const recorded = new RecordedResearchDataSource();
    await all.createRun("all");
    await recorded.createRun("justlend-lending-liquidation");
    for (const seconds of [4.5, 6.5, 9.5, 18]) {
      now = 1_000_000 + seconds * 1000;
      const combined = await all.getSnapshot();
      const lendingOnly = await recorded.getSnapshot();
      const address = "TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB";
      const actual = combined.wallets.find(
        (wallet) => wallet.address === address,
      )!;
      const expected = lendingOnly.wallets.find(
        (wallet) => wallet.address === address,
      )!;
      expect(actual.historyJob).toEqual(expected.historyJob);
      expect(actual.analysisJob).toEqual(expected.analysisJob);
      expect(actual.alphaSearchJob).toEqual(expected.alphaSearchJob);
      expect(actual.sourceSeedId).toBe(expected.sourceSeedId);
      expect(actual.coverageNote).toBe(expected.coverageNote);
      expect(actual.candidateIds).toEqual(expected.candidateIds);
      expect(actual.sourceSeedIds).toEqual([
        "justlend-lending-liquidation",
        "usdd-keeper-auction",
      ]);
    }
  } finally {
    Date.now = originalNow;
  }
});

test("Legacy All links retain all recorded mechanisms and original report sharing", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-09-30T00:00:00Z") });
  await page.goto("/frontend/index.html?seed=all");
  // Only explicit runFor calls should advance replay stages between assertions.
  await page.clock.pauseAt(new Date("2026-09-30T01:00:00Z"));
  await expect(
    page.locator('input[name="research-seed"][value="all"]'),
  ).toHaveCount(0);
  await expect(page.locator(".wallet-column select, .demo-banner")).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  let elapsed = 0;
  for (const time of [6000, 9500, 11500, 13500, 18000]) {
    await page.clock.runFor(time - elapsed);
    elapsed = time;
    const count = await page.locator(".candidate-card").count();
    await expect(page.locator(".report-preview")).toHaveCount(count);
    await expect(page.locator(".summary-count strong").nth(1)).toHaveText(
      String(count),
    );
    await expect(page.locator(".summary-count strong").nth(2)).toHaveText(
      String(count),
    );
    if (time === 9500) {
      expect(count).toBe(2);
      await expect(page.locator(".pending-report-card")).toHaveCount(2);
    }
  }
  await expect(page.locator(".summary-count strong")).toHaveText([
    "11",
    "3",
    "3",
  ]);
  await expect(page.locator(".wallet-row")).toHaveCount(11);
  await expect(page.locator(".candidate-card")).toHaveCount(3);
  await expect(page.locator(".report-preview")).toHaveCount(3);
  await expect(page.locator(".pending-report-card")).toHaveCount(0);
  await expect(page.locator(".summary-bottom")).toContainText("52,582");
  await expect(page.locator("body")).not.toContainText(
    /\b(?:mock|synthetic|demo)\b|模拟|合成/i,
  );

  await page.locator(".wallet-details-hit").first().click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
  const filteredCount = await page.locator(".candidate-card").count();
  await expect(page.locator(".report-preview")).toHaveCount(filteredCount);
  await expect(page.locator(".summary-count strong").nth(1)).toHaveText(
    String(filteredCount),
  );
  await expect(page.locator(".summary-count strong").nth(2)).toHaveText(
    String(filteredCount),
  );
  await page
    .locator(
      'input[name="research-seed"][value="justlend-lending-liquidation"]',
    )
    .check();
  await expect(page.locator('input[name="research-seed"]:checked')).toHaveValue(
    "justlend-lending-liquidation",
  );
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toHaveCount(0);
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);

  await page.goto("/frontend/index.html?seed=all");
  await page.reload();
  await expect(
    page.locator('input[name="research-seed"][value="all"]'),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(6000);
  await page.getByRole("button", { name: "Pause replay", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card, .report-preview")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Resume replay", exact: true })
    .click();
  await page.clock.runFor(18000);
  await expect(page.locator(".report-preview")).toHaveCount(3);
  const preview = page.locator(".report-preview.featured");
  const title = await preview.locator("h3").innerText();
  const reportId = await preview.getAttribute("data-report-id");
  await preview.getByRole("button", { name: "Copy link", exact: true }).click();
  const share = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(share.searchParams.get("seed")).toBe("all");
  expect(share.searchParams.get("view")).toBe(`/reports/${reportId}`);
  await preview
    .getByRole("button", { name: "Open Full Report", exact: true })
    .click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page
    .getByRole("button", { name: "Back to research", exact: true })
    .click();
  await expect(
    page.locator('input[name="research-seed"][value="all"]'),
  ).toHaveCount(0);
  // Reloading a report resets the replay clock, so restore the results first.
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(18000);
  await page.getByRole("button", { name: "Reports", exact: true }).click();
  await expect(page.locator(".report-preview")).toHaveCount(3);
  await page.getByLabel("Filter report outcome").selectOption("MONITOR");
  await expect(page.locator(".report-preview")).toHaveCount(2);
  await page
    .getByLabel("Filter report outcome")
    .selectOption("INSUFFICIENT_EVIDENCE");
  await expect(page.locator(".report-preview")).toHaveCount(1);
  await page.getByLabel("Filter report outcome").selectOption("all");
  await page.getByLabel("Search reports").fill("WAI-LENDING");
  await expect(page.locator(".report-preview")).toHaveCount(1);
  await expect(page.getByLabel("Wallet assessment")).toHaveCount(1);
  await page
    .getByLabel("Wallet assessment")
    .selectOption("report-WAI-LENDING-02");
  await expect(page.locator(".report-preview")).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-02",
  );
  await page.getByLabel("Search reports").fill("WAI-LENDING-02");
  await expect(page.locator(".report-preview")).toHaveCount(1);
  await expect(page.locator(".report-preview")).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-02",
  );
  await expect(page.getByLabel("Wallet assessment")).toHaveCount(0);
});
