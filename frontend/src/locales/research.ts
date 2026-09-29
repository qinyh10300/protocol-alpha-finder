import chineseCatalog from "./research.zh.json" with { type: "json" };
import type {
  AlphaReport,
  EvidenceRef,
  ReportSection,
  Snapshot,
} from "../types";

export type ResearchLanguage = "en" | "zh";

// Source titles are translated for presentation only. Raw Skill artifacts retain
// their original text, and identifiers, evidence links and assessment codes stay intact.
const sourceTitles: Record<string, string> = {
  "同笔租赁—清算—归还组合": "Same-transaction Rental, Liquidation & Return",
  "借贷清算与抵押品赎回、兑换组合":
    "Lending Liquidation, Collateral Redemption & Swap",
  清算钱包的跨池循环兑换: "Cross-pool Round Trip by a Liquidation Wallet",
};
const chinese: Record<string, string> = {
  ...chineseCatalog,
  "USDD Auction Reset Reward": "USDD 拍卖重置奖励",
  "USDD Auction Purchase Path": "USDD 拍卖购买流程",
  "Synthetic USDD scenario data": "USDD 模拟场景数据",
  "Synthetic USDD wallet identifier and transaction count. This is not an observed on-chain executor.":
    "USDD 钱包标识和交易数量均为模拟值，并非实际观测到的链上执行者。",
  "Synthetic USDD demo · Wallet identifiers, transaction counts, auction states, outcomes and playback timestamps are illustrative. The saved real USDD scan remains a separate zero-result record.":
    "USDD 模拟演示 · 钱包标识、交易数量、拍卖状态、结果和回放时间均为示例。真实 USDD 搜寻的零结果记录独立保留。",

  "All seeds · Energy Rental and USDD use synthetic examples. JustLend uses recorded research. Playback does not start a new on-chain search.":
    "全部种子 · Energy Rental 和 USDD 使用模拟示例，JustLend 使用已保存的研究记录。回放不会发起新的链上搜寻。",
  "Recorded research replay · Saved Skill evidence; see the recorded window and report check times. Playback timing is simulated; no new on-chain search is performed.":
    "历史研究回放 · 使用已保存的 Skill 证据，时间范围和核查时间见页面及报告。播放节奏为模拟，不会发起新的链上搜寻。",
  "Published Skill snapshot": "已发布的 Skill 研究快照",
};
const english = Object.fromEntries(
  Object.entries(chinese).map(([en, zh]) => [zh, en]),
);
const chineseTitles = Object.fromEntries(
  Object.entries(sourceTitles).map(([zh, en]) => [en, zh]),
);

/** Translate known narrative text without changing unknown evidence or status codes. */
export function localizeResearchText(
  text: string,
  language: ResearchLanguage,
): string {
  if (language === "en") {
    if (english[text]) return english[text];
    for (const [zh, en] of Object.entries(sourceTitles)) {
      if (text === zh) return en;
      if (text.startsWith(`${zh} · `)) return en + text.slice(zh.length);
    }
    return text;
  }
  if (chinese[text]) return chinese[text];
  if (chineseTitles[text]) return chineseTitles[text];
  // Activity messages combine an exact translated title with a preserved ID or
  // outcome code. Do not translate by replacing arbitrary fragments of evidence.
  const parts = text.split(" · ");
  if (parts.length === 2 && (chinese[parts[0]] || chineseTitles[parts[0]])) {
    return `${chinese[parts[0]] || chineseTitles[parts[0]]} · ${parts[1]}`;
  }
  const match = (pattern: RegExp) => text.match(pattern);
  let values: RegExpMatchArray | null;
  if (
    (values = match(
      /^(\d+) bounded provider queries completed\. Empty indexes do not prove absence from the whole chain\.$/,
    ))
  ) {
    return `已完成 ${values[1]} 次有范围限制的数据服务查询。索引为空不能证明全链不存在相关活动。`;
  }
  if (
    (values = match(
      /^(\d+) historical samples reconciled for this candidate\. This count is not the full strategy execution volume\.$/,
    ))
  ) {
    return `已为该候选核对 ${values[1]} 个历史样本。该数量并不代表策略的全部执行次数。`;
  }
  if (
    (values = match(
      /^(\d+) reconstructed historical executions across (\d+) source wallets\.$/,
    ))
  ) {
    return `已重建 ${values[2]} 个来源钱包中的 ${values[1]} 次历史执行。`;
  }
  if (
    (values = match(
      /^(\d+) historical executions (?:across|from) (\d+) source wallets?\.$/,
    ))
  ) {
    return `${values[2]} 个来源钱包共有 ${values[1]} 次历史执行。`;
  }
  if ((values = match(/^Verified executor (\S+)$/))) {
    return `已验证的执行者 ${values[1]}`;
  }
  if ((values = match(/^([\d,]+) primary transactions retained for (\S+)$/))) {
    return `已为 ${values[2]} 保留 ${values[1]} 笔主交易记录`;
  }
  if (
    (values = match(/^(\d+) seed coverage records · (\d+) verified wallets$/))
  ) {
    return `${values[1]} 项种子覆盖记录 · ${values[2]} 个已验证钱包`;
  }
  if (
    (values = match(
      /^(\d+) histories · ([\d,]+) unique primary transactions · (\d+) candidates$/,
    ))
  ) {
    return `${values[1]} 份历史记录 · ${values[2]} 笔去重主交易 · ${values[3]} 个候选`;
  }
  if (
    (values = match(
      /^(\d+) assessments · mechanism, history, current state and execution conditions$/,
    ))
  ) {
    return `${values[1]} 项评估 · 机制、历史、当前状态与执行条件`;
  }
  if ((values = match(/^(Step|Evidence|Finding|Condition) (\d+)$/))) {
    const labels: Record<string, string> = {
      Step: "步骤",
      Evidence: "证据",
      Finding: "发现",
      Condition: "条件",
    };
    return `${labels[values[1]]} ${values[2]}`;
  }
  if ((values = match(/^(\S+) · block (\d+) · (\S+)$/))) {
    return `${values[1]} · 区块 ${values[2]} · ${values[3]}`;
  }
  if ((values = match(/^(\S+) · Last checked (\S+)$/))) {
    return `${values[1]} · 上次检查 ${values[2]}`;
  }
  if (
    (values = match(/^Borrower (\S+): shortfall (\S+) \(raw\), error (\S+)\.$/))
  ) {
    return `借款人 ${values[1]}：资金缺口 ${values[2]}（原始值），错误码 ${values[3]}。`;
  }
  if (
    (values = match(
      /^Minimum reward: (\S+) TRX; rent paused: (\S+)\. A parameter read does not establish an eligible target\.$/,
    ))
  ) {
    return `最低奖励：${values[1]} TRX；租赁暂停状态：${values[2]}。读取参数不能证明存在符合条件的目标。`;
  }
  if (
    (values = match(
      /^Sample (\S+): historical transfer delta (\S+) WTRX; checked quote gross delta (\S+) WTRX\. Fees and failed attempts are not deducted\.$/,
    ))
  ) {
    return `样本 ${values[1]}：历史转账余额差 ${values[2]} WTRX；已检查报价的未扣成本差额 ${values[3]} WTRX。尚未扣除费用与失败尝试成本。`;
  }
  if (
    (values = match(
      /^Read blocks: ([\d–]+); supplement: ([\d–]+)\. Sequential latest-state reads bracketed by these blocks, not atomic or historical block-pinned calls\.$/,
    ))
  ) {
    return `读取区块：${values[1]}；补充读取：${values[2]}。这些区块范围内按顺序读取最新状态，并非原子读取或固定历史区块调用。`;
  }
  return text;
}

