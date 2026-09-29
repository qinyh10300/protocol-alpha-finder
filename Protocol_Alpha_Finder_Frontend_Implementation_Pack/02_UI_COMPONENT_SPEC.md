# 02 — UI Component & Visual Spec

## 1. Visual language

Style: professional research workspace.

Characteristics:
- light background
- neutral grays
- restrained blue as primary action color
- green only for confirmed/actionable states
- amber for monitor/review states
- red only for rejected/error states
- minimal decorative illustration
- no category icon per Candidate
- no blockchain “neon cyber” aesthetic

The UI should feel credible enough for a researcher, not like a crypto marketing landing page.

---

## 2. Typography

Recommended:
- Inter, Geist, or system UI
- Page title: 28–32px / 600–700
- Section title: 18–20px / 600
- Card title: 16–18px / 600
- Body: 14–16px / 400–500
- Metadata: 12–13px

Do not create giant headline typography inside the workspace.

---

## 3. Spacing

Use an 8px grid.

Suggested:
- page padding: 24px
- column gap: 16px
- section gap: 16–24px
- card padding: 16px
- row height: 72–88px

Whitespace is intentional.

---

## 4. Main layout

Desktop-first Hackathon MVP.

Suggested width:
- min width 1280px
- optimized around 1440–1600px

Grid:

```text
Wallet Investigations: 37%
Alpha Candidates:      33%
Alpha Reports:         30%
```

On narrower screens:
- stack Reports below Candidates
- do not shrink text into unreadability

---

## 5. Header

Contains:
- product name: Protocol Alpha Finder
- subtitle: `AI-assisted protocol alpha research`
- tabs:
  - Research
  - Reports
- chain/network selector (optional)
- settings (optional)

No large sidebar required for MVP.

---

## 6. Research Run Summary

Component: `ResearchRunSummary`

Fields:
- seed name
- wallets found
- candidates discovered
- reports generated
- run status
- started_at / last_updated

Primary button when idle:
- `Run Discovery`

Secondary:
- `View run activity`
- `Replay Demo` (demo mode only)

---

## 7. WalletInvestigationList

Component hierarchy:

```text
WalletInvestigationList
  └─ WalletInvestigationRow[]
```

Row fields:
- shortened address
- tx count
- pipeline status:
  - History
  - Analyze
  - Search Alpha
- number of candidates
- overall job status

Use small connected dots/checks for the 3 stages.

Do not show irrelevant protocol names/tags next to wallet rows.

---

## 8. CandidateList

```text
AlphaCandidateList
  └─ AlphaCandidateCard[]
```

Card content:
- candidate title
- summary
- `Found from N wallets`
- `M historical executions`
- validation status
- report status
- actions:
  - `Open Report`
  - `View Sources` (optional)

No candidate icon unless it comes from a real protocol identity and helps recognition.
Default should be no icon.

---

## 9. Candidate validation status

Use concise status chips:

- gray: `DISCOVERED`
- blue: `VALIDATING`
- green: `REPORT READY`

Do not use “Potential High/Medium/Low”.

Outcome is shown on the Report, not used as a speculative pre-validation score.

---

## 10. ReportPreview

Fields:
- title
- outcome
- one-sentence executive summary
- source wallet count
- historical execution count
- last checked
- button `Open Full Report`

Outcome colors:
- ACTIONABLE: green
- MONITOR: amber
- REJECTED: muted red
- INSUFFICIENT_EVIDENCE: gray

All outcomes still represent a generated report.

---

## 11. FullReport

Dedicated page.

Layout:

```text
Report Header
Outcome + last checked

Executive Summary

Mechanism
Historical Evidence
Current State
Execution Conditions

Source Evidence
Human Actions
```

Prefer text + compact key-value rows.
Only add a chart if the report truly has a time-series that matters.

---

## 12. Activity Drawer

Hidden by default.

Component:
`ResearchRunActivityDrawer`

Event fields:
- timestamp
- event_type
- message
- related entity (wallet/candidate/report)
- optional source ref

Purpose:
- show system is really running
- help demo/debug

Not a primary information panel.

---

## 13. Empty/loading/error states

Wallet list:
- empty: `No executors found for this Seed`
- loading: `Scanning historical executions…`

Candidate list:
- empty while jobs running: `No candidates yet. Wallet investigations are still running.`
- empty after completion: `No Protocol Alpha Candidates found in this run.`

Reports:
- empty: `No reports generated yet.`

Errors should be attached to the affected job, not fail the whole workspace.

---

## 14. Content rules

Every visible label must answer one of:
- what object is this?
- what state is it in?
- what evidence supports it?
- what can the user do next?

If a UI element does none of these, remove it.
