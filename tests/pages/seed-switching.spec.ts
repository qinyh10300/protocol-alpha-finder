import { test, expect, type Page } from "@playwright/test";

const entry = "/frontend/index.html";
const scenarios = [
  {
    id: "energy-rental-liquidation",
    name: "Energy Rental Liquidation",
    wallets: 5,
    rawReports: 2,
    transactions: 48768,
    titles: ["Same-transaction Rental, Liquidation & Return"],
  },
  {
    id: "justlend-lending-liquidation",
    name: "JustLend Lending Liquidation",
    wallets: 5,
    rawReports: 3,
    transactions: 3814,
    titles: [
      "Lending Liquidation, Collateral Redemption & Swap",
      "Cross-pool Round Trip by a Liquidation Wallet",
    ],
  },
  {
    id: "usdd-keeper-auction",
    name: "USDD Keeper / Auction",
    wallets: 0,
    rawReports: 0,
    transactions: 0,
    titles: [],
  },
];

async function expectCoherentCards(page: Page) {
  const candidates = await page.locator(".candidate-card").count();
  await expect(page.locator(".report-preview")).toHaveCount(candidates);
  await expect(page.locator(".summary-count strong").nth(1)).toHaveText(
    String(candidates),
  );
  await expect(page.locator(".summary-count strong").nth(2)).toHaveText(
    String(candidates),
  );
  await expect(page.locator("body")).not.toContainText(
    /\b(?:mock|synthetic|demo)\b|模拟|合成/i,
  );
  return candidates;
}

