import { test, expect, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type { Snapshot } from "../../frontend/src/types";

const hasArchive = existsSync(
  "data/protocol-alpha-discovery-test/research-record.json",
);
const han = /\p{Script=Han}/u;

async function setSavedLanguage(page: Page, language: "en" | "zh") {
  await page.evaluate(
    (value) => localStorage.setItem("protocol-alpha-language", value),
    language,
  );
  await page.reload();
}

async function expectEnglish(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("body")).not.toContainText(han);
  await expect.poll(() => page.title()).not.toMatch(han);
  const textAttributes = await page
    .locator("[aria-label], [title], [placeholder], [alt]")
    .evaluateAll((elements) =>
      elements.flatMap((element) =>
        ["aria-label", "title", "placeholder", "alt"].map(
          (attribute) => element.getAttribute(attribute) || "",
        ),
      ),
    );
  expect(textAttributes.join("\n")).not.toMatch(han);
}

test.describe("Bilingual research workspace", () => {
  test.skip(!hasArchive, "Restore ignored data/ to test real Skill artifacts");

  test("English is the default across real research and every evidence drawer", async ({
    page,
  }) => {
    await page.goto("/research");
    await expect(page.locator(".candidate-card")).toHaveCount(5);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("52,582", { exact: true })).toBeVisible();
    await expectEnglish(page);

    // Each candidate carries a different saved assessment; check all five.
    for (let index = 0; index < 5; index += 1) {
      await page
        .locator(".candidate-card")
        .nth(index)
        .getByRole("button", { name: "View evidence" })
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("dialog")).toContainText("UNCERTAIN");
      await expectEnglish(page);
      await page.keyboard.press("Escape");
    }

    await page.getByRole("button", { name: "Show 4 more wallets" }).click();
    await expect(page.locator(".wallet-row")).toHaveCount(10);
    for (let index = 0; index < 10; index += 1) {
      await page.locator(".wallet-details-hit").nth(index).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expectEnglish(page);
      await page.keyboard.press("Escape");
    }

    await page.getByRole("button", { name: "View run activity" }).click();
    await expect(page.locator(".skill-stages article")).toHaveCount(4);
    await expectEnglish(page);
    await page.keyboard.press("Escape");
    await page
      .locator('input[name=\"research-seed\"][value=\"usdd-keeper-auction\"]')
      .check();
    await expect(page.locator(".candidate-card")).toHaveCount(0);
    await expectEnglish(page);
  });

  test("all archived reports, evidence labels and exported Markdown are English", async ({
    page,
  }) => {
    const response = await page.request.get(
      "/api/research-runs/local-all/snapshot",
    );
    expect(response.ok()).toBeTruthy();
    const snapshot: Snapshot = await response.json();
    expect(snapshot.reports).toHaveLength(5);
    for (const report of snapshot.reports) {
      await page.goto(`/reports/${report.id}`);
      await expect(page.locator(".report-memo")).toBeVisible();
      await expect(page.locator(".report-memo")).toContainText("UNCERTAIN");
      await expectEnglish(page);

      const downloadEvent = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Export report", exact: true })
        .click();
      const download = await downloadEvent;
      expect(download.suggestedFilename()).toBe(`${report.id}.md`);
      const exported = await readFile((await download.path())!, "utf8");
      expect(exported).not.toMatch(han);
      expect(exported).toContain(report.candidateId);
    }
    await page.goto("/reports");
    await expect(page.locator(".report-preview")).toHaveCount(5);
    await expectEnglish(page);
  });

  test("Chinese translates real content and persists through navigation, reload, seed changes and polling", async ({
    page,
  }) => {
    await page.goto("/research");
    await expect(page.locator(".candidate-card")).toHaveCount(5);
    const englishTitle = await page
      .locator(".candidate-card h3")
      .first()
      .innerText();
    const candidateIds = await page
      .locator(".candidate-card h3")
      .evaluateAll((headings) =>
        headings.map((heading) => heading.getAttribute("title")),
      );
    await setSavedLanguage(page, "zh");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator(".candidate-card h3").first()).toContainText(han);
    await expect(page.locator(".candidate-card h3").first()).not.toHaveText(
      englishTitle,
    );
    await expect(
      page.locator(".candidate-card .card-summary").first(),
    ).toContainText(han);
    await expect(page.getByText("52,582", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("protocol-alpha-language"),
      ),
    ).toBe("zh");

    // Navigating through the app keeps the locale and the original report identity.
    const reportId = await page
      .locator(".report-preview.featured")
      .getAttribute("data-report-id");
    await page.locator(".report-preview.featured .report-open-button").click();
    await expect(page).toHaveURL(new RegExp(`/reports/${reportId}$`));
    await expect(page.locator(".report-memo")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(han);
    await page.reload();
    await expect(page.locator(".report-memo")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(han);

    await page.locator("header nav button").first().click();
    await expect(page.locator(".candidate-card")).toHaveCount(5);
    await page
      .locator(
        'input[name="research-seed"][value="justlend-lending-liquidation"]',
      )
      .check();
    await expect(page.locator(".candidate-card")).toHaveCount(3);
    await expect(page.locator(".candidate-card h3").first()).toContainText(han);
    await page.goto("/?seed=all");
    await expect(page.locator(".candidate-card")).toHaveCount(5);
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/research-runs/local-all/snapshot") &&
        response.ok(),
    );
    await expect(page.locator(".candidate-card h3").first()).toContainText(han);
    expect(
      await page
        .locator(".candidate-card h3")
        .evaluateAll((headings) =>
          headings.map((heading) => heading.getAttribute("title")),
        ),
    ).toEqual(candidateIds);

    await setSavedLanguage(page, "en");
    await expect(page.locator(".candidate-card h3").first()).toHaveText(
      englishTitle,
    );
    await expectEnglish(page);
    await page.reload();
    await expect(page.locator(".candidate-card")).toHaveCount(5);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expectEnglish(page);
  });
});

test("demo progression and replay keep the saved language", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/research?mode=demo");
  await expect(page.getByRole("button", { name: "Replay Demo" })).toBeVisible();
  await expectEnglish(page);
  await setSavedLanguage(page, "zh");
  await page.locator(".run-control button").click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card")).toHaveCount(3);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator(".candidate-card h3").first()).toContainText(han);
  await expect(
    page.locator(".candidate-card .card-summary").first(),
  ).toContainText(han);
  await page.locator(".run-control button").click();
  await expect(page.locator(".candidate-card")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await setSavedLanguage(page, "en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expectEnglish(page);
});
