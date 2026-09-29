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
    wallets: 4,
    titles: ["Settlement Opportunity"],
  },
  {
    id: "usdd-keeper-auction",
    name: "USDD Keeper / Auction",
    wallets: 3,
    titles: ["USDD Keeper Reward", "Auction Reset Path"],
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
    "USDD · Synthetic demo seed",
  );
  await page.locator(".wallet-details-hit").first().click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
  await select.selectOption(scenarios[1].id);
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
  await page.getByLabel("Research seed").selectOption("usdd-keeper-auction");
  await page.clock.runFor(18000);
  await expect(
    page.getByRole("button", { name: "Run Discovery", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("seed")).toBe(
    "usdd-keeper-auction",
  );
  await page.reload();
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "usdd-keeper-auction",
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
    "usdd-keeper-auction",
  );
  await preview
    .getByRole("button", { name: "Open Full Report", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page
    .getByRole("button", { name: "Back to research", exact: true })
    .click();
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "usdd-keeper-auction",
  );
  await page
    .getByLabel("Research seed")
    .selectOption("justlend-lending-liquidation");
  await page.goBack();
  await expect(page.getByLabel("Research seed")).toHaveValue(
    "usdd-keeper-auction",
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
