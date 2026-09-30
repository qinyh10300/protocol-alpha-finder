import usddPlan from "../public/replay/usdd-keeper-auction.json" with { type: "json" };
import { isPagesBuild } from "./routing";
import type { ReplayPlan } from "./types";

export function parseReplayPlan(value: unknown, seedId: string): ReplayPlan {
  const plan = value as ReplayPlan;
  const jobs = ["historyJob", "analysisJob", "alphaSearchJob"];
  if (
    !plan ||
    plan.schemaVersion !== 1 ||
    plan.seedId !== seedId ||
    plan.kind !== "illustrative_progress" ||
    !Number.isFinite(plan.durationSeconds) ||
    plan.durationSeconds <= 0 ||
    !Number.isFinite(plan.walletStaggerSeconds) ||
    plan.walletStaggerSeconds < 0 ||
    typeof plan.note !== "string" ||
    !Array.isArray(plan.stages) ||
    plan.stages.length !== jobs.length ||
    plan.stages.some(
      (stage, index) =>
        stage?.job !== jobs[index] ||
        !Number.isFinite(stage.start) ||
        !Number.isFinite(stage.end) ||
        stage.start < 0 ||
        stage.end <= stage.start ||
        stage.end > plan.durationSeconds ||
        (index > 0 && stage.start < plan.stages[index - 1].end),
    )
  )
    throw new Error("Invalid research replay plan.");
  return structuredClone(plan);
}

/** Local replay plans come from the API; Pages uses the identical published file. */
export async function loadReplayPlan(
  seedId: string,
): Promise<ReplayPlan | undefined> {
  if (seedId !== "usdd-keeper-auction") return undefined;
  if (isPagesBuild) return parseReplayPlan(usddPlan, seedId);
  const response = await fetch(`/api/replay-plans/${seedId}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Could not load the research replay plan.");
  return parseReplayPlan(await response.json(), seedId);
}
