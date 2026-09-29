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
import type { AlphaReport, Outcome } from "./types";
import "./report-cards.css";

const outcomeLabels: Record<Outcome, string> = {
  ACTIONABLE: "Actionable",
  MONITOR: "Monitor",
  REJECTED: "Rejected",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
};

function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  return (
    <span className={`report-outcome report-outcome-${outcome.toLowerCase()}`}>
      <span aria-hidden="true" />
      {outcomeLabels[outcome]}
    </span>
  );
}

function sampleLabel(report: AlphaReport) {
  const label = report.evidenceCountLabel || "historical executions";
  return report.historicalExecutionCount === 1
    ? label.replace(/s$/, "")
    : label;
}

function reportDate(value?: string, full = false) {
  if (!value) return "Not recorded";
  return (
    new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      ...(full ? { year: "numeric", hour: "2-digit", minute: "2-digit" } : {}),
      timeZone: "UTC",
    }) + (full ? " UTC" : "")
  );
}

function firstSentence(text: string) {
  return text.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || text;
}

/** Preview excerpts use the saved assessment, including its uncertainty. */
function findings(report: AlphaReport) {
  const stateFinding = report.currentState.items?.[0]?.value;
  const currentState = report.rawCurrentState
    ? `${report.rawCurrentState}${stateFinding ? ` — ${stateFinding}` : ""}`
    : report.currentState.summary;
  const conditions = report.executionConditions.items?.slice(0, 2);
  return [
    {
      title: "Mechanism",
      icon: Settings2,
      text: report.mechanism.summary,
    },
    {
      title: "Historical Evidence",
      icon: ChartNoAxesColumnIncreasing,
      text:
        report.historicalExecutionCount != null
          ? `${report.historicalExecutionCount} ${sampleLabel(report)} from ${report.sourceWallets.length} source wallet${report.sourceWallets.length === 1 ? "" : "s"}.`
          : report.historicalEvidence.summary,
    },
    {
      title: "Current State",
      icon: Database,
      text: currentState,
    },
    {
      title: "Execution Conditions",
      icon: Zap,
      text: conditions?.length
        ? `Verify: ${conditions.map((item) => item.value).join("; ")}.`
        : report.executionConditions.summary,
    },
  ];
}

export function AlphaReportPreview({
  report,
  featured = false,
  open,
}: {
  report: AlphaReport;
  featured?: boolean;
  open: (id: string) => void;
}) {
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
    const url = new URL(
      `/reports/${encodeURIComponent(report.id)}`,
      location.origin,
    );
    if (new URLSearchParams(location.search).get("mode") === "demo") {
      url.searchParams.set("mode", "demo");
    }
    setShareUrl(url.href);
    try {
      await navigator.clipboard.writeText(url.href);
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
                title={reportDate(report.lastCheckedAt, true)}
              >
                Checked {reportDate(report.lastCheckedAt)}
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
          {findings(report).map(({ title, icon: Icon, text }) => (
            <section
              className={`report-section-row section-${title.toLowerCase().replaceAll(" ", "-")}`}
              key={title}
            >
              <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
              <div>
                <h4>{title}</h4>
                <p title={text}>{text}</p>
              </div>
            </section>
          ))}
        </div>
      )}

      {!featured && (
        <dl className="report-evidence-strip">
          <div>
            <dt>Source wallets</dt>
            <dd>
              {report.sourceWallets.length} wallet
              {report.sourceWallets.length === 1 ? "" : "s"}
            </dd>
          </div>
          {report.historicalExecutionCount != null && (
            <div>
              <dt>{sampleLabel(report)}</dt>
              <dd>{report.historicalExecutionCount.toLocaleString("en-US")}</dd>
            </div>
          )}
          <div>
            <dt>Last checked</dt>
            <dd title={reportDate(report.lastCheckedAt, true)}>
              {report.lastCheckedAt ? (
                <time dateTime={report.lastCheckedAt}>
                  {reportDate(report.lastCheckedAt)}
                </time>
              ) : (
                "Not recorded"
              )}
            </dd>
          </div>
        </dl>
      )}

      <div className="report-preview-actions">
        <button className="report-open-button" onClick={() => open(report.id)}>
          <FileText size={15} aria-hidden="true" />
          Open Full Report
          {!featured && <ArrowRight size={14} aria-hidden="true" />}
        </button>
        {featured && (
          <button className="report-copy-button" onClick={copyLink}>
            {copyState === "copied" ? <Check size={14} /> : <Copy size={14} />}
            <span aria-live="polite">
              {copyState === "copied" ? "Copied" : "Copy link"}
            </span>
          </button>
        )}
      </div>
      {copyState === "failed" && (
        <label className="report-copy-fallback">
          Clipboard unavailable. Select and copy this report link:
          <input
            aria-label="Report link"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
          />
        </label>
      )}
    </article>
  );
}

