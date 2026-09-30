import { test, expect } from "@playwright/test";

test("candidate counts wait for Search Alpha completion and report details use the right column", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/frontend/index.html?seed=usdd-keeper-auction");
  await expect(page.locator(".demo-banner")).toHaveCount(0);
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(7000);
  await expect(page.locator(".wallet-row")).toHaveCount(3);
  await expect(
    page.locator(".wallet-row .candidate-count, .wallet-row .zero-count"),
  ).toHaveCount(0);
  await page.clock.runFor(2250);
  // The first search has finished; the other wallets are still searching.
  await expect(
    page.locator(".wallet-row").first().locator(".candidate-count"),
  ).toBeVisible();
  await expect(
    page.locator(".wallet-row").nth(1).locator(".candidate-count, .zero-count"),
  ).toHaveCount(0);
  await expect(page.locator(".candidate-details-hit").first()).toBeDisabled();
  await page.clock.runFor(10000);
  await expect(page.locator(".wallet-row .candidate-count")).toHaveCount(3);
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
    "report-demo-usdd-reset",
  );
  await page.locator(".candidate-card").nth(1).click();
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-demo-usdd-purchase",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open Full Report", exact: true }),
  ).toHaveCount(1);
  await page
    .locator(
      '.compact-report-card[data-report-id="report-demo-usdd-reset"] button',
    )
    .click();
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-demo-usdd-reset",
  );
  await page.locator(".candidate-card").nth(1).click();
  await featured
    .getByRole("button", { name: "Open Full Report", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "USDD Auction Purchase Path",
  );

  await page
    .getByRole("button", { name: "Back to research", exact: true })
    .click();
  await page
    .getByRole("radio", { name: "JustLend Lending Liquidation", exact: true })
    .check();
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card")).toHaveCount(2);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "5",
    "2",
    "3",
  ]);
  await expect(page.locator(".report-preview")).toHaveCount(3);
  const lending = page.locator(".candidate-card").first();
  await expect(lending.locator(".candidate-facts")).toContainText("2 wallets");
  await expect(lending.locator(".candidate-facts")).toContainText("4 samples");
  // Both original wallet reports remain independently accessible.
  await page
    .locator(
      '.compact-report-card[data-report-id="report-WAI-LENDING-02"] button',
    )
    .click();
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-02",
  );
  await expect(lending.locator(".candidate-details-hit")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
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

  // Filtering first preserves the selected wallet's evidence and report.
  await page.locator(".wallet-row").filter({ hasText: "TFaz" }).click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(page.locator(".candidate-card")).toHaveCount(1);
  await expect(page.locator(".candidate-facts")).toContainText("1 wallet");
  await expect(page.locator(".candidate-facts")).toContainText("2 samples");
  await page.locator(".candidate-card").click({ position: { x: 30, y: 100 } });
  await expect(featured).toHaveAttribute(
    "data-report-id",
    "report-WAI-LENDING-02",
  );
});
