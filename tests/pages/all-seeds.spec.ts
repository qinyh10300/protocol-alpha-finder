import { test, expect } from "@playwright/test";
import { combineSeedSnapshots } from "../../frontend/src/seed-snapshots";
import lending from "../../frontend/public/research/justlend-lending-liquidation.json" with { type: "json" };
import type { Snapshot } from "../../frontend/src/types";

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

test("All fills all three columns with seed provenance and both dropdowns stay in sync", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/frontend/index.html?seed=all");
  await expect(page.getByLabel("Research seed")).toHaveValue("all");
  await expect(page.getByLabel("Wallet seed filter")).toHaveValue("all");
  await expect(page.locator(".demo-banner")).toContainText(
    "Energy Rental uses synthetic examples",
  );
  await page
    .getByRole("button", { name: "Run Discovery", exact: true })
    .click();
  await page.clock.runFor(18000);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "10",
    "6",
    "6",
  ]);
  await expect(page.locator(".wallet-row")).toHaveCount(10);
  await expect(page.locator(".candidate-card")).toHaveCount(6);
  await expect(page.locator(".report-preview")).toHaveCount(6);
  await expect(page.locator(".wallet-row .seed-origin.synthetic")).toHaveCount(
    5,
  );
  await expect(page.locator(".wallet-row .seed-origin.recorded")).toHaveCount(
    5,
  );
  await expect(
    page.locator(".candidate-card > .seed-origin.synthetic"),
  ).toHaveCount(3);
  await expect(
    page.locator(".candidate-card > .seed-origin.recorded"),
  ).toHaveCount(3);
  await page.locator(".seed-coverage-detail summary").click();
  await expect(page.locator(".seed-coverage-detail")).toContainText(
    "27 bounded provider queries completed",
  );
  await expect(page.locator(".summary-bottom")).toContainText("9,623");

  await page.locator(".wallet-details-hit").last().click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
  await page
    .getByLabel("Wallet seed filter")
    .selectOption("justlend-lending-liquidation");
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "justlend-lending-liquidation",
  );
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toHaveCount(0);
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
  await page.getByLabel("Research seed").selectOption("all");
  await expect(page.getByLabel("Wallet seed filter")).toHaveValue("all");
  await page.reload();
  await expect(page.getByLabel("Research seed")).toHaveValue("all");
  await page
    .getByRole("button", { name: "Run Discovery", exact: true })
    .click();
  await page.clock.runFor(6000);
  await page.getByRole("button", { name: "Pause demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Resume demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".report-preview")).toHaveCount(6);
  const preview = page.locator(".report-preview.featured");
  const title = await preview.locator("h3").innerText();
  await preview.getByRole("button", { name: "Copy link", exact: true }).click();
  const share = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(share.searchParams.get("seed")).toBe("all");
  await preview
    .getByRole("button", { name: "Open Full Report", exact: true })
    .click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page
    .getByRole("button", { name: "Back to research", exact: true })
    .click();
  await expect(page.getByLabel("Research seed")).toHaveValue("all");
});
