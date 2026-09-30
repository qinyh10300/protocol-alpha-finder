import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronRight,
  Copy,
  Database,
  FileText,
  Settings2,
  Zap,
} from "lucide-react";
import type { CandidateReportGroup } from "./reportGroups";
import type { AlphaReport, Outcome } from "./types";
import { useI18n } from "./i18n";
import { SeedOrigin } from "./SeedOrigin";
import { routeUrl } from "./routing";
import "./report-cards.css";

type Translate = ReturnType<typeof useI18n>["t"];

const outcomeLabels: Record<Outcome, string> = {
  ACTIONABLE: "Actionable",
  MONITOR: "Monitor",
  REJECTED: "Rejected",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
};

function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const { t } = useI18n();
  return (
    <span className={`report-outcome report-outcome-${outcome.toLowerCase()}`}>
      <span aria-hidden="true" />
      {t(outcomeLabels[outcome])}
    </span>
  );
}

function sampleLabel(report: AlphaReport, t: Translate) {
  const label = report.evidenceCountLabel || "historical executions";
  return t(
    report.historicalExecutionCount === 1 ? label.replace(/s$/, "") : label,
  );
}

function reportDate(
  value: string | undefined,
  locale: string,
  t: Translate,
  full = false,
) {
  if (!value) return t("Not recorded");
  return (
    new Date(value).toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      ...(full ? { year: "numeric", hour: "2-digit", minute: "2-digit" } : {}),
      timeZone: "UTC",
    }) + (full ? " UTC" : "")
  );
}

function firstSentence(text: string) {
  return text.match(/^.*?(?:[.!?](?:\s|$)|[。！？])/)?.[0].trim() || text;
}

/** Preview excerpts use the saved assessment, including its uncertainty. */
function findings(report: AlphaReport, t: Translate, locale: string) {
  const stateFinding = report.currentState.items?.[0]?.value;
  const currentState = report.rawCurrentState
    ? `${t(report.rawCurrentState)}${stateFinding ? ` — ${stateFinding}` : ""}`
    : report.currentState.summary;
  const conditions = report.executionConditions.items?.slice(0, 2);
  return [
    {
      key: "mechanism",
      title: "Mechanism",
      icon: Settings2,
      text: report.mechanism.summary,
    },
    {
      key: "historical-evidence",
      title: "Historical Evidence",
      icon: ChartNoAxesColumnIncreasing,
      text:
        report.historicalExecutionCount != null
          ? t("{samples} from {wallets}.", {
              samples: t("{count} {label}", {
                count: report.historicalExecutionCount.toLocaleString(locale),
                label: sampleLabel(report, t),
              }),
              wallets: t(
                report.sourceWallets.length === 1
                  ? "{count} source wallet"
                  : "{count} source wallets",
                {
                  count: report.sourceWallets.length.toLocaleString(locale),
                },
              ),
            })
          : report.historicalEvidence.summary,
    },
    {
      key: "current-state",
      title: "Current State",
      icon: Database,
      text: currentState,
    },
    {
      key: "execution-conditions",
      title: "Execution Conditions",
      icon: Zap,
      text: conditions?.length
        ? t("Verify: {conditions}.", {
            conditions: conditions.map((item) => item.value).join(t("; ")),
          })
        : report.executionConditions.summary,
    },
  ];
}

