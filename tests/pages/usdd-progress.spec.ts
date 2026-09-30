import { test, expect, type Page } from "@playwright/test";

const entry = "/frontend/index.html?seed=usdd-keeper-auction";
const snapshotPath = "/frontend/research/usdd-keeper-auction.json";
const note =
  "USDD replay · Stage progress is illustrative. Wallets and transaction evidence are recorded.";
const wallets = [
  "TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB",
  "TDNLgniuf5TeYwh5fyGMvoFfeVcmvgWmcy",
];

async function openReplay(page: Page) {
  await page.clock.install({ time: new Date("2026-09-30T00:00:00Z") });
  await page.goto(entry);
  await page.clock.pauseAt(new Date("2026-09-30T01:00:00Z"));
  await expect(page.locator(".workspace-note")).toHaveText(note);
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pause replay", exact: true }),
  ).toBeVisible();
}

async function expectNoInventedResearch(page: Page) {
  await expect(page.locator(".summary-count strong")).toHaveText([
    "2",
    "0",
    "0",
  ]);
  await expect(page.locator(".summary-bottom strong")).toHaveText("0");
  await expect(page.locator(".candidate-card, .report-preview")).toHaveCount(0);
  await expect(page.locator(".wallet-address")).toHaveCount(2);
  for (const [index, address] of wallets.entries()) {
    await expect(page.locator(".wallet-address").nth(index)).toHaveAttribute(
      "title",
      address,
    );
  }
}

async function expectStages(page: Page, states: string[]) {
  const rows = page.locator(".wallet-row");
  await expect(rows).toHaveCount(2);
  for (let wallet = 0; wallet < 2; wallet++) {
    const steps = rows.nth(wallet).locator(".pipeline-step");
    await expect(steps).toHaveCount(3);
    for (let stage = 0; stage < states.length; stage++) {
      await expect(steps.nth(stage)).toHaveClass(
        new RegExp(`\\b${states[stage]}\\b`),
      );
    }
  }
}

test("USDD animates each stage while retaining recorded evidence and unknown history counts", async ({
  page,
  request,
}) => {
  const savedBefore = await request.get(snapshotPath);
  expect(savedBefore.ok()).toBe(true);
  const originalText = await savedBefore.text();
  const original = JSON.parse(originalText);
  const apiRequests: string[] = [];
  page.on("request", (req) => {
    if (/\/api(?:\/|$)/.test(new URL(req.url()).pathname)) {
      apiRequests.push(req.url());
    }
  });
  await openReplay(page);

  let elapsed = 0;
  for (const stage of [
    { at: 2000, states: ["running", "queued", "queued"] },
    { at: 5500, states: ["completed", "running", "queued"] },
    { at: 7500, states: ["completed", "completed", "running"] },
    { at: 10000, states: ["completed", "completed", "completed"] },
  ]) {
    await page.clock.runFor(stage.at - elapsed);
    elapsed = stage.at;
    await expectStages(page, stage.states);
    await expectNoInventedResearch(page);
    await expect(page.locator(".wallet-volume")).toHaveText([
      stage.at < 4000 ? "History pending" : "History replayed",
      stage.at < 4700 ? "History pending" : "History replayed",
    ]);
    await expect(page.locator(".workspace-note")).toHaveText(note);
    await expect(
      page.getByRole("button", { name: "Pause replay", exact: true }),
    ).toBeVisible();
  }
  await page.clock.runFor(6500);
  await expect(page.locator(".run-control .chip")).toHaveText("Running");
  await page.clock.runFor(1000);
  await expect(page.locator(".run-control .chip")).toHaveText("Completed");
  await expectNoInventedResearch(page);
  await expect(
    page.getByRole("button", { name: "Replay Research", exact: true }),
  ).toBeVisible();

  for (const wallet of original.wallets) {
    await page
      .getByRole("button", {
        name: `Investigate wallet ${wallet.address}`,
        exact: true,
      })
      .click();
    const drawer = page.getByRole("dialog", { name: "Wallet investigation" });
    await expect(drawer.locator(".pipeline-step.completed")).toHaveCount(3);
    await expect(drawer.locator(".detail-stat strong")).toHaveText("—");
    await expect(drawer.locator(".drawer-note")).toHaveText(
      wallet.coverageNote,
    );
    await expect(drawer.locator(".linked-candidate")).toHaveCount(0);
    const links = await drawer
      .locator("a.evidence-link")
      .evaluateAll((items) =>
        items.map((item) => (item as HTMLAnchorElement).href),
      );
    expect(links.sort()).toEqual(
      wallet.evidenceRefs
        .map((ref: { url: string }) => new URL(ref.url, page.url()).href)
        .sort(),
    );
    const evidence = drawer.getByRole("link", {
      name: "USDD historical transaction evidence",
      exact: true,
    });
    const document = await request.get(
      new URL((await evidence.getAttribute("href"))!, page.url()).href,
    );
    expect(document.ok()).toBe(true);
    expect((await document.json()).transactions).toHaveLength(3);
    await drawer
      .getByRole("button", { name: "Close drawer", exact: true })
      .click();
  }
  // Stage playback never writes fictional completed jobs back to the artifact.
  const savedAfter = await request.get(snapshotPath);
  expect(await savedAfter.text()).toBe(originalText);
  expect(
    original.wallets.map((wallet: { address: string }) => wallet.address),
  ).toEqual(wallets);
  for (const wallet of original.wallets) {
    expect(wallet.historyJob).toEqual({ status: "queued" });
    expect(wallet.analysisJob).toEqual({ status: "queued" });
    expect(wallet.alphaSearchJob).toEqual({ status: "queued" });
    expect(wallet.candidateIds).toEqual([]);
  }
  expect(original.run.loadedTransactionCount).toBe(0);
  expect(original.candidates).toEqual([]);
  expect(original.reports).toEqual([]);
  expect(
    apiRequests,
    "Pages uses the bundled plan without a local API",
  ).toEqual([]);
});

test("USDD pause holds progress, resume continues it, and restart resets every stage", async ({
  page,
}) => {
  await openReplay(page);
  await page.clock.runFor(2500);
  await expectStages(page, ["running", "queued", "queued"]);
  await page.getByRole("button", { name: "Pause replay", exact: true }).click();
  await expect(page.locator(".run-control .chip")).toHaveText("Paused");
  const beforePause = await page.locator(".wallet-column").innerText();
  await page.clock.runFor(20000);
  await expectStages(page, ["running", "queued", "queued"]);
  await expect(page.locator(".wallet-column")).toHaveText(beforePause, {
    useInnerText: true,
  });
  await expectNoInventedResearch(page);
  await page
    .getByRole("button", { name: "Resume replay", exact: true })
    .click();
  await page.clock.runFor(3000);
  await expectStages(page, ["completed", "running", "queued"]);
  await page.clock.runFor(12500);
  await expectStages(page, ["completed", "completed", "completed"]);
  await expectNoInventedResearch(page);
  await page
    .getByRole("button", { name: "Replay Research", exact: true })
    .click();
  await expect(page.locator(".wallet-row")).toHaveCount(0);
  await expect(page.locator(".summary-count strong")).toHaveText([
    "0",
    "0",
    "0",
  ]);
  await expect(page.locator(".summary-bottom strong")).toHaveText("0");
  await page.clock.runFor(2000);
  await expectStages(page, ["running", "queued", "queued"]);
  await expect(page.locator(".wallet-volume")).toHaveText([
    "History pending",
    "History pending",
  ]);
  await expectNoInventedResearch(page);
});
