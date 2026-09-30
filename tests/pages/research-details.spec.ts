import { test, expect } from "@playwright/test";

test("pending and completed candidate groups each own one report card with wallet assessments", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-09-30T00:00:00Z") });
  await page.goto("/frontend/index.html?seed=justlend-lending-liquidation");
  // Keep pending states stable while inspecting and navigating their cards.
  await page.clock.pauseAt(new Date("2026-09-30T01:00:00Z"));
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(7000);
  await expect(page.locator(".wallet-row")).toHaveCount(5);
  await expect(
    page.locator(".wallet-row .candidate-count, .wallet-row .zero-count"),
  ).toHaveCount(0);
  await page.clock.runFor(2250);
  await expect(
    page.locator(".wallet-row").first().locator(".candidate-count"),
  ).toBeVisible();
  await expect(
    page.locator(".wallet-row").nth(1).locator(".candidate-count, .zero-count"),
  ).toHaveCount(0);
  await expect(page.locator(".candidate-details-hit").first()).toBeEnabled();
  await page.locator(".candidate-card").first().click();
  await expect(page.locator(".pending-report-card.featured")).toHaveCount(1);
  await expect(page.locator(".report-preview .report-open-button")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Reports", exact: true }).click();
  await expect(page.locator(".report-preview.pending-report-card")).toHaveCount(
    1,
  );
  await expect(page.locator(".report-open-button")).toHaveCount(0);
  await page.getByLabel("Search reports").fill("WAI-LENDING-01");
  await expect(page.locator(".report-preview.pending-report-card")).toHaveCount(
    1,
  );
  await page.getByLabel("Search reports").fill("");
  await page.getByRole("button", { name: "Research", exact: true }).click();
  await page.clock.runFor(3250);
  await expect(page.locator(".candidate-card")).toHaveCount(2);
  await expect(page.locator(".report-preview")).toHaveCount(2);
  // Whole-card selection works before the chosen report has been generated.
  await page.locator(".candidate-card").nth(1).click();
  await expect(page.locator(".candidate-details-hit").nth(1)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".pending-report-card.featured h3")).toHaveText(
    "Cross-pool Round Trip by a Liquidation Wallet",
  );
  await expect(page.locator(".report-column .report-open-button")).toHaveCount(
    0,
  );
  await page.clock.runFor(7000);
  await expect(page.locator(".candidate-card")).toHaveCount(2);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "5",
    "2",
    "2",
  ]);
  await expect(page.locator(".report-preview")).toHaveCount(2);
  await expect(page.locator(".pending-report-card")).toHaveCount(0);
  await expect(
    page
      .locator(".candidate-card")
      .getByRole("button", { name: /Open.*Report/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "View evidence", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "View run activity" }),
  ).toHaveCount(0);
  await expect(page.getByText("View Details", { exact: true })).toHaveCount(0);
  await expect(page.locator(".candidate-evidence")).toHaveCount(0);

  const featured = page.locator(".report-preview.featured");
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-CYCLE-01",
  );
  await page
    .locator(
      '.compact-report-card[data-report-id="report-WAI-LENDING-01"] button',
    )
    .click();
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-01",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open Full Report", exact: true }),
  ).toHaveCount(1);
  const lending = page.locator(".candidate-card").first();
  await expect(lending.locator(".candidate-facts")).toContainText("2 wallets");
  await expect(lending.locator(".candidate-facts")).toContainText("4 samples");
  // Both source reports remain accessible inside the single mechanism card.
  const assessments = featured.getByLabel("Wallet assessment");
  await expect(assessments.locator("option")).toHaveCount(2);
  await expect(assessments.locator("option")).toHaveText([
    /TUAAqY.*uqrSS/,
    /TFazVp.*ThVFB/,
  ]);
  await assessments.selectOption("report-WAI-LENDING-02");
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-02",
  );
  await expect(lending.locator(".candidate-details-hit")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await featured
    .getByRole("button", { name: "Copy link", exact: true })
    .click();
  const shared = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(shared.searchParams.get("view")).toBe(
    "/reports/report-WAI-LENDING-02",
  );
  await expect(
    featured.getByRole("button", { name: "Copied", exact: true }),
  ).toBeVisible();
  await assessments.selectOption("report-WAI-LENDING-01");
  await expect(
    featured.getByRole("button", { name: "Copy link", exact: true }),
  ).toBeVisible();
  await featured
    .getByRole("button", { name: "Copy link", exact: true })
    .click();
  const firstShare = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(firstShare.searchParams.get("view")).toBe(
    "/reports/report-WAI-LENDING-01",
  );
  await assessments.selectOption("report-WAI-LENDING-02");
  await expect(
    featured.getByRole("button", { name: "Copy link", exact: true }),
  ).toBeVisible();
  await featured
    .getByRole("button", { name: "Open Full Report", exact: true })
    .click();
  await expect(
    page.locator('.report-memo a[href*="tronscan.org/#/transaction/"]'),
  ).toHaveCount(2);
  await page.reload();
  expect(new URL(page.url()).searchParams.get("view")).toBe(
    "/reports/report-WAI-LENDING-02",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Lending Liquidation, Collateral Redemption & Swap",
  );
  await page
    .getByRole("button", { name: "Back to research", exact: true })
    .click();
  // Reload resets playback; replay restores the same original evidence identities.
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(18000);
  const otherCandidate = page.locator(".candidate-details-hit").nth(1);
  await otherCandidate.focus();
  await page.keyboard.press("Enter");
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-CYCLE-01",
  );
  await lending.locator(".candidate-details-hit").focus();
  await page.keyboard.press("Space");
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-01",
  );
  await page.locator(".wallet-row").filter({ hasText: "TFaz" }).click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(page.locator(".candidate-card")).toHaveCount(1);
  await expect(page.locator(".report-preview")).toHaveCount(1);
  await expect(page.locator(".summary-count strong").nth(1)).toHaveText("1");
  await expect(page.locator(".summary-count strong").nth(2)).toHaveText("1");
  await expect(page.locator(".candidate-facts")).toContainText("1 wallet");
  await expect(page.locator(".candidate-facts")).toContainText("2 samples");
  await page.locator(".candidate-card").click({ position: { x: 30, y: 100 } });
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-02",
  );
  await expect(featured.getByLabel("Wallet assessment")).toHaveCount(0);
  // A research wallet filter does not hide other seed mechanisms in the library.
  await page.getByRole("button", { name: "Reports", exact: true }).click();
  await expect(page.locator(".report-preview")).toHaveCount(2);
  await expect(page.locator(".library-total")).toHaveText("2 reports");
  await expect(
    page.getByLabel("Wallet assessment").locator("option"),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Research", exact: true }).click();
  await expect(page.locator(".candidate-card, .report-preview")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
});
