import type { CandidateGroup } from "./candidateGroups";
import type { AlphaCandidate, AlphaReport } from "./types";

/** One report card per displayed mechanism; wallet assessments stay distinct. */
export type CandidateReportGroup = {
  key: string;
  candidate: AlphaCandidate;
  reports: AlphaReport[];
};

export function buildReportGroups(
  groups: CandidateGroup[],
  reports: AlphaReport[],
): CandidateReportGroup[] {
  const byId = new Map(reports.map((report) => [report.id, report]));
  return groups.map((group) => ({
    key: group.key,
    candidate: group.candidate,
    reports: group.reportIds.flatMap((id) => {
      const report = byId.get(id);
      return report ? [report] : [];
    }),
  }));
}
