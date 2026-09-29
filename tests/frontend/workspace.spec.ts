import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import type { Snapshot } from "../../frontend/src/types";
import { localizeSnapshot } from "../../frontend/src/locales/research";
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
    await expect(page.locator(".wallet-row")).toHaveCount(6);
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
  test("wallet list expands, collapses and resets for another seed", async ({
    page,
  }) => {
    await page.goto("/research");
    await expect(page.locator(".wallet-row")).toHaveCount(6);
    await page.getByRole("button", { name: "Show 4 more wallets" }).click();
    await expect(page.locator(".wallet-row")).toHaveCount(10);
    await page.getByRole("button", { name: "Show fewer wallets" }).click();
    await expect(page.locator(".wallet-row")).toHaveCount(6);
    await page.getByRole("button", { name: "Show 4 more wallets" }).click();
    await page
      .getByLabel("Research seed")
      .selectOption("justlend-lending-liquidation");
    await expect(page.locator(".wallet-row")).toHaveCount(5);
    await expect(
      page.getByRole("button", { name: /Show .* wallets/ }),
    ).toHaveCount(0);
    await page.getByLabel("Research seed").selectOption("all");
    await expect(page.locator(".wallet-row")).toHaveCount(6);
  });
  test("candidate sorting changes discovery, recency and evidence order", async ({
    page,
  }) => {
    const response = await page.request.get(
      "/api/research-runs/local-all/snapshot",
    );
    expect(response.ok()).toBeTruthy();
    const snapshot: Snapshot = await response.json();
    // Distinct inputs make each sort observable even when archived timestamps match.
    const evidenceCounts = [3, 11, 2, 7, 5];
    snapshot.candidates = snapshot.candidates.map((candidate, index) => ({
      ...candidate,
      createdAt: new Date(Date.UTC(2026, 8, 20 + index)).toISOString(),
      historicalExecutionCount: evidenceCounts[index],
    }));
    await page.route("**/api/research-runs/local-all/snapshot", (route) =>
      route.fulfill({ json: snapshot }),
    );
    await page.goto("/research");
    const titles = page.locator(".candidate-card h3");
    const englishSnapshot = localizeSnapshot(snapshot, "en");
    const discoveryTitles = englishSnapshot.candidates.map(
      (candidate) => candidate.title,
    );
    await expect(titles).toHaveText(discoveryTitles);
    await expect(page.getByLabel("Sort candidates")).toHaveValue("discovery");
    await page.getByLabel("Sort candidates").selectOption("newest");
    await expect(titles).toHaveText([...discoveryTitles].reverse());
    await page.getByLabel("Sort candidates").selectOption("evidence");
    await expect(titles).toHaveText(
      [...englishSnapshot.candidates]
        .sort(
          (a, b) =>
            (b.historicalExecutionCount ?? 0) -
            (a.historicalExecutionCount ?? 0),
        )
        .map((candidate) => candidate.title),
    );
    await page.getByLabel("Sort candidates").selectOption("discovery");
    await expect(titles).toHaveText(discoveryTitles);
  });
  test("report preview switches between reports and retains every assessment section", async ({
    page,
  }) => {
    await page.goto("/research");
    const reports = page.locator(".report-column");
    const expanded = reports.locator(".report-preview.featured");
    await expect(reports.locator(".report-preview")).toHaveCount(5);
    await expect(expanded).toHaveCount(1);
    const firstTitle = await expanded.locator("h3").innerText();
    const firstId = await expanded.getAttribute("data-report-id");
    const nextReport = reports
      .locator(".compact-report[aria-expanded='false']")
      .first();
    const nextTitle = await nextReport.locator("h3").innerText();
    const nextId = await nextReport
      .locator("..")
      .getAttribute("data-report-id");
    await nextReport.click();
    await expect(expanded).toHaveCount(1);
    await expect(expanded.locator("h3")).toHaveText(nextTitle);
    await expect(expanded).toHaveAttribute("data-report-id", nextId!);
    await expect(expanded.locator("h3")).toBeFocused();
    const stateText = expanded.locator(".section-current-state p");
    expect(
      await stateText.evaluate((el) => el.scrollHeight <= el.clientHeight),
    ).toBeTruthy();
    await expect(reports.locator(".compact-report")).toHaveCount(4);
    for (const section of [
      "Mechanism",
      "Historical Evidence",
      "Current State",
      "Execution Conditions",
    ]) {
      await expect(expanded.getByText(section, { exact: true })).toBeVisible();
    }
    await reports
      .locator(`[data-report-id="${firstId}"] .compact-report`)
      .click();
    await expect(expanded.locator("h3")).toHaveText(firstTitle);
    await expanded.getByRole("button", { name: "Open Full Report" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      firstTitle,
    );
  });
  test("desktop workspace keeps the reference's aligned three-column density", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/research");
    await expect(page.locator(".wallet-row")).toHaveCount(6);
    const grid = await page.locator(".workspace-grid").boundingBox();
    expect(grid).not.toBeNull();
    expect(grid!.y).toBeLessThan(260);
    await expect(
      page.getByRole("button", { name: "Show 4 more wallets" }),
    ).toBeInViewport({ ratio: 1 });
    await expect(page.locator(".wallet-row").nth(5)).toBeInViewport({
      ratio: 1,
    });
    await expect(page.locator(".compact-report h3").first()).toBeInViewport({
      ratio: 1,
    });
    const columns = await page
      .locator(".workspace-grid > .workspace-column")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const { x, y, width } = element.getBoundingClientRect();
          return { x, y, width };
        }),
      );
    expect(columns).toHaveLength(3);
    expect(
      Math.max(...columns.map(({ y }) => y)) -
        Math.min(...columns.map(({ y }) => y)),
    ).toBeLessThanOrEqual(1);
    expect(columns[1].x).toBeGreaterThanOrEqual(
      columns[0].x + columns[0].width,
    );
    expect(columns[2].x).toBeGreaterThanOrEqual(
      columns[1].x + columns[1].width,
    );
    const rowHeights = await page
      .locator(".wallet-row")
      .evaluateAll((rows) =>
        rows.map((row) => row.getBoundingClientRect().height),
      );
    expect(Math.max(...rowHeights)).toBeLessThanOrEqual(110);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
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
      "Cross-pool Round Trip by a Liquidation Wallet",
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
    await expect(page.locator(".wallet-row")).toHaveCount(6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    expect(
      await page
        .locator(".candidate-column .column-content")
        .evaluate((el) => el.scrollHeight <= el.clientHeight),
    ).toBeTruthy();
    expect(
      await page
        .locator(".wallet-row .pipeline-step small")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(12);
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