test("all three seeds replay recorded results with one report card per candidate throughout playback", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(entry);
  await expect(
    page.getByRole("radiogroup", { name: "Choose current alpha seed" }),
  ).toBeVisible();
  await expect(page.locator(".seed-options .seed-choice")).toHaveText(
    scenarios.map((scenario) => scenario.name),
  );
  await expect(page.locator(".wallet-column select")).toHaveCount(0);
  await expect(page.locator('input[name="research-seed"]')).toHaveCount(3);
  for (const scenario of scenarios) {
    await page
      .locator(`input[name="research-seed"][value="${scenario.id}"]`)
      .check();
    await expect(
      page.locator('input[name="research-seed"]:checked'),
    ).toHaveValue(scenario.id);
    await expect(
      page.locator(".candidate-card, .report-preview, .wallet-row"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Replay Research", exact: true })
      .click();
    let elapsed = 0;
    for (const time of [5500, 9500, 11500, 13500, 15500, 18000]) {
      await page.clock.runFor(time - elapsed);
      elapsed = time;
      const count = await expectCoherentCards(page);
      if (time === 9500 && scenario.wallets) {
        expect(count).toBe(1);
        await expect(page.locator(".pending-report-card")).toHaveCount(count);
        await expect(
          page.locator(".report-column .report-open-button"),
        ).toHaveCount(0);
        // Pending candidates still select their associated report card.
        await expect(
          page.locator(".candidate-details-hit").first(),
        ).toBeEnabled();
        await page.locator(".candidate-card").first().click();
        await expect(page.locator(".pending-report-card.featured")).toHaveCount(
          1,
        );
      }
    }
    await expect(page.locator(".wallet-row")).toHaveCount(scenario.wallets);
    await expect(page.locator(".candidate-card h3")).toHaveText(
      scenario.titles,
    );
    await expect(page.locator(".report-preview")).toHaveCount(
      scenario.titles.length,
    );
    await expect(page.locator(".pending-report-card")).toHaveCount(0);
    await expect(page.locator(".summary-count strong")).toHaveText([
      String(scenario.wallets),
      String(scenario.titles.length),
      String(scenario.titles.length),
    ]);
    await expect(
      page.getByRole("button", { name: "Replay Research", exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator(".seed-object p, .demo-banner")).toHaveCount(0);
  await expect(
    page.getByText("USDD: zero verified executors in this window."),
  ).toHaveCount(0);
  await expect(page.locator(".coverage-note")).toHaveCount(0);
});

test("switching a paused run resets progress and preserves the selected seed through share, reload and history", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(entry);
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(6000);
  await page.getByRole("button", { name: "Pause replay" }).click();
  await page
    .locator(
      'input[name="research-seed"][value="justlend-lending-liquidation"]',
    )
    .check();
  await page.clock.runFor(18000);
  await expect(
    page.getByRole("button", { name: "Replay Research", exact: true }),
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
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
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
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(18000);
  await page.locator(".wallet-details-hit").first().click();
  await page.getByRole("button", { name: "Show related candidates" }).click();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toBeVisible();
  const filteredCount = await page.locator(".candidate-card").count();
  await expect(page.locator(".report-preview")).toHaveCount(filteredCount);
  await page
    .locator('input[name="research-seed"][value="usdd-keeper-auction"]')
    .check();
  await expect(
    page.getByRole("button", { name: "Filtered by wallet" }),
  ).toHaveCount(0);
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('input[name="research-seed"]:checked')).toHaveValue(
    "justlend-lending-liquidation",
  );
});

test("invalid seed links fall back to a valid recorded replay", async ({
  page,
}) => {
  await page.goto(`${entry}?seed=unknown`);
  await expect(page.locator('input[name="research-seed"]:checked')).toHaveValue(
    "energy-rental-liquidation",
  );
  await expect(
    page.getByRole("button", { name: "Replay Research", exact: true }),
  ).toBeVisible();
});

test("every published seed snapshot retains its real wallets, report evidence and recorded zero results", async ({
  request,
  page,
}) => {
  const apiRequests: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.includes("/api/")) apiRequests.push(r.url());
  });
  for (const scenario of scenarios) {
    const response = await request.get(
      `/frontend/research/${scenario.id}.json`,
    );
    expect(response.ok()).toBe(true);
    const snapshot = await response.json();
    expect(snapshot.provenance).toBe("recorded");
    expect(snapshot.run.loadedTransactionCount).toBe(scenario.transactions);
    expect(snapshot.wallets).toHaveLength(scenario.wallets);
    expect(snapshot.reports).toHaveLength(scenario.rawReports);
    for (const wallet of snapshot.wallets) {
      expect(wallet.address).toMatch(/^T[a-zA-Z0-9]{33}$/);
      expect(wallet.provenance).toBe("recorded");
    }
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
  }
  await page.clock.install();
  await page.goto(entry + "?seed=usdd-keeper-auction");
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(4000);
  await page.getByRole("button", { name: "Pause replay", exact: true }).click();
  await page.clock.runFor(18000);
  await expect(
    page.getByRole("button", { name: "Resume replay", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Resume replay", exact: true })
    .click();
  await page.clock.runFor(18000);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "0",
    "0",
    "0",
  ]);
  await expect(
    page.locator(".wallet-row, .candidate-card, .report-preview"),
  ).toHaveCount(0);
  await expect(
    page.getByText("No executors found", { exact: true }),
  ).toBeVisible();
  await expectCoherentCards(page);
  const saved = await request.get(
    "/frontend/research/usdd-keeper-auction.json",
  );
  expect((await saved.json()).seeds[0].coverage).toContain(
    "27 bounded provider queries completed",
  );
  expect(apiRequests).toEqual([]);
});

for (const language of ["en", "zh"] as const) {
  test(`${language} replay and library contain no synthetic interface copy for any seed`, async ({
    page,
  }) => {
    await page.addInitScript(
      (lang) => localStorage.setItem("protocol-alpha-language", lang),
      language,
    );
    await page.clock.install();
    for (const scenario of scenarios) {
      await page.goto(`${entry}?seed=${scenario.id}`);
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        language === "en" ? "en" : "zh-CN",
      );
      await page.locator(".run-control button").click();
      await page.clock.runFor(18000);
      await expectCoherentCards(page);
      await page.locator("header nav button").nth(1).click();
      await expect(page.locator(".report-preview")).toHaveCount(
        scenario.titles.length,
      );
      await expect(page.locator("body")).not.toContainText(
        /\b(?:mock|synthetic|demo)\b|模拟|合成/i,
      );
    }
  });
}
