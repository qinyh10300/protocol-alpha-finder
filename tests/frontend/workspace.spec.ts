import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
const hasArchive = existsSync(
  "data/protocol-alpha-discovery-test/research-record.json",
);

test.describe("Real Skill integration", () => {
  test.skip(!hasArchive, "Restore ignored data/ to test real Skill artifacts");
  test("real counts, wallet filter and candidate evidence", async ({
    page,
  }) => {
    await page.goto("/research");
    await expect(page.getByText("52,582", { exact: true })).toBeVisible();
    await expect(page.locator(".wallet-row")).toHaveCount(10);
    await expect(page.locator(".candidate-card")).toHaveCount(5);
    await page.locator(".wallet-row").first().click();
    await expect(page.getByRole("dialog")).toContainText(
      "TNQ8L8oE9cWh6vyfV7VfwGRBTte4xGDW2m",
    );
    await page.getByRole("button", { name: "Show related candidates" }).click();
    await expect(page.locator(".candidate-card")).toHaveCount(1);
    await page.getByRole("button", { name: "View evidence" }).click();
    await expect(page.getByRole("dialog")).toContainText("UNCERTAIN");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Filtered by wallet" }).click();
    await expect(page.locator(".candidate-card")).toHaveCount(5);
  });
  test("USDD zero coverage and seed selection", async ({ page }) => {
    await page.goto("/research");
    await page.getByLabel("Research seed").selectOption("usdd-keeper-auction");
    await expect(
      page.getByText("USDD: zero verified executors in this window."),
    ).toBeVisible();
    await expect(page.locator(".wallet-row")).toHaveCount(0);
    await expect(
      page.getByText("No executors found", { exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Research seed")
      .selectOption("justlend-lending-liquidation");
    await expect(page.locator(".wallet-row")).toHaveCount(5);
    await expect(page.locator(".candidate-card")).toHaveCount(3);
  });
  test("full report, source links, persistence, export and refresh deep link", async ({
    page,
  }) => {
    await page.goto("/reports/report-WAI-CYCLE-01");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "清算钱包的跨池循环兑换",
    );
    await expect(page.locator(".report-memo")).toContainText("-0.433764 WTRX");
    await expect(page.locator(".report-memo")).toContainText("UNCERTAIN");
    await expect(
      page.locator('.report-memo a[href*="tronscan.org/#/transaction/"]'),
    ).toHaveCount(2);
    await page
      .getByRole("button", { name: "Save Report", exact: true })
      .click();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Report saved" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Add to local watchlist" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Automatic checks are not configured",
    );
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export report", exact: true })
      .click();
    expect((await download).suggestedFilename()).toBe("report-WAI-CYCLE-01.md");
  });
  test("library outcome/search and four Skill artifacts", async ({ page }) => {
    await page.goto("/reports");
    await page.getByLabel("Filter report outcome").selectOption("MONITOR");
    await expect(page.locator(".report-preview")).toHaveCount(3);
    await page.getByLabel("Search reports").fill("WAI-CYCLE");
    await expect(page.locator(".report-preview")).toHaveCount(1);
    await page.getByRole("button", { name: "Research", exact: true }).click();
    await page.getByRole("button", { name: "View run activity" }).click();
    await expect(page.locator(".skill-stages article")).toHaveCount(4);
    const href = await page
      .getByRole("link", { name: "JSON handoff" })
      .first()
      .getAttribute("href");
    expect((await page.request.get(href!)).ok()).toBeTruthy();
  });
  test("mobile layout has no horizontal overflow and drawer traps focus", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/research");
    await expect(page.locator(".wallet-row")).toHaveCount(10);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.locator(".wallet-row").first().click();
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        document
          .querySelector('[role="dialog"]')
          ?.contains(document.activeElement),
      ),
    ).toBeTruthy();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test("demo starts empty, progresses independently, pauses and replays", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/research?mode=demo");
  await expect(
    page.getByRole("button", { name: "Run Discovery" }),
  ).toBeVisible();
  await expect(page.locator(".wallet-row")).toHaveCount(0);
  await page.getByRole("button", { name: "Run Discovery" }).click();
  await page.clock.runFor(5500);
  await expect(page.locator(".wallet-row")).toHaveCount(5);
  expect(await page.locator(".pipeline-step.running").count()).toBeGreaterThan(
    0,
  );
  await page.getByRole("button", { name: "Pause demo" }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Resume demo" }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card")).toHaveCount(3);
  await expect(page.locator(".report-preview")).toHaveCount(3);
  await page.getByRole("button", { name: "Replay Demo" }).click();
  await expect(page.locator(".candidate-card")).toHaveCount(0);
});

test("missing artifacts show a recoverable error, never silently use mock", async ({
  page,
}) => {
  await page.route("**/api/research-runs/**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Saved Skill results unavailable." }),
    }),
  );
  await page.goto("/research");
  await expect(page.getByRole("alert")).toContainText(
    "Saved Skill results unavailable",
  );
  await expect(page.locator(".candidate-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Open Demo" }).click();
  await expect(
    page.getByRole("button", { name: "Run Discovery" }),
  ).toBeVisible();
});

test("invalid report shows not-found state", async ({ page }) => {
  await page.goto("/reports/does-not-exist?mode=demo");
  await expect(
    page.getByText("Report unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Back to reports" }),
  ).toBeVisible();
});