export function AlphaReportList({
  reports,
  open,
}: {
  reports: AlphaReport[];
  open: (id: string) => void;
}) {
  // A saved selection survives polling; changing to a seed without it selects its first report.
  const sorted = [...reports].sort(
    (a, b) => Number(b.outcome === "MONITOR") - Number(a.outcome === "MONITOR"),
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(
    sorted[0]?.id,
  );
  const selected =
    sorted.find((report) => report.id === selectedId) || sorted[0];
  const contentRef = useRef<HTMLDivElement>(null);
  const focusSelection = useRef(false);
  useEffect(() => {
    if (focusSelection.current) {
      contentRef.current
        ?.querySelector<HTMLElement>(".featured h3")
        ?.focus({ preventScroll: true });
      focusSelection.current = false;
    }
  }, [selected?.id]);
  useEffect(() => {
    if (selected?.id !== selectedId) setSelectedId(selected?.id);
  }, [selected?.id, selectedId]);

  function selectReport(id: string) {
    focusSelection.current = true;
    setSelectedId(id);
    contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <section className="workspace-column report-column">
      <div className="column-heading">
        <span className="column-icon" aria-hidden="true">
          <FileText size={20} />
        </span>
        <h2>
          Alpha Reports <span>({reports.length})</span>
        </h2>
      </div>
      <p className="column-description">
        Human-readable research with evidence and clear outcomes.
      </p>
      <div className="column-content report-list-content" ref={contentRef}>
        {selected ? (
          <>
            <AlphaReportPreview
              key={selected.id}
              report={selected}
              featured
              open={open}
            />
            {sorted
              .filter((report) => report.id !== selected.id)
              .map((report) => (
                <article
                  className="report-preview compact-report-card"
                  key={report.id}
                  data-report-id={report.id}
                >
                  <button
                    className="compact-report"
                    aria-expanded={false}
                    aria-label={`Preview ${report.title} (${report.candidateId})`}
                    onClick={() => selectReport(report.id)}
                  >
                    <span className="report-document-icon" aria-hidden="true">
                      <FileText size={20} />
                    </span>
                    <div className="compact-report-description">
                      <h3>{report.title}</h3>
                      <span>
                        {report.sourceWallets.length === 1
                          ? `${report.sourceWallets[0].slice(0, 6)}…${report.sourceWallets[0].slice(-5)}`
                          : `${report.sourceWallets.length} wallets`}
                        {report.historicalExecutionCount != null &&
                          ` · ${report.historicalExecutionCount} ${sampleLabel(report)}`}
                      </span>
                      <OutcomeBadge outcome={report.outcome} />
                    </div>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </article>
              ))}
          </>
        ) : (
          <div className="empty report-empty">
            <FileText size={28} aria-hidden="true" />
            <strong>No reports generated yet</strong>
            <p>Each candidate can produce a report, whatever the outcome.</p>
          </div>
        )}
      </div>
    </section>
  );
}
