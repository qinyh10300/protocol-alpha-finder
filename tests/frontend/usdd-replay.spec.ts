import { test, expect } from "@playwright/test";

test("USDD uses the backend plan and advances without changing recorded evidence", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-09-30T00:00:00Z") });
  const planResponse = page.waitForResponse(
    "**/api/replay-plans/usdd-keeper-auction",
  );
  await page.goto("/research?mode=demo&seed=usdd-keeper-auction");
  const response = await planResponse;
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({
    kind: "illustrative_progress",
    durationSeconds: 17,
  });
  await page.clock.pauseAt(new Date("2026-09-30T01:00:00Z"));
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await page.clock.runFor(2000);
  const row = page.locator(".wallet-row").first();
  await expect(page.locator(".wallet-row")).toHaveCount(2);
  await expect(row.locator(".pipeline-step.running")).toHaveText(/History/);
  await expect(row.locator(".running .step-track > span")).toHaveCSS(
    "animation-name",
    "research-step-pulse",
  );
  await page.getByRole("button", { name: "Pause replay" }).click();
  await expect(page.locator(".workspace-grid")).toHaveAttribute(
    "data-run-status",
    "paused",
  );
  await page.clock.runFor(10000);
  await expect(row.locator(".pipeline-step.running")).toHaveText(/History/);
  await expect(row.locator(".running .step-track > span")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.getByRole("button", { name: "Resume replay" }).click();
  await page.clock.runFor(3500);
  await expect(row.locator(".pipeline-step.running")).toHaveText(/Analyze/);
  await page.clock.runFor(2000);
  await expect(row.locator(".pipeline-step.running")).toHaveText(
    /Search Alpha/,
  );
  await page.clock.runFor(10000);
  await expect(
    page.locator(".wallet-row .pipeline-step.completed"),
  ).toHaveCount(6);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "2",
    "0",
    "0",
  ]);
  await expect(
    page.locator(".candidate-card, .report-preview, .coverage-note"),
  ).toHaveCount(0);
  await expect(page.getByText("History replayed", { exact: true })).toHaveCount(
    2,
  );
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await expect(page.locator(".wallet-row")).toHaveCount(0);
  await page.clock.runFor(2000);
  await expect(row.locator(".pipeline-step.running")).toHaveText(/History/);
});
