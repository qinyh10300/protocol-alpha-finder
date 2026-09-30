import { test, expect } from "@playwright/test";
import { RecordedResearchDataSource } from "../../frontend/src/data";
import { groupCandidates } from "../../frontend/src/candidateGroups";
import energy from "../../frontend/public/research/energy-rental-liquidation.json" with { type: "json" };
import lending from "../../frontend/public/research/justlend-lending-liquidation.json" with { type: "json" };
import usdd from "../../frontend/public/research/usdd-keeper-auction.json" with { type: "json" };
import type { Snapshot } from "../../frontend/src/types";

const fixtures = [energy, lending, usdd] as Snapshot[];

async function replayClock(
  run: (advance: (seconds: number) => void) => Promise<void>,
) {
  const originalNow = Date.now;
  let now = 1_000_000;
  Date.now = () => now;
  try {
    await run((seconds) => {
      now += seconds * 1000;
    });
  } finally {
    Date.now = originalNow;
  }
}

for (const fixture of fixtures) {
  test(`${fixture.run.seedId} replays only its recorded wallets, candidates and reports`, async () => {
    await replayClock(async (advance) => {
      const source = new RecordedResearchDataSource();
      source.selectSeed(fixture.run.seedId);
      const idle = await source.getSnapshot();
      expect(idle.run.status).toBe("idle");
      expect(idle.wallets).toEqual([]);
      expect(idle.candidates).toEqual([]);
      expect(idle.reports).toEqual([]);

      await source.createRun(fixture.run.seedId);
      expect((await source.getSnapshot()).run.status).toBe("running");
      advance(18);
      const completed = await source.getSnapshot();
      expect(completed.run.status).toBe("completed");
      expect(completed.provenance).toBe("recorded");
      expect(completed.run.walletCount).toBe(fixture.wallets.length);
      expect(completed.run.candidateCount).toBe(fixture.candidates.length);
      expect(completed.run.reportCount).toBe(fixture.reports.length);
      expect(completed.run.loadedTransactionCount).toBe(
        fixture.run.loadedTransactionCount,
      );
      expect(completed.wallets.map((wallet) => wallet.address)).toEqual(
        fixture.wallets.map((wallet) => wallet.address),
      );
      expect(completed.candidates).toEqual(fixture.candidates);
      expect(completed.reports).toEqual(fixture.reports);
      expect(completed.window).toEqual(fixture.window);
      expect(
        completed.reports.every(
          (report) => report.rawCurrentState === "UNCERTAIN",
        ),
      ).toBe(true);
    });
  });
}

test("wallet history, analysis, candidates and validation use one progressive replay", async () => {
  await replayClock(async (advance) => {
    const source = new RecordedResearchDataSource();
    await source.createRun("energy-rental-liquidation");
    advance(1);
    let data = await source.getSnapshot();
    expect(data.wallets[0].historyJob.status).toBe("running");
    expect(data.wallets[0].analysisJob.status).toBe("queued");
    expect(data.wallets[0].historyJob.txCount).toBeUndefined();
    advance(3.5);
    data = await source.getSnapshot();
    expect(data.wallets[0].historyJob.status).toBe("completed");
    expect(data.wallets[0].analysisJob.status).toBe("running");
    expect(data.wallets[0].alphaSearchJob.status).toBe("queued");
    advance(2);
    data = await source.getSnapshot();
    expect(data.wallets[0].analysisJob.status).toBe("completed");
    expect(data.wallets[0].alphaSearchJob.status).toBe("running");
    advance(2.5);
    data = await source.getSnapshot();
    expect(data.candidates[0].status).toBe("discovered");
    expect(data.reports).toEqual([]);
    advance(1);
    data = await source.getSnapshot();
    expect(data.candidates[0].status).toBe("validating");
    expect(data.candidates[0].reportId).toBeUndefined();
    advance(3);
    data = await source.getSnapshot();
    expect(data.candidates[0].status).toBe("report_ready");
    expect(data.reports.map((report) => report.id)).toEqual([
      "report-WAI-ENERGY-01",
    ]);
  });
});

test("all report deep links work before replay and cannot mutate the saved exports", async () => {
  const before = structuredClone(fixtures);
  const source = new RecordedResearchDataSource();
  for (const fixture of fixtures) {
    for (const report of fixture.reports) {
      const retrieved = await source.getReport(report.id);
      expect(retrieved).toEqual(report);
      retrieved.title = "Changed only in this returned copy";
      retrieved.evidenceRefs.length = 0;
      expect(await source.getReport(report.id)).toEqual(report);
    }
  }
  await expect(source.getReport("report-demo-usdd-reset")).rejects.toThrow(
    "Report not found",
  );
  expect(fixtures).toEqual(before);
});

test("snapshot reads, pause and restart preserve the saved data and reset each seed", async () => {
  const before = structuredClone(fixtures);
  await replayClock(async (advance) => {
    const source = new RecordedResearchDataSource();
    await source.createRun("justlend-lending-liquidation");
    advance(6);
    source.pause();
    advance(20);
    expect((await source.getSnapshot()).run.status).toBe("paused");
    expect((await source.getSnapshot()).candidates).toEqual([]);
    source.resume();
    advance(12);
    const completed = await source.getSnapshot();
    completed.candidates[0].summary = "Changed locally";
    completed.wallets[0].candidateIds.length = 0;
    completed.reports[0].mechanism.summary = "Changed locally";
    expect((await source.getSnapshot()).candidates).toEqual(lending.candidates);
    expect((await source.getSnapshot()).reports).toEqual(lending.reports);
    source.selectSeed("usdd-keeper-auction");
    expect((await source.getSnapshot()).run.status).toBe("idle");
    expect((await source.getSnapshot()).wallets).toEqual([]);
    await source.createRun("usdd-keeper-auction");
    advance(18);
    expect((await source.getSnapshot()).run.loadedTransactionCount).toBe(0);
  });
  expect(fixtures).toEqual(before);
});

test("legacy all-seed replay contains 10 recorded wallets and 3 distinct mechanisms", async () => {
  await replayClock(async (advance) => {
    const source = new RecordedResearchDataSource();
    await source.createRun("all");
    advance(18);
    const data = await source.getSnapshot();
    expect(data.provenance).toBe("recorded");
    expect(data.run).toMatchObject({
      walletCount: 10,
      candidateCount: 5,
      reportCount: 5,
      loadedTransactionCount: 52582,
    });
    expect(groupCandidates(data.candidates, data)).toHaveLength(3);
    expect(data.reports.map((report) => report.id)).toEqual(
      fixtures.flatMap((fixture) => fixture.reports.map((report) => report.id)),
    );
    expect(
      data.reports.filter((report) => report.outcome === "MONITOR"),
    ).toHaveLength(3);
    expect(
      data.reports.filter(
        (report) => report.outcome === "INSUFFICIENT_EVIDENCE",
      ),
    ).toHaveLength(2);
    expect(
      data.wallets.every((wallet) => wallet.provenance === "recorded"),
    ).toBe(true);
  });
});
