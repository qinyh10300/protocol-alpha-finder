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
    wallets: 3,
    titles: ["USDD Auction Reset Reward", "USDD Auction Purchase Path"],
  },
];

test("each seed has a distinct replay and coherent wallet, candidate and report totals", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(entry);
  const select = page.locator('input[name="research-seed"]:checked');
  const chooseSeed = (id: string) =>
    page.locator(`input[name="research-seed"][value="${id}"]`).check();
  await expect(
    page.getByRole("radiogroup", { name: "Choose current set" }),
  ).toBeVisible();
  await expect(page.locator(".seed-options .seed-choice")).toHaveText(
    scenarios.map((scenario) => scenario.name),
  );
  await expect(page.locator(".wallet-column select")).toHaveCount(0);
  await expect(page.locator('input[name="research-seed"]')).toHaveCount(3);
  for (const scenario of scenarios) {
    await chooseSeed(scenario.id);
    await expect(select).toHaveValue(scenario.id);
    await expect(
      page.locator(".candidate-card, .report-preview, .wallet-row"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Replay Demo", exact: true })
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
  await expect(page.locator(".seed-object p")).toHaveCount(0);
  await expect(page.locator(".coverage-note")).toHaveCount(0);
  await expect(page.locator(".demo-banner")).toHaveCount(0);
  await chooseSeed(scenarios[1].id);
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(18000);
  await page.locator(".wallet-details-hit").first().click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
  await chooseSeed(scenarios[2].id);
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
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(6000);
  await page.getByRole("button", { name: "Pause demo" }).click();
  await page
    .locator(
      'input[name=\"research-seed\"][value=\"justlend-lending-liquidation\"]',
    )
    .check();
  await page.clock.runFor(18000);
  await expect(
    page.getByRole("button", { name: "Replay Demo", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("seed")).toBe(
    "justlend-lending-liquidation",
  );
  await page.reload();
  await expect(page.locator('input[name="research-seed"]:checked')).toHaveValue(
    "justlend-lending-liquidation",
  );
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
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
  await expect(page.locator(".demo-banner")).toHaveCount(0);
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
  await expect(page.locator('input[name="research-seed"]:checked')).toHaveValue(
    "justlend-lending-liquidation",
  );
  await page
    .locator('input[name=\"research-seed\"][value=\"usdd-keeper-auction\"]')
    .check();
  await page.goBack();
  await expect(page.locator('input[name="research-seed"]:checked')).toHaveValue(
    "justlend-lending-liquidation",
  );
});

test("invalid seed links fall back to a valid demo seed", async ({ page }) => {
  await page.goto(`${entry}?seed=unknown`);
  await expect(page.locator('input[name="research-seed"]:checked')).toHaveValue(
    "energy-rental-liquidation",
  );
  await expect(
    page.getByRole("button", { name: "Replay Demo", exact: true }),
  ).toBeVisible();
});

test("synthetic USDD runs independently while recorded research remains unchanged", async ({
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
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(4000);
  await page.getByRole("button", { name: "Pause demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(
    page.getByRole("button", { name: "Resume demo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume demo", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "3",
    "2",
    "2",
  ]);
  await expect(page.locator(".wallet-row .seed-origin.synthetic")).toHaveCount(
    3,
  );
  await expect(
    page.locator(".candidate-card > .seed-origin.synthetic"),
  ).toHaveCount(2);
  await expect(
    page.locator(".coverage-note, .seed-coverage-detail"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "View run activity" }).click();
  await expect(page.locator(".skill-stages article")).toHaveCount(3);
  await expect(page.getByRole("dialog")).toContainText(
    "Simulated discovery of 3 fictional USDD wallets",
  );
  const saved = await request.get(
    "/frontend/research/usdd-keeper-auction.json",
  );
  const original = await saved.json();
  expect(original.provenance).toBe("recorded");
  expect(original.wallets).toEqual([]);
  expect(original.reports).toEqual([]);
  expect(original.seeds[0].coverage).toContain(
    "27 bounded provider queries completed",
  );
  expect(apiRequests).toEqual([]);
});

test("USDD demo reports keep synthetic labels and evidence after sharing and reload", async ({
  page,
  request,
}) => {
  const fixtureResponse = await request.get(
    "/frontend/research/usdd-synthetic-demo.json",
  );
  expect(fixtureResponse.ok()).toBe(true);
  const fixture = await fixtureResponse.json();
  expect(fixture.provenance).toBe("synthetic");
  for (const wallet of fixture.wallets) {
    expect(wallet.address).toMatch(/^DEMO-USDD-/);
  }
  for (const report of fixture.reports) {
    expect(report.provenance).toBe("synthetic");
    expect(
      report.evidenceRefs.every(
        (ref: { type: string }) => ref.type === "document",
      ),
    ).toBe(true);
    expect(report.lastCheckedAt).toBeUndefined();
  }
  await page.clock.install();
  await page.goto(entry + "?seed=usdd-keeper-auction");
  await page.getByRole("button", { name: "Replay Demo", exact: true }).click();
  await page.clock.runFor(18000);
  const preview = page.locator(".report-preview.featured");
  await expect(preview.locator(".seed-origin")).toContainText("Synthetic");
  await expect(preview).toContainText("Simulated state");
  await preview.getByRole("button", { name: "Copy link", exact: true }).click();
  const shared = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(shared.searchParams.get("seed")).toBe("usdd-keeper-auction");
  expect(shared.searchParams.get("view")).toContain("report-demo-usdd-");
  await page.goto(shared.href);
  await page.reload();
  await expect(page.locator(".demo-banner")).toHaveCount(0);
  await expect(page.locator(".toc-note")).toContainText(
    "Synthetic demo report",
  );
  await expect(page.locator(".executive-summary")).toContainText(
    "fictional demonstration",
  );
  await expect(page.locator('a[href*="tronscan.org"]')).toHaveCount(0);
  const source = page.getByRole("link", {
    name: "Synthetic USDD scenario data",
  });
  const sourceResponse = await request.get(
    new URL((await source.getAttribute("href"))!, page.url()).href,
  );
  expect(sourceResponse.ok()).toBe(true);
  expect((await sourceResponse.json()).provenance).toBe("synthetic");
});
