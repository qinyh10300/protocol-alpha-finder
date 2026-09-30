import { test, expect, type Locator, type Page } from "@playwright/test";

const entry = "/frontend/index.html?seed=energy-rental-liquidation";

async function startReplay(page: Page) {
  await page.clock.install({ time: new Date("2026-09-30T00:00:00Z") });
  await page.goto(entry);
  await page.clock.pauseAt(new Date("2026-09-30T01:00:00Z"));
  await page.locator(".run-control button").click();
}

async function expectBadgeAboveStage(
  row: Locator,
  selector: string,
  stageIndex: number,
) {
  const badge = row.locator(selector);
  await expect(badge).toBeVisible();
  const badgeBox = (await badge.boundingBox())!;
  const stageBox = (await row
    .locator(".pipeline-step")
    .nth(stageIndex)
    .boundingBox())!;
  expect(
    Math.abs(badgeBox.x + badgeBox.width / 2 - stageBox.x - stageBox.width / 2),
  ).toBeLessThan(2);
  expect(badgeBox.y + badgeBox.height).toBeLessThanOrEqual(stageBox.y + 1);
  expect(badgeBox.x).toBeGreaterThanOrEqual(stageBox.x - 1);
  expect(badgeBox.x + badgeBox.width).toBeLessThanOrEqual(
    stageBox.x + stageBox.width + 1,
  );
}

test("duplicate-only rows stay hidden and candidate badges appear when Search Alpha begins", async ({
  page,
}) => {
  await startReplay(page);
  await page.clock.runFor(3500);
  const rows = page.locator(".wallet-row");
  await expect(rows).toHaveCount(4);
  const addresses = await rows
    .locator(".wallet-address")
    .evaluateAll((items) => items.map((item) => item.getAttribute("title")));
  expect(addresses).not.toContain("TKi6batCEJNjQjnWf2uPaRzVavn41hyAqr");
  await expect(rows.locator(".candidate-count, .zero-count")).toHaveCount(0);
  await expect(page.locator(".candidate-card, .report-preview")).toHaveCount(0);
  await expect(rows.first().locator(".pipeline-step small")).toHaveText([
    "Get Transaction",
    "Search Alpha",
    "Validate Alpha",
  ]);
  await page.clock.runFor(1000);
  await expect(rows.first().locator(".pipeline-step").nth(1)).toHaveClass(
    /running/,
  );
  await expect(rows.first().locator(".candidate-count")).toHaveText(
    "1 candidate",
  );
  await expectBadgeAboveStage(rows.first(), ".candidate-count", 1);
  await expect(page.locator(".pending-report-card")).toHaveCount(1);
  await expect(page.locator(".report-generated")).toHaveCount(0);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "4",
    "1",
    "1",
  ]);

  await page.clock.runFor(3000);
  await expect(rows.locator(".candidate-count")).toHaveCount(1);
  await expect(rows.locator(".zero-count")).toHaveCount(3);
  await expect(page.locator(".report-generated")).toHaveCount(0);
  for (let index = 0; index < 4; index++) {
    await expectBadgeAboveStage(
      rows.nth(index),
      ".candidate-count, .zero-count",
      1,
    );
  }

  await page.clock.runFor(5000);
  await expect(rows.first().locator(".pipeline-step").nth(2)).toHaveClass(
    /running/,
  );
  await expect(page.locator(".report-generated")).toHaveCount(0);
  await page.clock.runFor(1000);
  await expect(rows.first().locator(".report-generated")).toHaveText(
    "Report Generated",
  );
  await expect(rows.nth(1).locator(".report-generated")).toHaveCount(0);
  await expectBadgeAboveStage(rows.first(), ".report-generated", 2);
  await page.clock.runFor(4500);
  await expect(rows.locator(".report-generated")).toHaveCount(1);
  await expectBadgeAboveStage(rows.first(), ".report-generated", 2);
  for (let index = 1; index < 4; index++) {
    await expect(rows.nth(index).locator(".zero-count")).toHaveText(
      "0 candidates",
    );
    await expect(rows.nth(index).locator(".report-generated")).toHaveCount(0);
  }
  expect(
    await rows
      .locator(".wallet-address")
      .evaluateAll((items) => items.map((item) => item.getAttribute("title"))),
  ).toEqual(addresses);
  await expect(page.locator(".candidate-card, .report-preview")).toHaveCount(2);
  await expect(
    page.getByLabel("Wallet assessment").locator("option"),
  ).toHaveCount(2);
  const saved = await page.request.get(
    "/frontend/research/energy-rental-liquidation.json",
  );
  const original = await saved.json();
  expect(original.wallets).toHaveLength(5);
  expect(original.reports).toHaveLength(2);
});

for (const language of ["en", "zh"] as const) {
  test(`${language} mobile stages and badges fit their columns without a report badge for zero candidates`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(
      (lang) => localStorage.setItem("protocol-alpha-language", lang),
      language,
    );
    await startReplay(page);
    await page.clock.runFor(18000);
    const rows = page.locator(".wallet-row");
    const stageNames =
      language === "en"
        ? ["Get Transaction", "Search Alpha", "Validate Alpha"]
        : ["获取交易", "发现 Alpha", "验证 Alpha"];
    const reportText = language === "en" ? "Report Generated" : "报告已生成";
    await expect(rows.first().locator(".pipeline-step small")).toHaveText(
      stageNames,
    );
    await expect(rows.locator(".report-generated")).toHaveText([reportText]);
    await expect(rows).toHaveCount(4);
    for (let index = 0; index < 4; index++) {
      await expectBadgeAboveStage(
        rows.nth(index),
        ".candidate-count, .zero-count",
        1,
      );
      if (index === 0)
        await expectBadgeAboveStage(rows.nth(index), ".report-generated", 2);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const overflow = await rows
      .locator(
        ".pipeline-step small, .candidate-count, .zero-count, .report-generated",
      )
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => element.textContent),
      );
    expect(overflow).toEqual([]);

    await page
      .locator('input[name="research-seed"][value="usdd-keeper-auction"]')
      .check();
    await page.locator(".run-control button").click();
    await page.clock.runFor(18000);
    await expect(rows).toHaveCount(2);
    await expect(rows.first().locator(".pipeline-step small")).toHaveText(
      stageNames,
    );
    await expect(rows.locator(".zero-count")).toHaveCount(2);
    await expect(rows.locator(".report-generated")).toHaveCount(0);
    await expect(page.locator(".candidate-card, .report-preview")).toHaveCount(
      0,
    );
    await expectBadgeAboveStage(rows.first(), ".zero-count", 1);
    await expect(page.locator(".summary-count strong")).toHaveText([
      "2",
      "0",
      "0",
    ]);
  });
}
