# Protocol Alpha Finder — Frontend Implementation Pack

This package is intended to be given directly to a frontend coding agent.

## Product idea

The UI must make one idea concrete:

> **Known Protocol Alpha → Strategy Wallets → Wallet Investigation → Alpha Candidates → Alpha Reports**

The product is not a transaction dashboard. Transactions are evidence and raw material.
The product output is a human-readable **Alpha Report** that helps a human decide whether an opportunity is actionable, monitor-worthy, rejected, or still uncertain.

## Files

- `01_UX_PRODUCT_SPEC.md` — product/UX definition and information architecture
- `02_UI_COMPONENT_SPEC.md` — page layout, components, content rules, visual design
- `03_DATA_CONTRACT.md` — frontend-facing data models and field provenance
- `04_INTERACTION_STATE_SPEC.md` — runtime states, auto-play flow, transitions
- `05_CODING_AGENT_TASK.md` — implementation brief that can be pasted into a coding agent
- `06_MOCK_DATA.json` — realistic mock payload for the MVP frontend
- `assets/product_design_board.png` — latest product concept board
- `assets/workspace_reference.png` — latest main workspace reference

## MVP routes

- `/research` — main research workspace
- `/reports/:reportId` — dedicated Alpha Report page
- Optional: `/reports` — report library

## Non-goals

Do **not** build:
- trading charts
- wallet PnL dashboards
- transaction tables as primary UI
- arbitrary “smartness scores”
- fake confidence percentages
- decorative tags without clear provenance
- candidate icons that imply a predefined taxonomy

## Core design principle

> **Every visible field should either describe a real research object, a real running state, or evidence that can eventually be filled by backend data.**
