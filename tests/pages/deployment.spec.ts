import { test, expect, type Page } from "@playwright/test";

const entry = "/frontend/index.html";

function watchStaticPage(page: Page) {
  const apiRequests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (/\/api(?:\/|$)/.test(new URL(request.url()).pathname)) {
      apiRequests.push(request.url());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // Browsers may request an optional favicon from a plain static server.
    if (
      message.type() === "error" &&
      !message.location().url?.endsWith("/favicon.ico")
    ) {
      errors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      !new URL(response.url()).pathname.endsWith("/favicon.ico")
    ) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return () => {
    expect(apiRequests, "Pages must work without the local Python API").toEqual(
      [],
    );
    expect(
      errors,
      "Static assets and the browser app must load cleanly",
    ).toEqual([]);
  };
}

function expectReportUrl(value: string, reportId: string) {
  const url = new URL(value);
  expect(url.pathname).toBe(entry);
  expect(url.searchParams.get("view")).toBe(`/reports/${reportId}`);
}

test("static entry runs the demo and preserves report navigation and share links", async ({
  page,
  context,
}) => {
  const verifyPage = watchStaticPage(page);
  await page.clock.install();
  await page.goto(entry);
  await expect(page.getByLabel("Data mode")).toHaveValue("demo");
  await expect(page.locator(".language-select, .network")).toHaveCount(0);
  await expect(page.locator('option[value="archive"]')).toHaveCount(0);
  await expect(page.locator("main")).toHaveClass("research-main");
  await page.getByRole("button", { name: "Replay Demo" }).click();
  await page.clock.runFor(18000);
  await expect(page.locator(".candidate-card")).toHaveCount(3);
  await expect(page.locator(".report-preview")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Replay Demo" })).toBeVisible();

  const preview = page.locator(".report-preview.featured");
  const reportId = (await preview.getAttribute("data-report-id"))!;
  const title = await preview.locator("h3").innerText();
  await preview.getByRole("button", { name: "Copy link" }).click();
  const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
  expectReportUrl(sharedUrl, reportId);

  await preview.getByRole("button", { name: "Open Full Report" }).click();
  expectReportUrl(page.url(), reportId);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  expectReportUrl(
    await page.evaluate(() => navigator.clipboard.readText()),
    reportId,
  );
  await page.goBack();
  await expect(page.locator("main")).toHaveClass("research-main");
  expect(new URL(page.url()).pathname).toBe(entry);

  // A shared report must load in a fresh page without replaying discovery.
  const sharedPage = await context.newPage();
  const verifySharedPage = watchStaticPage(sharedPage);
  await sharedPage.goto(sharedUrl);
  await expect(sharedPage.getByRole("heading", { level: 1 })).toHaveText(title);
  verifySharedPage();
  verifyPage();
});

test("direct reports retain language and section anchors without enabling the API", async ({
  page,
}) => {
  const verifyPage = watchStaticPage(page);
  const query = new URLSearchParams({
    view: "/reports/report-usdd-keeper",
    mode: "archive",
  });
  await page.goto(`${entry}?${query}`);
  await expect(page.getByLabel("Data mode")).toHaveValue("demo");
  await expect(page.locator(".report-memo")).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("protocol-alpha-language", "zh"),
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.locator('.report-toc a[href="#section-3"]').click();
  expectReportUrl(page.url(), "report-usdd-keeper");
  expect(new URL(page.url()).hash).toBe("#section-3");
  await expect(page.locator("#section-3")).toBeInViewport();
  await page.reload();
  await expect(page.locator(".report-memo")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  expectReportUrl(page.url(), "report-usdd-keeper");
  expect(new URL(page.url()).hash).toBe("#section-3");

  await page.locator("a.brand").click();
  await expect(page.locator("main")).toHaveClass("research-main");
  expect(new URL(page.url()).pathname).toBe(entry);
  await page.reload();
  await expect(page.locator("main")).toHaveClass("research-main");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  verifyPage();
});
