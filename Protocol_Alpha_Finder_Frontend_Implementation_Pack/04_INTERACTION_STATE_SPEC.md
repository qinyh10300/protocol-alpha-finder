# 04 — Interaction, State & Demo Spec

## 1. Default state

Page loads with a selected Seed Alpha.

Show:
- Seed name
- `Run Discovery`
- empty Wallet / Candidate / Report columns

No fake prefilled analytics in production mode.

Demo mode may use replayable mocked events.

---

## 2. Start discovery

User clicks:

`Run Discovery`

Frontend:
- POSTs a research run
- run status becomes `running`
- starts SSE/polling
- Wallet rows appear as backend discovers executors

The user does not need to click each wallet.

---

## 3. Wallet investigation jobs

Each wallet runs independently.

Visual state:

```text
Queued:
History ○  Analyze ○  Search Alpha ○

Fetching:
History ●  Analyze ○  Search Alpha ○

Analyzing:
History ✓  Analyze ●  Search Alpha ○

Searching:
History ✓  Analyze ✓  Search Alpha ●

Complete:
History ✓  Analyze ✓  Search Alpha ✓
```

If a wallet produces no candidates:
- show `0 candidates`
- this is normal and credible

If a wallet fails:
- show error only on that row
- other jobs continue

---

## 4. Candidate appearance

When backend emits `candidate_created`:
- add Candidate card
- subtle fade/slide animation
- show supporting counts if available
- validation may start automatically

No flashy animation.

---

## 5. Validation

Candidate transitions:

```text
DISCOVERED
    ↓
VALIDATING
    ↓
REPORT READY
```

Validation sections can update progressively.

The Candidate card should not disappear if outcome is poor.
It becomes a Report with outcome.

---

## 6. Report creation

When report is generated:
- Reports column adds preview
- Candidate shows `REPORT READY`
- user can click `Open Full Report`

Every Candidate can have a report:
- ACTIONABLE
- MONITOR
- REJECTED
- INSUFFICIENT_EVIDENCE

This is important: validation is not a binary “keep/delete” filter.

---

## 7. Full report interaction

Dedicated page `/reports/:id`.

Primary action:
- `Monitor Opportunity` for MONITOR/ACTIONABLE
or
- `Save Report`

Secondary:
- `Promote to Discovery Seed`

Supporting:
- View source wallets
- Open example tx in explorer
- Export/share

---

## 8. Activity visibility

Main workspace:
compact line only:

`Running · 17 wallets · 3,883 tx loaded · 4 candidates · 3 reports`

Button:
`View run activity`

Drawer:
timestamped runtime events.

Activity is supporting evidence, not the page's central content.

---

## 9. Demo mode

Hackathon-friendly demo mode should replay a deterministic event stream.

Suggested timeline (10–20 seconds total):

- 0s: Seed shown
- 1s: wallet 1 discovered
- 1.5s: wallet 2 discovered
- 2s: wallet 3 discovered
- 3s: history job starts independently
- 5s: first wallet analyze
- 7s: first candidate appears
- 8s: second candidate appears
- 9s: candidate validation starts
- 12s: first report ready
- 14s: second report outcome = MONITOR

User then clicks first Report.

This demonstrates the idea without requiring many manual clicks.

---

## 10. Optional deep links

Wallet row click:
- `/research?wallet=<address>` or drawer

Candidate click:
- opens candidate/report preview drawer

Report:
- `/reports/:reportId`

---

## 11. Accessibility

- do not rely on color alone for status
- status always includes text
- keyboard focus for rows/buttons
- semantic table/list structure
- minimum 14px body text