function evidence(ref: EvidenceRef, language: ResearchLanguage): EvidenceRef {
  return {
    ...ref,
    ...(ref.title ? { title: localizeResearchText(ref.title, language) } : {}),
  };
}
function section(
  value: ReportSection,
  language: ResearchLanguage,
): ReportSection {
  const t = (text: string) => localizeResearchText(text, language);
  return {
    ...value,
    summary: t(value.summary),
    ...(value.items
      ? {
          items: value.items.map((item) => ({
            label: t(item.label),
            value: t(item.value),
          })),
        }
      : {}),
  };
}

export function localizeReport(
  report: AlphaReport,
  language: ResearchLanguage,
): AlphaReport {
  const t = (text: string) => localizeResearchText(text, language);
  return {
    ...report,
    title: t(report.title),
    executiveSummary: t(report.executiveSummary),
    mechanism: section(report.mechanism, language),
    historicalEvidence: section(report.historicalEvidence, language),
    currentState: section(report.currentState, language),
    executionConditions: section(report.executionConditions, language),
    evidenceRefs: report.evidenceRefs.map((ref) => evidence(ref, language)),
    ...(report.outcomeReason ? { outcomeReason: t(report.outcomeReason) } : {}),
    ...(report.missingEvidence
      ? { missingEvidence: report.missingEvidence.map(t) }
      : {}),
    ...(report.nextChecks ? { nextChecks: report.nextChecks.map(t) } : {}),
    ...(report.alternativeExplanations
      ? { alternativeExplanations: report.alternativeExplanations.map(t) }
      : {}),
  };
}

export function localizeSnapshot(
  snapshot: Snapshot,
  language: ResearchLanguage,
): Snapshot {
  const t = (text: string) => localizeResearchText(text, language);
  return {
    ...snapshot,
    seeds: snapshot.seeds.map((seed) => ({
      ...seed,
      name: t(seed.name),
      ...(seed.description ? { description: t(seed.description) } : {}),
      ...(seed.coverage ? { coverage: t(seed.coverage) } : {}),
      ...(seed.gaps ? { gaps: seed.gaps.map(t) } : {}),
    })),
    wallets: snapshot.wallets.map((wallet) => ({
      ...wallet,
      ...(wallet.coverageNote ? { coverageNote: t(wallet.coverageNote) } : {}),
      ...(wallet.evidenceRefs
        ? {
            evidenceRefs: wallet.evidenceRefs.map((ref) =>
              evidence(ref, language),
            ),
          }
        : {}),
      historyJob: {
        ...wallet.historyJob,
        ...(wallet.historyJob.error
          ? { error: t(wallet.historyJob.error) }
          : {}),
      },
      analysisJob: {
        ...wallet.analysisJob,
        ...(wallet.analysisJob.error
          ? { error: t(wallet.analysisJob.error) }
          : {}),
      },
      alphaSearchJob: {
        ...wallet.alphaSearchJob,
        ...(wallet.alphaSearchJob.error
          ? { error: t(wallet.alphaSearchJob.error) }
          : {}),
      },
    })),
    candidates: snapshot.candidates.map((candidate) => ({
      ...candidate,
      title: t(candidate.title),
      summary: t(candidate.summary),
    })),
    reports: snapshot.reports.map((report) => localizeReport(report, language)),
    skills: snapshot.skills.map((skill) => ({
      ...skill,
      name: t(skill.name),
      summary: t(skill.summary),
    })),
    activity: snapshot.activity.map((event) => ({
      ...event,
      message: t(event.message),
    })),
    ...(snapshot.note ? { note: t(snapshot.note) } : {}),
  };
}
