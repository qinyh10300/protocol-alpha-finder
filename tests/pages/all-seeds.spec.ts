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

test("Legacy All links retain combined results without an All selector", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/frontend/index.html?seed=all");
  await expect(
    page.locator('input[name="research-seed"][value="all"]'),
  ).toHaveCount(0);
  await expect(page.locator(".wallet-column select")).toHaveCount(0);
  await expect(page.locator(".demo-banner")).toHaveCount(0);
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "13",
    "7",
    "8",
  ]);
  await expect(page.locator(".wallet-row")).toHaveCount(13);
  await expect(page.locator(".candidate-card")).toHaveCount(7);
  await expect(page.locator(".report-preview")).toHaveCount(8);
  await expect(page.locator(".wallet-row .seed-origin.synthetic")).toHaveCount(
    8,
  );
  await expect(page.locator(".wallet-row .seed-origin.recorded")).toHaveCount(
    5,
  );
  await expect(
    page.locator(".candidate-card > .seed-origin.synthetic"),
  ).toHaveCount(5);
  await expect(
    page.locator(".candidate-card > .seed-origin.recorded"),
  ).toHaveCount(2);
  await expect(page.locator(".seed-coverage-detail")).toHaveCount(0);
  await expect(page.locator(".summary-bottom")).toContainText("11,603");

  await page.locator(".wallet-details-hit").last().click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
  await page
    .locator(
      'input[name=\"research-seed\"][value=\"justlend-lending-liquidation\"]',
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
  await expect(page.locator(".wallet-column select")).toHaveCount(0);
  await page.reload();
  await expect(
    page.locator('input[name="research-seed"][value="all"]'),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(6000);
  await page.getByRole("button", { name: "Pause demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Resume demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".report-preview")).toHaveCount(8);
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
  await expect(
    page.locator('input[name="research-seed"][value="all"]'),
  ).toHaveCount(0);
});
