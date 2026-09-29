import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import mockPayload from "../../Protocol_Alpha_Finder_Frontend_Implementation_Pack/06_MOCK_DATA.json" with { type: "json" };
import {
  localizeReport,
  localizeResearchText,
  localizeSnapshot,
} from "../../frontend/src/locales/research";
import type { Snapshot } from "../../frontend/src/types";

const narrativeFields = new Set([
  "name",
  "title",
  "description",
  "coverage",
  "gaps",
  "coverageNote",
  "summary",
  "executiveSummary",
  "label",
  "value",
  "outcomeReason",
  "missingEvidence",
  "nextChecks",
  "alternativeExplanations",
  "message",
  "note",
]);
const han = /\p{Script=Han}/u;
function narratives(value: unknown, key = ""): string[] {
  if (Array.isArray(value))
    return value.flatMap((item) => narratives(item, key));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([field, item]) =>
      narratives(item, field),
    );
  if (
    typeof value === "string" &&
    narrativeFields.has(key) &&
    !/^T[a-zA-Z0-9]{33}$/.test(value)
  )
    return [value];
  return [];
}
function identity(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) return value.map((item) => identity(item, key));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([field]) => !narrativeFields.has(field))
        .map(([field, item]) => [field, identity(item, field)]),
    );
  return value;
}
function verifyTranslation(snapshot: Snapshot) {
  const original = JSON.stringify(snapshot);
  const en = localizeSnapshot(snapshot, "en");
  const zh = localizeSnapshot(snapshot, "zh");
  expect(
    narratives(en).filter((text) => han.test(text)),
    "English narrative must contain no Chinese",
  ).toEqual([]);
  expect(
    narratives(zh).filter((text) => !han.test(text)),
    "Chinese narrative must have a deliberate translation",
  ).toEqual([]);
  expect(identity(en)).toEqual(identity(snapshot));
  expect(identity(zh)).toEqual(identity(snapshot));
  expect(JSON.stringify(snapshot), "Raw evidence must not be mutated").toBe(
    original,
  );
  for (const report of snapshot.reports) {
    expect(localizeReport(report, "en")).toEqual(
      en.reports.find((item) => item.id === report.id),
    );
    expect(localizeReport(report, "zh")).toEqual(
      zh.reports.find((item) => item.id === report.id),
    );
  }
}

test("every archived narrative is bilingual and evidence identifiers are preserved", async ({
  request,
}) => {
  test.skip(
    !existsSync("data/protocol-alpha-discovery-test/research-record.json"),
    "Restore ignored data/ to test real Skill artifacts",
  );
  const response = await request.get("/api/research-runs/local-all/snapshot");
  expect(response.ok()).toBeTruthy();
  verifyTranslation(await response.json());
});

test("demo reports and seed content have complete Chinese translations", () => {
  const snapshot = {
    run: mockPayload.run,
    seeds: [mockPayload.seed],
    wallets: mockPayload.wallets,
    candidates: mockPayload.candidates,
    reports: mockPayload.reports,
    activity: mockPayload.candidates.map((candidate) => ({
      id: candidate.id,
      runId: mockPayload.run.id,
      timestamp: candidate.createdAt,
      eventType: "candidate_created",
      message: candidate.title,
    })),
    skills: [],
    mode: "demo",
  } as unknown as Snapshot;
  verifyTranslation(snapshot);
});

test("unknown evidence stays verbatim and known titles retain their IDs", () => {
  const unknown = "New source evidence: 未经翻译，保留原文";
  expect(localizeResearchText(unknown, "en")).toBe(unknown);
  expect(localizeResearchText(unknown, "zh")).toBe(unknown);
  expect(
    localizeResearchText("同笔租赁—清算—归还组合 · WAI-ENERGY-01", "en"),
  ).toBe("Same-transaction Rental, Liquidation & Return · WAI-ENERGY-01");
  expect(
    localizeResearchText(
      "Borrower TEST_ADDRESS: shortfall 100 (raw), error 7.",
      "zh",
    ),
  ).toContain("TEST_ADDRESS：资金缺口 100（原始值），错误码 7");
});
