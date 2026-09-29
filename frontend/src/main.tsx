import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  FlaskConical,
  Layers3,
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
  Search,
  Share2,
  Wallet,
  Users,
  Files,
  X,
  Bookmark,
  Eye,
  CircleHelp,
} from "lucide-react";
import { ApiResearchDataSource, MockResearchDataSource } from "./data";
import {
  currentMode,
  currentPath,
  currentSeed,
  isPagesBuild,
  routeUrl,
} from "./routing";
import { DEFAULT_DEMO_SEED } from "./seeds";
import type {
  AlphaCandidate,
  AlphaReport,
  EvidenceRef,
  JobState,
  Outcome,
  ReportSection,
  Snapshot,
  StrategyWallet,
} from "./types";
import "./style.css";
import { AlphaReportList, AlphaReportPreview } from "./ReportCards";

import { LanguageProvider, useI18n } from "./i18n";
import { localizeSnapshot, localizeReport } from "./locales/research";

const api = new ApiResearchDataSource();
const demo = new MockResearchDataSource();
const fmt = (n: number) => n.toLocaleString("en-US");
const short = (s: string) =>
  s.length > 18 ? `${s.slice(0, 7)}…${s.slice(-6)}` : s;
const date = (s?: string, locale = "en-GB") =>
  s
    ? new Date(s).toLocaleString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }) + " UTC"
    : "Not recorded";
const day = (s: string, locale = "en-GB") =>
  new Date(s).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const label = (s: string) =>
  ({
    report_ready: "Report ready",
    INSUFFICIENT_EVIDENCE: "Insufficient evidence",
    MONITOR: "Monitor",
    ACTIONABLE: "Actionable",
    REJECTED: "Rejected",
    completed: "Completed",
    running: "Running",
    queued: "Queued",
    failed: "Failed",
    idle: "Ready",
    paused: "Paused",
    discovered: "Discovered",
    validating: "Validating",
  })[s] || s;
