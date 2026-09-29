import { test, expect } from "@playwright/test";

const entry = "/frontend/index.html";
const scenarios = [
  {
    id: "energy-rental-liquidation",
    name: "Energy Rental Liquidation",
    wallets: 5,
    titles: [
      "USDD Keeper Reward",
      "Settlement Opportunity",
      "Auction Reset Path",
    ],
  },
  {
    id: "justlend-lending-liquidation",
    name: "JustLend Lending Liquidation",
    wallets: 5,
    titles: [
      "Lending Liquidation, Collateral Redemption & Swap",
      "Lending Liquidation, Collateral Redemption & Swap",
      "Cross-pool Round Trip by a Liquidation Wallet",
    ],
  },
  {
    id: "usdd-keeper-auction",
    name: "USDD Keeper / Auction",
    wallets: 0,
    titles: [],
  },
];

test("each seed has a distinct replay and coherent wallet, candidate and report totals", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(entry);
  const select = page.getByLabel("Research seed");
  await expect(select.locator("option")).toHaveText(
    scenarios.map((scenario) => scenario.name),
  );
  for (const scenario of scenarios) {
    await select.selectOption(scenario.id);
    await expect(select).toHaveValue(scenario.id);
    await expect(
      page.locator(".candidate-card, .report-preview, .wallet-row"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Run Discovery", exact: true })
      .click();
    await page.clock.runFor(18000);
    await expect(page.locator(".wallet-row")).toHaveCount(scenario.wallets);
    await expect(page.locator(".candidate-card h3")).toHaveText(
      scenario.titles,
    );
    await expect(page.locator(".report-preview")).toHaveCount(
      scenario.titles.length,
    );
    await expect(page.locator(".summary-count strong")).toHaveText([
      String(scenario.wallets),
      String(scenario.titles.length),
      String(scenario.titles.length),
    ]);
    await expect(
      page.getByRole("button", { name: "Replay Demo", exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator(".seed-object p")).toHaveText(
    "TRON · Recorded Skill evidence",
  );
  await expect(page.locator(".coverage-note")).toContainText(
    "27 bounded provider queries completed",
  );
  await expect(page.locator(".demo-banner")).toContainText(
    "Recorded research replay",
  );
  await select.selectOption(scenarios[1].id);
  await page
    .getByRole("button", { name: "Run Discovery", exact: true })
    .click();
  await page.clock.runFor(18000);
  await page.locator(".wallet-details-hit").first().click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
  await select.selectOption(scenarios[2].id);
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toHaveCount(0);
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
});

test("switching a paused run resets progress and the chosen seed survives sharing, reload and history", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(entry);
  await page
    .getByRole("button", { name: "Run Discovery", exact: true })
    .click();
  await page.clock.runFor(6000);
  await page.getByRole("button", { name: "Pause demo" }).click();
  await page
    .getByLabel("Research seed")
    .selectOption("justlend-lending-liquidation");
  await page.clock.runFor(18000);
  await expect(
    page.getByRole("button", { name: "Run Discovery", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("seed")).toBe(
    "justlend-lending-liquidation",
  );
  await page.reload();
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "justlend-lending-liquidation",
  );
  await page
    .getByRole("button", { name: "Run Discovery", exact: true })
    .click();
  await page.clock.runFor(18000);
  const preview = page.locator(".report-preview.featured");
  const title = await preview.locator("h3").innerText();
  await preview.getByRole("button", { name: "Copy link", exact: true }).click();
  const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(sharedUrl).searchParams.get("seed")).toBe(
    "justlend-lending-liquidation",
  );
  await preview
    .getByRole("button", { name: "Open Full Report", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.locator(".demo-banner")).toContainText(
    "Recorded research replay",
  );
  await expect(page.locator(".toc-note")).toContainText(
    "Based on saved Skill evidence",
  );
  const evidence = page.getByRole("link", { name: "Published Skill snapshot" });
  const response = await page.request.get(
    new URL((await evidence.getAttribute("href")) || "", page.url()).href,
  );
  expect(response.ok()).toBe(true);
  expect((await response.json()).run.reportCount).toBe(3);
  await page
    .getByRole("button", { name: "Back to research", exact: true })
    .click();
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "justlend-lending-liquidation",
  );
  await page.getByLabel("Research seed").selectOption("usdd-keeper-auction");
  await page.goBack();
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "justlend-lending-liquidation",
  );
});

test("invalid seed links fall back to a valid demo seed", async ({ page }) => {
  await page.goto(`${entry}?seed=unknown`);
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "energy-rental-liquidation",
  );
  await expect(
    page.getByRole("button", { name: "Run Discovery", exact: true }),
  ).toBeVisible();
});

test("recorded seed evidence is static, internally consistent, and keeps USDD empty", async ({
  page,
  request,
}) => {
  const apiRequests: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.includes("/api/")) apiRequests.push(r.url());
  });
  const lending = await request.get(
    "/frontend/research/justlend-lending-liquidation.json",
  );
  expect(lending.ok()).toBe(true);
  const snapshot = await lending.json();
  expect(snapshot.run.loadedTransactionCount).toBe(3814);
  expect(snapshot.wallets).toHaveLength(5);
  expect(snapshot.reports).toHaveLength(3);
  for (const report of snapshot.reports) {
    expect(report.provenance).toBe("recorded");
    expect(report.outcome).not.toBe("ACTIONABLE");
    expect(report.rawCurrentState).toBe("UNCERTAIN");
    expect(
      report.evidenceRefs.some(
        (e: { type: string }) => e.type === "transaction",
      ),
    ).toBe(true);
    expect(
      report.sourceWallets.every((address: string) =>
        snapshot.wallets.some(
          (w: { address: string }) => w.address === address,
        ),
      ),
    ).toBe(true);
  }
  await page.clock.install();
  await page.goto(entry + "?seed=usdd-keeper-auction");
  await page
    .getByRole("button", { name: "Run Discovery", exact: true })
    .click();
  await page.clock.runFor(4000);
  await page.getByRole("button", { name: "Pause demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(
    page.getByRole("button", { name: "Resume demo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "0",
    "0",
    "0",
  ]);
  await expect(page.locator(".coverage-note")).toContainText(
    "Empty indexes do not prove absence from the whole chain",
  );
  await page.getByRole("button", { name: "View run activity" }).click();
  await expect(page.locator(".skill-stages article")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toContainText(
    "27 bounded provider queries completed",
  );
  expect(apiRequests).toEqual([]);
});