export function AlphaReportPreview({
  report,
  featured = false,
  assessments = [],
  selectAssessment,
  open,
}: {
  report: AlphaReport;
  featured?: boolean;
  assessments?: AlphaReport[];
  selectAssessment?: (id: string) => void;
  open: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    if (copyState !== "copied") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  async function copyLink() {
    const url = routeUrl(`/reports/${encodeURIComponent(report.id)}`);
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <article
      className={`report-preview report-card ${featured ? "featured" : "report-library-card"} report-card-${report.outcome.toLowerCase()}`}
      data-report-id={report.id}
    >
      <SeedOrigin ids={report.sourceSeedIds} provenance={report.provenance} />
      <header className="report-card-heading">
        <span className="report-document-icon" aria-hidden="true">
          <FileText size={24} strokeWidth={1.9} />
        </span>
        <div className="report-title-block">
          <h3 tabIndex={featured ? -1 : undefined}>{report.title}</h3>
          <div className="report-disposition">
            <OutcomeBadge outcome={report.outcome} />
            {featured && (
              <span
                className="report-checked"
                title={reportDate(report.lastCheckedAt, locale, t, true)}
              >
                {t("Checked {date}", {
                  date: reportDate(report.lastCheckedAt, locale, t),
                })}
              </span>
            )}
            {!featured && (
              <span className="report-candidate-reference">
                {report.candidateId}
              </span>
            )}
          </div>
        </div>
      </header>
      {assessments.length > 1 && selectAssessment && (
        <label className="report-assessment-picker">
          <span>{t("Wallet assessment")}</span>
          <select
            aria-label={t("Wallet assessment")}
            value={report.id}
            onChange={(event) => selectAssessment(event.target.value)}
          >
            {assessments.map((assessment) => (
              <option key={assessment.id} value={assessment.id}>
                {assessment.sourceWallets
                  .map((wallet) => `${wallet.slice(0, 6)}…${wallet.slice(-5)}`)
                  .join(", ")}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="report-excerpt" title={report.executiveSummary}>
        {featured
          ? firstSentence(report.executiveSummary)
          : report.executiveSummary}
      </p>

      {featured && (
        <div
          className="report-section-preview"
          id={`report-details-${report.id}`}
        >
          {findings(report, t, locale).map(
            ({ key, title, icon: Icon, text }) => (
              <section
                className={`report-section-row section-${key}`}
                key={key}
              >
                <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                <div>
                  <h4>{t(title)}</h4>
                  <p title={text}>{text}</p>
                </div>
              </section>
            ),
          )}
        </div>
      )}

      {!featured && (
        <dl className="report-evidence-strip">
          <div>
            <dt>{t("Source wallets")}</dt>
            <dd>
              {t(
                report.sourceWallets.length === 1
                  ? "{count} wallet"
                  : "{count} wallets",
                {
                  count: report.sourceWallets.length.toLocaleString(locale),
                },
              )}
            </dd>
          </div>
          {report.historicalExecutionCount != null && (
            <div>
              <dt>{sampleLabel(report, t)}</dt>
              <dd>{report.historicalExecutionCount.toLocaleString(locale)}</dd>
            </div>
          )}
          <div>
            <dt>{t("Last checked")}</dt>
            <dd title={reportDate(report.lastCheckedAt, locale, t, true)}>
              {report.lastCheckedAt ? (
                <time dateTime={report.lastCheckedAt}>
                  {reportDate(report.lastCheckedAt, locale, t)}
                </time>
              ) : (
                t("Not recorded")
              )}
            </dd>
          </div>
        </dl>
      )}

      <div className="report-preview-actions">
        <button className="report-open-button" onClick={() => open(report.id)}>
          <FileText size={15} aria-hidden="true" />
          {t("Open Full Report")}
          {!featured && <ArrowRight size={14} aria-hidden="true" />}
        </button>
        {featured && (
          <button className="report-copy-button" onClick={copyLink}>
            {copyState === "copied" ? <Check size={14} /> : <Copy size={14} />}
            <span aria-live="polite">
              {t(copyState === "copied" ? "Copied" : "Copy link")}
            </span>
          </button>
        )}
      </div>
      {copyState === "failed" && (
        <label className="report-copy-fallback">
          {t("Clipboard unavailable. Select and copy this report link:")}
          <input
            aria-label={t("Report link")}
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
          />
        </label>
      )}
    </article>
  );
}

export function CandidateReportCard({
  group,
  featured = false,
  selectedId,
  select,
  open,
}: {
  group: CandidateReportGroup;
  featured?: boolean;
  selectedId?: string | null;
  select?: (id: string) => void;
  open: (id: string) => void;
}) {
  const { t } = useI18n();
  const [assessmentId, setAssessmentId] = useState<string>();
  const report =
    group.reports.find(
      (report) => report.id === (selectedId || assessmentId),
    ) || group.reports[0];
  if (!report) {
    return (
      <article
        className={`report-preview report-card pending-report-card${featured ? " featured" : ""}`}
        data-candidate-id={group.candidate.id}
      >
        <header className="report-card-heading">
          <span className="report-document-icon" aria-hidden="true">
            <FileText size={24} />
          </span>
          <div className="report-title-block">
            <h3 tabIndex={featured ? -1 : undefined}>
              {group.candidate.title}
            </h3>
            <span className="report-pending-status">
              {t("Validation in progress")}
            </span>
          </div>
        </header>
        <p className="report-excerpt">
          {t(
            "This candidate's report is being prepared. Findings will appear after validation.",
          )}
        </p>
      </article>
    );
  }
  return (
    <AlphaReportPreview
      key={report.id}
      report={report}
      featured={featured}
      assessments={group.reports}
      selectAssessment={select || setAssessmentId}
      open={open}
    />
  );
}

export function AlphaReportList({
  groups,
  selectedId,
  select,
  open,
}: {
  groups: CandidateReportGroup[];
  selectedId: string | null;
  select: (id: string) => void;
  open: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const selected =
    groups.find(
      (group) =>
        group.candidate.id === selectedId ||
        group.reports.some((report) => report.id === selectedId),
    ) || groups[0];
  const selection = selected
    ? `${selected.key}:${selectedId || ""}`
    : undefined;
  const contentRef = useRef<HTMLDivElement>(null);
  const previousSelection = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (previousSelection.current && previousSelection.current !== selection) {
      contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
      contentRef.current
        ?.querySelector<HTMLElement>(".featured h3")
        ?.focus({ preventScroll: true });
    }
    previousSelection.current = selection;
  }, [selection]);

  return (
    <section
      id="alpha-report-column"
      className="workspace-column report-column"
    >
      <div className="column-heading">
        <span className="column-icon" aria-hidden="true">
          <FileText size={20} />
        </span>
        <h2>
          {t("Alpha Reports")}{" "}
          <span>({groups.length.toLocaleString(locale)})</span>
        </h2>
      </div>
      <p className="column-description">
        {t("One report per candidate, with evidence and validation outcomes.")}
      </p>
      <div className="column-content report-list-content" ref={contentRef}>
        {selected ? (
          <>
            <CandidateReportCard
              key={selected.key}
              group={selected}
              featured
              selectedId={selectedId}
              select={select}
              open={open}
            />
            {groups
              .filter((group) => group.key !== selected.key)
              .map((group) => {
                const report = group.reports[0];
                return (
                  <article
                    className={`report-preview compact-report-card${report ? "" : " pending-report-card"}`}
                    key={group.key}
                    data-report-id={report?.id}
                    data-candidate-id={group.candidate.id}
                  >
                    <button
                      className="compact-report"
                      aria-expanded={false}
                      aria-label={t("Preview {title} ({candidateId})", {
                        title: group.candidate.title,
                        candidateId: group.candidate.id,
                      })}
                      onClick={() => select(report?.id || group.candidate.id)}
                    >
                      <span className="report-document-icon" aria-hidden="true">
                        <FileText size={20} />
                      </span>
                      <div className="compact-report-description">
                        <SeedOrigin ids={group.candidate.sourceSeedIds} />
                        <h3>{group.candidate.title}</h3>
                        <span>
                          {t(
                            group.candidate.sourceWallets.length === 1
                              ? "{count} wallet"
                              : "{count} wallets",
                            { count: group.candidate.sourceWallets.length },
                          )}
                        </span>
                        {report ? (
                          <OutcomeBadge outcome={report.outcome} />
                        ) : (
                          <span className="report-pending-status">
                            {t("Validation in progress")}
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
          </>
        ) : (
          <div className="empty report-empty">
            <FileText size={28} aria-hidden="true" />
            <strong>{t("No reports generated yet")}</strong>
            <p>
              {t("Each candidate can produce a report, whatever the outcome.")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