function StatusChip({ status }: { status: string }) {
  const { t } = useI18n();

  return (
    <span className={`chip status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {t(label(status))}
    </span>
  );
}
function PipelineStatus({ wallet }: { wallet: StrategyWallet }) {
  const { t } = useI18n();

  return (
    <div className="pipeline">
      {(
        [
          [t("History"), wallet.historyJob],
          [t("Analyze"), wallet.analysisJob],
          [t("Search Alpha"), wallet.alphaSearchJob],
        ] as [string, JobState][]
      ).map(([title, job]) => (
        <div
          key={title}
          className={`pipeline-step ${job.status}`}
          title={job.error || `${t(title)}: ${t(label(job.status))}`}
        >
          <div className="step-track">
            <span>
              {job.status === "completed" ? (
                <Check size={10} />
              ) : job.status === "failed" ? (
                <X size={10} />
              ) : null}
            </span>
          </div>
          <small>{t(title)}</small>
          <span className="sr-only">{t(label(job.status))}</span>
        </div>
      ))}
    </div>
  );
}
function Empty({
  title,
  text,
  loading = false,
}: {
  title: string;
  text: string;
  loading?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="empty">
      {loading ? (
        <LoaderCircle className="spin" size={24} />
      ) : (
        <Layers3 size={26} />
      )}
      <strong>{t(title)}</strong>
      <p>{t(text)}</p>
    </div>
  );
}
function EvidenceLink({ e }: { e: EvidenceRef }) {
  const name = e.title || short(e.txHash || e.address || String(e.blockNumber));
  const url =
    e.url && (/^https?:\/\//.test(e.url) || e.url.startsWith("/api/artifacts/"))
      ? e.url
      : undefined;
  return url ? (
    <a className="evidence-link" href={url} target="_blank" rel="noreferrer">
      <FileText size={15} />
      <span>{name}</span>
      <ExternalLink size={13} />
    </a>
  ) : (
    <span className="evidence-link">{name}</span>
  );
}
function AppHeader({
  path,
  navigate,
  mode,
  setMode,
}: {
  path: string;
  navigate: (s: string) => void;
  mode: string;
  setMode: (s: "archive" | "demo") => void;
}) {
  const { t } = useI18n();

  return (
    <header className="app-header">
      <a
        className="brand"
        href={routeUrl("/research")}
        onClick={(e) => {
          e.preventDefault();
          navigate("/research");
        }}
      >
        <svg
          className="brand-mark"
          viewBox="0 0 56 54"
          fill="none"
          aria-hidden="true"
        >
          <path d="M28 2 55 50H42L28 25 14 50H1L28 2Z" fill="currentColor" />
          <path d="M28 15 48 50H38L28 32 18 50H8L28 15Z" fill="white" />
          <path
            d="M28 29 40 50H16L21 41H27L24 46H32L26 35Z"
            fill="currentColor"
          />
          <path d="M4 44H15L11 51H0L4 44Z" fill="currentColor" />
        </svg>
        <span>
          <strong>Protocol Alpha Finder</strong>
          <small>{t("AI-assisted protocol alpha research")}</small>
        </span>
      </a>
      <nav aria-label={t("Main navigation")}>
        <button
          className={path === "/research" ? "active" : ""}
          onClick={() => navigate("/research")}
        >
          {t("Research")}
        </button>
        <button
          className={path.startsWith("/reports") ? "active" : ""}
          onClick={() => navigate("/reports")}
        >
          {t("Reports")}
        </button>
      </nav>
      <div className="header-controls">
        <label className="mode-select">
          <span className={`status-dot ${mode}`} />
          <select
            aria-label={t("Data mode")}
            value={mode}
            onChange={(e) => setMode(e.target.value as "archive" | "demo")}
          >
            {!isPagesBuild && (
              <option value="archive">{t("Skill results")}</option>
            )}
            <option value="demo">{t("Demo mode")}</option>
          </select>
          <ChevronDown size={14} />
        </label>
      </div>
    </header>
  );
}
function ResearchRunSummary({
  data,
  seedId,
  changeSeed,
  refresh,
  busy,
  activity,
  play,
  pause,
}: {
  data: Snapshot;
  seedId: string;
  changeSeed: (s: string) => void;
  refresh: () => void;
  busy: boolean;
  activity: () => void;
  play: () => void;
  pause: () => void;
}) {
  const { t, locale } = useI18n();

  const run = data.run;
  const selectedSeed = data.seeds.find((seed) => seed.id === run.seedId);
  return (
    <section className="run-summary" aria-label={t("Research run summary")}>
      <div className="summary-top">
        <div className="seed-object">
          <span className="object-icon seed-icon">
            <FileText size={26} />
          </span>
          <div>
            <span className="summary-label">{t("Current Seed")}</span>
            <label className="seed-select">
              <select
                aria-label={t("Research seed")}
                value={seedId}
                onChange={(e) => changeSeed(e.target.value)}
              >
                {data.seeds.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} />
            </label>
            <p>
              {data.mode === "archive"
                ? t("TRON · Known protocol alpha")
                : t("{protocol} · Synthetic demo seed", {
                    protocol: selectedSeed?.protocol || "TRON",
                  })}
            </p>
          </div>
        </div>
        <ArrowRight className="summary-arrow" size={22} />
        <div className="summary-count">
          <span className="object-icon wallet-icon">
            <Users size={25} />
          </span>
          <div>
            <strong>{run.walletCount}</strong>
            <span>{t("Strategy Wallets")}</span>
            <small>{t("identified from seed")}</small>
          </div>
        </div>
        <ArrowRight className="summary-arrow" size={22} />
        <div className="summary-count">
          <span className="object-icon candidate-icon">
            <Files size={25} />
          </span>
          <div>
            <strong>{run.candidateCount}</strong>
            <span>{t("Alpha Candidates")}</span>
            <small>{t("discovered")}</small>
          </div>
        </div>
        <ArrowRight className="summary-arrow" size={22} />
        <div className="summary-count">
          <span className="object-icon report-icon">
            <FileText size={25} />
          </span>
          <div>
            <strong>{run.reportCount}</strong>
            <span>{t("Alpha Reports")}</span>
            <small>{t("ready for review")}</small>
          </div>
        </div>
        <div className="run-control">
          <StatusChip status={run.status} />
          {data.mode === "demo" ? (
            <button
              className="primary small"
              onClick={
                run.status === "running" || run.status === "paused"
                  ? pause
                  : play
              }
            >
              {run.status === "running" ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
              {run.status === "running"
                ? t("Pause demo")
                : run.status === "paused"
                  ? t("Resume demo")
                  : run.status === "completed"
                    ? t("Replay Demo")
                    : t("Run Discovery")}
            </button>
          ) : (
            <button
              className="secondary small"
              onClick={refresh}
              disabled={busy}
            >
              <RefreshCw size={14} className={busy ? "spin" : ""} />
              {t("Refresh results")}
            </button>
          )}
        </div>
      </div>
      <div className="summary-bottom">
        <div>
          <span className="tiny-dot" />
          {data.mode === "archive" ? t("Saved Skill run") : t("Demo replay")}
          <span className="divider" />{" "}
          <strong>{fmt(run.loadedTransactionCount)}</strong>{" "}
          {t("primary tx loaded")}
          {data.window && (
            <>
              <span className="divider" />
              <span className="date-range">
                {day(data.window.from, locale)} – {day(data.window.to, locale)}
              </span>
            </>
          )}
        </div>
        <button className="text-button" onClick={activity}>
          <Activity size={14} />
          {t("View run activity")}
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}
function WalletInvestigationRow({
  wallet,
  index,
  selected,
  onClick,
}: {
  wallet: StrategyWallet;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();

  const [copied, setCopied] = useState(false);
  const jobs = [wallet.historyJob, wallet.analysisJob, wallet.alphaSearchJob];
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);
  return (
    <article className={`wallet-row ${selected ? "selected" : ""}`}>
      <button
        className="wallet-details-hit"
        onClick={onClick}
        aria-label={t("Investigate wallet {address}", {
          address: wallet.address,
        })}
      />
      <span className="row-index">{index + 1}</span>
      <div className="wallet-job">
        <div className="wallet-result">
          <div className="wallet-identity">
            <div>
              <span className="wallet-address" title={wallet.address}>
                {wallet.address.length > 10
                  ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`
                  : wallet.address}
              </span>
              <button
                className="copy-wallet"
                aria-label={t("Copy address {address}", {
                  address: wallet.address,
                })}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(wallet.address);
                    setCopied(true);
                  } catch {
                    onClick();
                  }
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <span className="wallet-volume">
              {wallet.historyJob.txCount == null
                ? t("History pending")
                : t("{count} tx", { count: fmt(wallet.historyJob.txCount) })}
            </span>
          </div>
          <span
            className={
              wallet.candidateIds.length ? "candidate-count" : "zero-count"
            }
          >
            {t(
              wallet.candidateIds.length === 1
                ? "{count} candidate"
                : "{count} candidates",
              { count: wallet.candidateIds.length },
            )}
          </span>
        </div>
        <PipelineStatus wallet={wallet} />
      </div>
      <ChevronRight className="wallet-chevron" size={16} />
      {jobs.find((j) => j.error)?.error && (
        <p className="error-text">{jobs.find((j) => j.error)?.error}</p>
      )}
    </article>
  );
}
function WalletInvestigationList({
  data,
  wallet,
  choose,
}: {
  data: Snapshot;
  wallet: string | null;
  choose: (w: StrategyWallet) => void;
}) {
  const { t } = useI18n();

  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setExpanded(false);
  }, [data.run.id]);
  const visible = expanded ? data.wallets : data.wallets.slice(0, 6);
  return (
    <section className="workspace-column wallet-column">
      <div className="column-heading">
        <span className="column-icon">
          <Wallet size={22} />
        </span>
        <h2>
          {t("Wallet Investigations")} <span>({data.wallets.length})</span>
        </h2>
      </div>
      <p className="column-description">
        {t("Each strategy wallet is investigated as a separate research job.")}
      </p>
      <div className="column-content wallet-list">
        {visible.length ? (
          visible.map((w, i) => (
            <WalletInvestigationRow
              key={w.address}
              wallet={w}
              index={i}
              selected={wallet === w.address}
              onClick={() => choose(w)}
            />
          ))
        ) : (
          <Empty
            title={
              data.run.status === "running"
                ? t("Discovering executors")
                : t("No executors found")
            }
            text={
              data.run.status === "idle"
                ? t("Run Discovery to begin the wallet investigation.")
                : t("No verified wallets for this seed in the recorded window.")
            }
            loading={data.run.status === "running"}
          />
        )}
      </div>
      <div className="wallet-list-footer">
        {data.wallets.length > 6 && (
          <button
            className="show-more-wallets"
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDown size={16} className={expanded ? "rotate" : ""} />
            {expanded
              ? t("Show fewer wallets")
              : t("Show {count} more wallets", {
                  count: data.wallets.length - 6,
                })}
          </button>
        )}
      </div>
    </section>
  );
}
function AlphaCandidateCard({
  candidate: c,
  index,
  open,
  sources,
}: {
  candidate: AlphaCandidate;
  index: number;
  open: (id: string) => void;
  sources: () => void;
}) {
  const { t } = useI18n();

  return (
    <article className="candidate-card">
      <div className="candidate-top">
        <span className="row-index">{index + 1}</span>
        <div className="candidate-title">
          <h3 title={c.id}>{c.title}</h3>
          <StatusChip status={c.status} />
        </div>
      </div>
      <div className="candidate-evidence">
        <span>
          {t(
            c.sourceWallets.length === 1
              ? "Found from {count} wallet"
              : "Found from {count} wallets",
            { count: c.sourceWallets.length },
          )}
        </span>
        {c.historicalExecutionCount != null && (
          <span>
            {c.historicalExecutionCount}{" "}
            {t(
              c.historicalExecutionCount === 1
                ? (c.evidenceCountLabel || "historical executions").replace(
                    /s$/,
                    "",
                  )
                : c.evidenceCountLabel || "historical executions",
            )}
          </span>
        )}
      </div>
      <p className="card-summary">{c.summary}</p>
      <div className="candidate-facts">
        <div>
          <span>{t("Source Wallets")}</span>
          <strong>
            {t(
              c.sourceWallets.length === 1
                ? "{count} wallet"
                : "{count} wallets",
              { count: c.sourceWallets.length },
            )}
          </strong>
        </div>
        <div>
          <span>
            {c.evidenceCountLabel === "reconciled samples"
              ? t("Reconciled Samples")
              : t("Historical Executions")}
          </span>
          <strong>
            {c.historicalExecutionCount == null
              ? t("Pending")
              : t(
                  c.evidenceCountLabel === "reconciled samples"
                    ? c.historicalExecutionCount === 1
                      ? "{count} sample"
                      : "{count} samples"
                    : c.historicalExecutionCount === 1
                      ? "{count} execution"
                      : "{count} executions",
                  { count: c.historicalExecutionCount },
                )}
          </strong>
        </div>
        <div>
          <span>{t("Report")}</span>
          <strong className={c.reportId ? "report-available" : ""}>
            {c.reportId
              ? t("Ready")
              : c.status === "validating"
                ? t("In progress")
                : t("Pending")}
          </strong>
        </div>
      </div>
      <div className="card-actions">
        {c.reportId ? (
          <button
            className="secondary report-link"
            onClick={() => open(c.reportId!)}
          >
            <FileText size={15} />
            {t("Open Report")}
          </button>
        ) : (
          <span className="pending-report">
            {c.status === "validating"
              ? t("Validation in progress")
              : t("Awaiting validation")}
          </span>
        )}
        <button className="text-button" onClick={sources}>
          {t("View evidence")}
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}
function AlphaCandidateList({
  data,
  candidates,
  open,
  sources,
  clear,
}: {
  data: Snapshot;
  candidates: AlphaCandidate[];
  open: (id: string) => void;
  sources: (c: AlphaCandidate) => void;
  clear?: () => void;
}) {
  const { t } = useI18n();

  const [sort, setSort] = useState("discovery");
  const sorted = [...candidates].sort((a, b) =>
    sort === "newest"
      ? b.createdAt.localeCompare(a.createdAt)
      : sort === "evidence"
        ? (b.historicalExecutionCount ?? -1) -
          (a.historicalExecutionCount ?? -1)
        : 0,
  );
  return (
    <section className="workspace-column candidate-column">
      <div className="column-heading">
        <span className="column-icon">
          <Files size={22} />
        </span>
        <h2>
          {t("Alpha Candidates")} <span>({candidates.length})</span>
        </h2>
      </div>
      <p className="column-description">
        {t("Protocol opportunities discovered from wallet investigations.")}
      </p>
      <div className="candidate-toolbar">
        <label>
          {t("Sort by:")}{" "}
          <select
            aria-label={t("Sort candidates")}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="discovery">{t("Discovery order")}</option>
            <option value="newest">{t("Newest first")}</option>
            <option value="evidence">{t("Evidence count")}</option>
          </select>
          <ChevronDown size={13} />
        </label>
        {clear && (
          <button className="filter-chip" onClick={clear}>
            {t("Filtered by wallet")}
            <X size={12} />
          </button>
        )}
      </div>
      <div className="column-content">
        {sorted.length ? (
          sorted.map((c, i) => (
            <AlphaCandidateCard
              key={c.id}
              candidate={c}
              index={i}
              open={open}
              sources={() => sources(c)}
            />
          ))
        ) : (
          <Empty
            title={t("No candidates yet")}
            text={
              data.run.status === "running"
                ? t("Wallet investigations are still running.")
                : t("No Protocol Alpha Candidates found in this selection.")
            }
          />
        )}
      </div>
    </section>
  );
}

function Drawer({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button, a[href], select, input, [tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", listener);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="drawer-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        ref={ref}
      >
        <div className="drawer-heading">
          <h2 id="drawer-title">{t(title)}</h2>
          <button
            className="icon-button"
            onClick={close}
            aria-label={t("Close drawer")}
          >
            <X size={20} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}
function ResearchActivityDrawer({
  data,
  close,
  open,
}: {
  data: Snapshot;
  close: () => void;
  open: (id: string) => void;
}) {
  const { t, locale } = useI18n();

  return (
    <Drawer title={t("Research run activity")} close={close}>
      <p className="drawer-note">
        {data.mode === "archive"
          ? t(
              "Reconstructed from saved stage artifacts. Times below are artifact timestamps, not individual wallet execution times.",
            )
          : t("Synthetic demo events from the mock payload.")}
      </p>
      <h3>{t("Skill workflow")}</h3>
      <div className="skill-stages">
        {data.skills.map((s) => (
          <article key={s.id}>
            <div className="inline-between">
              <strong>{s.name}</strong>
              <StatusChip status={s.status} />
            </div>
            <code>{s.id}</code>
            <p>{s.summary}</p>
            <small>{t(date(s.completedAt, locale))}</small>
            <div className="inline-links">
              <a href={s.sourceUrl} target="_blank" rel="noreferrer">
                {t("Read Skill report")}
                <ExternalLink size={12} />
              </a>
              <a href={s.artifactUrl} target="_blank" rel="noreferrer">
                {t("JSON handoff")}
                <ExternalLink size={12} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <h3>
        {t("Recorded activity")}{" "}
        <span className="muted">{data.activity.length}</span>
      </h3>
      <ol className="timeline">
        {data.activity.map((e) => (
          <li key={e.id}>
            <time>{t(date(e.timestamp, locale))}</time>
            <p>{e.message}</p>
            {e.skill && <small>{e.skill}</small>}
            {e.entityType === "report" && e.entityId ? (
              <button className="text-button" onClick={() => open(e.entityId!)}>
                {t("Open Report")}
                <ArrowRight size={12} />
              </button>
            ) : (
              e.sourceUrl && (
                <a href={e.sourceUrl} target="_blank" rel="noreferrer">
                  {t("Source artifact ↗")}
                </a>
              )
            )}
          </li>
        ))}
      </ol>
      {!data.activity.length && (
        <p className="muted">{t("Activity appears when discovery starts.")}</p>
      )}
    </Drawer>
  );
}
function Section({
  id,
  number,
  title,
  section,
}: {
  id: string;
  number: string;
  title: string;
  section: ReportSection;
}) {
  return (
    <section className="memo-section" id={id}>
      <h2>
        <span>{number}</span>
        {title}
      </h2>
      <p>{section.summary}</p>
      {section.items?.map((item, i) => (
        <div className="memo-item" key={i}>
          <span>{item.label}</span>
          <p>{item.value}</p>
        </div>
      ))}
    </section>
  );
}
function AlphaReportPage({
  report: r,
  navigate,
  mode,
  toast,
}: {
  report: AlphaReport;
  navigate: (s: string) => void;
  mode: string;
  toast: (s: string) => void;
}) {
  const { t, locale } = useI18n();

  const key = `paf:${mode}:${r.id}`;
  const stored = (suffix: string) => {
    try {
      return localStorage.getItem(key + suffix) === "true";
    } catch {
      return false;
    }
  };
  const [saved, setSaved] = useState(() => stored(":saved"));
  const [watched, setWatched] = useState(() => stored(":watch"));
  function toggle(kind: "saved" | "watch") {
    const next = kind === "saved" ? !saved : !watched;
    try {
      localStorage.setItem(key + ":" + kind, String(next));
      if (kind === "saved") setSaved(next);
      else setWatched(next);
      toast(
        kind === "watch"
          ? next
            ? "Added to your local watchlist. Automatic checks are not configured."
            : "Removed from your local watchlist."
          : next
            ? "Report bookmarked on this browser."
            : "Bookmark removed.",
      );
    } catch {
      toast("Browser storage is unavailable. Export the report instead.");
    }
  }
  function exportReport() {
    const text = [
      `# ${r.title}`,
      `${t("Outcome")}: ${t(label(r.outcome))}\n${t("Candidate")}: ${r.candidateId}\n${t("Last checked")}: ${t(date(r.lastCheckedAt, locale))}\n${t("Data mode")}: ${t(mode === "demo" ? "Demo mode" : "Skill results")}`,
      `## ${t("Executive Summary")}\n${r.executiveSummary}`,
      r.outcomeReason || "",
      ...(
        [
          "mechanism",
          "historicalEvidence",
          "currentState",
          "executionConditions",
        ] as const
      ).map(
        (k) =>
          `## ${t({ mechanism: "Mechanism", historicalEvidence: "Historical Evidence", currentState: "Current State", executionConditions: "Execution Conditions" }[k])}\n${r[k].summary}\n${r[k].items?.map((x) => `- ${x.label}: ${x.value}`).join("\n") || ""}`,
      ),
      `## ${t("Evidence gaps")}\n${r.missingEvidence?.map((x) => "- " + x).join("\n") || t("See report sections.")}`,
      `## ${t("Next checks")}\n${r.nextChecks?.map((x) => "- " + x).join("\n") || ""}`,
      `## ${t("Source wallets")}\n${r.sourceWallets.join("\n")}`,
      `## ${t("Sources")}\n${r.evidenceRefs.map((e) => `${e.title || e.txHash}: ${e.url?.startsWith("/") ? location.origin + e.url : e.url}`).join("\n")}`,
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="report-page">
      <button
        className="text-button back-link"
        onClick={() => navigate("/research")}
      >
        <ArrowLeft size={15} />
        {t("Back to research")}
      </button>
      <div className="report-page-heading">
        <div>
          <div className="eyebrow">
            {t("ALPHA RESEARCH REPORT")}
            <span> / {r.candidateId}</span>
          </div>
          <h1>{r.title}</h1>
          <div className="report-title-meta">
            <StatusChip status={r.outcome} />
            <span>
              {t("Last checked {date}", {
                date: t(date(r.lastCheckedAt, locale)),
              })}
            </span>
          </div>
        </div>
        <button className="secondary" onClick={exportReport}>
          <ArrowDownToLine size={16} />
          {t("Export report")}
        </button>
      </div>
      <div className="memo-layout">
        <aside className="report-toc">
          <span className="eyebrow">{t("IN THIS REPORT")}</span>
          {[
            t("Executive Summary"),
            t("Mechanism"),
            t("Historical Evidence"),
            t("Current State"),
            t("Execution Conditions"),
            t("Source Evidence"),
            t("Human Actions"),
          ].map((s, i) => (
            <a key={s} href={"#section-" + i}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {s}
            </a>
          ))}
          <div className="toc-note">
            <FileText size={20} />
            <p>
              {mode === "demo"
                ? t("Synthetic demo report")
                : t("Based on saved Skill evidence")}
            </p>
            <small>
              {t("Generated {date}", { date: date(r.generatedAt, locale) })}
            </small>
          </div>
        </aside>
        <article className="report-memo">
          <section className="executive-summary" id="section-0">
            <span className="eyebrow">{t("01 / EXECUTIVE SUMMARY")}</span>
            <p>{r.executiveSummary}</p>
            {r.outcomeReason && (
              <div className="outcome-explanation">
                <CircleHelp size={16} />
                <span>
                  <strong>
                    {t("Why {outcome}?", { outcome: t(label(r.outcome)) })}
                  </strong>{" "}
                  {r.outcomeReason} {t("Original Skill state:")}{" "}
                  <strong>{r.rawCurrentState}</strong>.
                </span>
              </div>
            )}
          </section>
          <Section
            id="section-1"
            number="02"
            title={t("Mechanism")}
            section={r.mechanism}
          />
          {r.alternativeExplanations?.length ? (
            <div className="memo-subsection">
              <h3>{t("Alternative explanations")}</h3>
              <ul>
                {r.alternativeExplanations.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Section
            id="section-2"
            number="03"
            title={t("Historical Evidence")}
            section={r.historicalEvidence}
          />
          <div className="memo-subsection">
            <h3>{t("Source wallets")}</h3>
            {r.sourceWallets.map((w) => (
              <p className="mono wrap" key={w}>
                {mode === "archive" ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://tronscan.org/#/address/${w}`}
                  >
                    {w} ↗
                  </a>
                ) : (
                  w
                )}
              </p>
            ))}
          </div>
          <Section
            id="section-3"
            number="04"
            title={t("Current State")}
            section={r.currentState}
          />
          <Section
            id="section-4"
            number="05"
            title={t("Execution Conditions")}
            section={r.executionConditions}
          />
          {r.missingEvidence?.length ? (
            <div className="evidence-gaps">
              <h3>{t("Evidence still needed")}</h3>
              <ul>
                {r.missingEvidence.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <section className="memo-section" id="section-5">
            <h2>
              <span>06</span>
              {t("Source Evidence")}
            </h2>
            <div className="source-grid">
              {r.evidenceRefs.map((e, i) => (
                <EvidenceLink key={i} e={e} />
              ))}
            </div>
            {!r.evidenceRefs.length && (
              <p>
                {t(
                  "No source links are included in this synthetic demo payload.",
                )}
              </p>
            )}
          </section>
          <section className="memo-section" id="section-6">
            <h2>
              <span>07</span>
              {t("Human Actions")}
            </h2>
            {r.nextChecks?.length ? (
              <ol className="next-checks">
                {r.nextChecks.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
            ) : (
              <p>
                {t(
                  "Review the conditions and supporting evidence before the next research pass.",
                )}
              </p>
            )}
            <div className="human-actions">
              <button className="primary" onClick={() => toggle("saved")}>
                <Bookmark size={15} />
                {saved ? t("Report saved") : t("Save Report")}
              </button>
              {["MONITOR", "ACTIONABLE"].includes(r.outcome) && (
                <button className="secondary" onClick={() => toggle("watch")}>
                  <Eye size={15} />
                  {watched
                    ? t("On local watchlist")
                    : t("Add to local watchlist")}
                </button>
              )}
              <button
                className="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(location.href);
                    toast(
                      isPagesBuild
                        ? "Report link copied."
                        : "Report link copied. This URL requires access to the local server.",
                    );
                  } catch {
                    toast(
                      "Clipboard unavailable. Copy the URL from the address bar.",
                    );
                  }
                }}
              >
                <Share2 size={15} />
                {t("Copy link")}
              </button>
            </div>
            <p className="action-note">
              {t(
                "Bookmarks and watchlists are saved in this browser. New discovery seeds require an established advantage; the saved research has not promoted any candidate.",
              )}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}

function App() {
  const { t, locale, language } = useI18n();

  const [path, setPath] = useState(currentPath);
  const [mode, setMode] = useState(currentMode);
  const [seedId, setSeedId] = useState(currentSeed);
  const [rawData, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [rawDrawer, setDrawer] = useState<
    "activity" | StrategyWallet | AlphaCandidate | null
  >(null);
  const [filterWallet, setFilterWallet] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [rawReport, setReport] = useState<AlphaReport | null>(null);
  const [reportError, setReportError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const data = useMemo(
    () => (rawData ? localizeSnapshot(rawData, language) : null),
    [rawData, language],
  );
  const report = useMemo(
    () => (rawReport ? localizeReport(rawReport, language) : null),
    [rawReport, language],
  );
  const drawer =
    !rawDrawer || rawDrawer === "activity"
      ? rawDrawer
      : "address" in rawDrawer
        ? data?.wallets.find((w) => w.address === rawDrawer.address) ||
          rawDrawer
        : data?.candidates.find((c) => c.id === rawDrawer.id) || rawDrawer;
  function navigate(next: string) {
    history.pushState({}, "", routeUrl(next, mode, seedId));
    setPath(next);
    setDrawer(null);
    window.scrollTo(0, 0);
  }
  function switchMode(next: "archive" | "demo") {
    setMode(next);
    setData(null);
    setReport(null);
    setError("");
    setDrawer(null);
    setFilterWallet(null);
    const nextSeed = next === "demo" ? DEFAULT_DEMO_SEED : "all";
    setSeedId(nextSeed);
    setPath("/research");
    history.pushState({}, "", routeUrl("/research", next, nextSeed));
  }
  useEffect(() => {
    const onPop = () => {
      setPath(currentPath());
      setMode(currentMode());
      setSeedId(currentSeed());
      setFilterWallet(null);
      setDrawer(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(id);
  }, [message]);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    setBusy(true);
    setError("");
    const source = mode === "demo" ? demo : api;
    if (mode === "demo") demo.selectSeed(seedId);
    const id = mode === "demo" ? `run-demo-${seedId}` : "local-" + seedId;
    const load = async () => {
      try {
        const result = await source.getSnapshot(id);
        if (active) {
          setData(result);
          setError("");
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) {
          setBusy(false);
          timer = setTimeout(load, mode === "demo" ? 250 : 5000);
        }
      }
    };
    void load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mode, seedId, revision]);
  const reportId = path.startsWith("/reports/")
    ? decodeURIComponent(path.slice(9))
    : null;
  useEffect(() => {
    setReport(null);
    setReportError("");
    if (!reportId) return;
    let active = true;
    (mode === "demo" ? demo : api)
      .getReport(reportId)
      .then((r) => {
        if (active) setReport(r);
      })
      .catch((e) => {
        if (active) setReportError(e.message);
      });
    return () => {
      active = false;
    };
  }, [reportId, mode]);
  useEffect(() => {
    document.title = `${report?.title || (path === "/reports" ? t("Reports") : t("Research"))} · Protocol Alpha Finder`;
  }, [path, report, language]);
  const openReport = (id: string) =>
    navigate("/reports/" + encodeURIComponent(id));
  const reports = data?.reports || [];
  const candidates = (data?.candidates || []).filter(
    (c) => !filterWallet || c.sourceWallets.includes(filterWallet),
  );
  const visibleReports = reports.filter(
    (r) => !filterWallet || r.sourceWallets.includes(filterWallet),
  );
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Address copied.");
    } catch {
      setMessage("Clipboard unavailable. Select the full address to copy.");
    }
  }
  return (
    <>
      <AppHeader
        path={path}
        navigate={navigate}
        mode={mode}
        setMode={switchMode}
      />
      <main
        className={path === "/research" ? "research-main" : "document-main"}
      >
        {mode === "demo" && (
          <div className="demo-banner">
            <FlaskConical size={15} />
            <strong>{t("Synthetic demo")}</strong>
            <span>
              {t(
                isPagesBuild
                  ? "Illustrative data and simulated job timing. Run Discovery to explore the demo."
                  : "Illustrative data and simulated job timing. Switch to Skill results for the recorded research.",
              )}
            </span>
          </div>
        )}
        {reportId ? (
          report ? (
            <AlphaReportPage
              key={mode + report.id}
              report={report}
              navigate={navigate}
              mode={mode}
              toast={setMessage}
            />
          ) : (
            <div className="page-state">
              <Empty
                loading={!reportError}
                title={
                  reportError ? t("Report unavailable") : t("Loading report")
                }
                text={
                  reportError || "Opening the evidence-backed research memo."
                }
              />
              <button
                className="secondary"
                onClick={() => navigate("/reports")}
              >
                {t("Back to reports")}
              </button>
            </div>
          )
        ) : (
          <>
            {path === "/reports" ? (
              <>
                <div className="page-heading">
                  <div className="heading-copy">
                    <span className="eyebrow">{t("RESEARCH LIBRARY")}</span>
                    <h1>{t("Alpha Reports")}</h1>
                    <p>
                      {t(
                        "Every candidate has a conclusion. Keep the evidence, whatever the outcome.",
                      )}
                    </p>
                  </div>
                  <span className="library-total">
                    {t("{count} reports", { count: reports.length })}
                  </span>
                </div>
                <div className="library-toolbar">
                  <label className="search-box">
                    <Search size={16} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("Search reports or candidate IDs")}
                      aria-label={t("Search reports")}
                    />
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    aria-label={t("Filter report outcome")}
                  >
                    <option value="all">{t("All outcomes")}</option>
                    {(
                      [
                        "ACTIONABLE",
                        "MONITOR",
                        "REJECTED",
                        "INSUFFICIENT_EVIDENCE",
                      ] as Outcome[]
                    ).map((x) => (
                      <option key={x} value={x}>
                        {t(label(x))}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <h1 className="sr-only">
                {t("Protocol Alpha Research Workspace")}
              </h1>
            )}
            {error && (
              <div className="error-banner" role="alert">
                <span>
                  <strong>{t("Could not refresh Skill results.")}</strong>{" "}
                  {t(error)}
                  {data && t(" The last loaded snapshot remains visible.")}
                </span>
                <button
                  className="secondary"
                  onClick={() => setRevision((r) => r + 1)}
                >
                  {t("Retry")}
                </button>
                <button
                  className="text-button"
                  onClick={() => switchMode("demo")}
                >
                  {t("Open Demo")}
                </button>
              </div>
            )}
            {!data && !error ? (
              <Empty
                loading
                title={t("Loading Skill research")}
                text="Reading saved wallet, investigation and validation handoffs…"
              />
            ) : (
              data &&
              (path === "/reports" ? (
                <>
                  <div className="library-grid">
                    {reports
                      .filter(
                        (r) =>
                          (outcome === "all" || r.outcome === outcome) &&
                          `${r.title} ${r.candidateId}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                      )
                      .map((r) => (
                        <AlphaReportPreview
                          key={r.id}
                          report={r}
                          open={openReport}
                        />
                      ))}
                  </div>
                  {!reports.some(
                    (r) =>
                      (outcome === "all" || r.outcome === outcome) &&
                      `${r.title} ${r.candidateId}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  ) && (
                    <Empty
                      title={t("No matching reports")}
                      text="Try another outcome or search term."
                    />
                  )}
                </>
              ) : (
                <>
                  <ResearchRunSummary
                    data={data}
                    seedId={seedId}
                    changeSeed={(id) => {
                      setSeedId(id);
                      setData(null);
                      setFilterWallet(null);
                      setDrawer(null);
                      setSearch("");
                      setOutcome("all");
                      history.pushState(
                        {},
                        "",
                        routeUrl("/research", mode, id),
                      );
                    }}
                    refresh={() => setRevision((r) => r + 1)}
                    busy={busy}
                    activity={() => setDrawer("activity")}
                    play={async () => {
                      await demo.createRun(seedId);
                      setRevision((r) => r + 1);
                    }}
                    pause={() => {
                      data.run.status === "paused"
                        ? demo.resume()
                        : demo.pause();
                      setRevision((r) => r + 1);
                    }}
                  />
                  {seedId === "usdd-keeper-auction" && mode === "archive" && (
                    <div className="coverage-note">
                      <CircleHelp size={17} />
                      <div>
                        <strong>
                          {t("USDD: zero verified executors in this window.")}
                        </strong>
                        <p>
                          {data.seeds.find((s) => s.id === seedId)?.coverage}
                        </p>
                        {data.seeds
                          .find((s) => s.id === seedId)
                          ?.gaps?.map((g) => (
                            <p key={g}>{g}</p>
                          ))}
                      </div>
                    </div>
                  )}
                  <div className="workspace-grid">
                    <WalletInvestigationList
                      data={data}
                      wallet={filterWallet}
                      choose={(w) => setDrawer(w)}
                    />
                    <AlphaCandidateList
                      data={data}
                      candidates={candidates}
                      open={openReport}
                      sources={(c) => setDrawer(c)}
                      clear={
                        filterWallet ? () => setFilterWallet(null) : undefined
                      }
                    />
                    <AlphaReportList
                      reports={visibleReports}
                      open={openReport}
                    />
                  </div>
                  <div className="workspace-note">
                    <CircleHelp size={14} />
                    <span>{data.note}</span>
                  </div>
                </>
              ))
            )}
          </>
        )}
      </main>
      <footer className="app-footer">
        <span>
          <span className="footer-mark">α</span>Protocol Alpha Finder
        </span>
        <span>
          {t("Known Alpha")}
          <ArrowRight size={11} />
          {t("Strategy Wallets")} <ArrowRight size={11} />
          {t("New Alpha")}
        </span>
        <span>{t("Evidence before opportunity.")}</span>
      </footer>
      {drawer === "activity" && data && (
        <ResearchActivityDrawer
          data={data}
          close={() => setDrawer(null)}
          open={openReport}
        />
      )}{" "}
      {drawer && drawer !== "activity" && "address" in drawer && (
        <Drawer title={t("Wallet investigation")} close={() => setDrawer(null)}>
          <span className="eyebrow">{t("STRATEGY WALLET")}</span>
          <div className="full-address">
            <code>{drawer.address}</code>
            <button
              className="icon-button"
              aria-label={t("Copy wallet address")}
              onClick={() => copy(drawer.address)}
            >
              <Copy size={16} />
            </button>
          </div>
          <PipelineStatus wallet={drawer} />
          <div className="detail-stat">
            <strong>
              {drawer.historyJob.txCount == null
                ? "—"
                : fmt(drawer.historyJob.txCount)}
            </strong>
            <span>{t("primary transactions loaded")}</span>
          </div>
          <h3>{t("Discovery provenance")}</h3>
          <p>
            {(drawer.sourceSeedIds || [drawer.sourceSeedId])
              .map((id) => data?.seeds.find((s) => s.id === id)?.name || id)
              .join(", ")}
          </p>
          <h3>{t("Observed history")}</h3>
          <p>
            {t(date(drawer.historyJob.fromTime, locale))} →{" "}
            {t(date(drawer.historyJob.toTime, locale))}
          </p>
          <p className="drawer-note">
            {drawer.coverageNote || t("Synthetic demo history.")}
          </p>
          <h3>{t("Produced candidates")}</h3>
          {drawer.candidateIds.length ? (
            drawer.candidateIds.map((id) => (
              <div className="linked-candidate" key={id}>
                <span>{id}</span>
                <p>{data?.candidates.find((c) => c.id === id)?.title}</p>
              </div>
            ))
          ) : (
            <p>
              {t(
                "No candidates produced. This wallet remains a valid observation.",
              )}
            </p>
          )}
          <button
            className="primary full-width"
            onClick={() => {
              setFilterWallet(drawer.address);
              setDrawer(null);
            }}
          >
            {t("Show related candidates")}
            <ArrowRight size={14} />
          </button>
          <h3>{t("Discovery evidence")}</h3>
          {drawer.evidenceRefs?.map((e, i) => (
            <EvidenceLink key={i} e={e} />
          ))}
        </Drawer>
      )}{" "}
      {drawer && drawer !== "activity" && "summary" in drawer && (
        <Drawer title={t("Candidate evidence")} close={() => setDrawer(null)}>
          <span className="eyebrow">{drawer.id}</span>
          <h2>{drawer.title}</h2>
          <p>{drawer.summary}</p>
          <StatusChip status={drawer.status} />
          <h3>{t("Source wallets")}</h3>
          {drawer.sourceWallets.map((w) => (
            <p key={w} className="mono wrap">
              {w}
            </p>
          ))}
          {drawer.validation && (
            <>
              <h3>{t("Validation assessment")}</h3>
              {Object.entries(drawer.validation).map(([k, v]) => (
                <div className="validation-row" key={k}>
                  <span>
                    {
                      (
                        {
                          mechanism: t("Mechanism"),
                          historicalEvidence: t("Historical evidence"),
                          currentState: t("Current state"),
                          executionConditions: t("Execution conditions"),
                        } as Record<string, string>
                      )[k]
                    }
                  </span>
                  <strong>{t(v)}</strong>
                </div>
              ))}
            </>
          )}
          <p className="drawer-note">
            {drawer.historicalExecutionCount ?? t("No")}{" "}
            {t(drawer.evidenceCountLabel || "historical executions")}
            {t(
              ". Candidate IDs stay separate even when wallets share a mechanism.",
            )}
          </p>
          {drawer.reportId && (
            <button
              className="primary full-width"
              onClick={() => openReport(drawer.reportId!)}
            >
              {t("Open Full Report")}
              <ArrowRight size={14} />
            </button>
          )}
        </Drawer>
      )}
      {message && (
        <div className="toast" role="status">
          <Check size={16} />
          {t(message)}
          <button
            aria-label={t("Dismiss notification")}
            onClick={() => setMessage("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);
