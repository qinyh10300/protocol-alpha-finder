# Recorded research replay

The frontend uses saved research from 29 September 2026, plus verified USDD historical executions added on 30 September. Select a seed under **Choose current alpha seed**, then start replay. Selection alone does not start it. Energy Rental and JustLend replay their recorded stages. USDD uses an illustrative progress plan for its unfinished investigation stages.

Playback controls the presentation timing. It does not query the chain or create new evidence, wallets, candidates or assessments.

| Seed | Wallets | Primary transactions | Distinct candidate / report cards | Original saved reports |
| --- | ---: | ---: | ---: | ---: |
| Energy Rental Liquidation | 5 | 48,768 | 1 / 1 | 2 |
| JustLend Lending Liquidation | 5 | 3,814 | 2 / 2 | 3 |
| USDD Keeper / Auction | 2 | History pending | 0 / 0 | 0 |

Candidates with matching titles and mechanism summaries within the same chain appear as one card. Each distinct candidate has one report slot, pending until its saved assessment is revealed. Wallet-specific candidate IDs, reports and evidence remain available inside that group and through report links. Filtering by wallet keeps only that wallet's findings. Original exports remain unchanged by replay or grouping.

Energy Rental's two assessments are **Insufficient evidence**. JustLend's three assessments are **Monitor**. All five preserve their original **UNCERTAIN** current state; historical evidence does not establish a current executable opportunity.

The original USDD scan covered July–September and found no executors. A targeted historical supplement verifies two originating wallets using three successful April–June transactions: two Dog liquidation triggers and a linked Clip auction purchase. Raw transactions, receipts and retrieval metadata are retained in `frontend/public/research/usdd-historical-evidence.json`; the exporter verifies transaction hashes, success, contract identities and matching events before publishing the wallets. The original scan remains separate from these earlier observations.

USDD replay reveals the two wallets, then advances History → Analyze → Search Alpha over 17 seconds. Pause, resume and restart control this illustrative progress. The footer identifies it, and completed wallet rows say **History replayed**. Full histories and investigation results remain pending in the saved research: transaction-history counts stay zero, and candidate/report counts stay 0 / 0. Click either wallet to inspect its recorded transaction evidence.

The local backend serves the timings from `frontend/public/replay/usdd-keeper-auction.json` at `GET /api/replay-plans/usdd-keeper-auction`. GitHub Pages bundles the same plan. The plan changes presentation only; the files in `frontend/public/research/` and the original archive are unchanged.

Switching seeds resets playback and wallet filters. Clicking a candidate card selects its report in the right column. Full reports can also open from a shared URL before replay starts. Existing `mode=demo` and `seed=all` links remain compatible: All combines 11 unique wallets, 52,582 primary transactions, 3 distinct mechanisms and their 5 underlying assessments. The shared JustLend/USDD wallet is counted once and keeps its previously recorded investigation.

## Refresh the published snapshots

After completing and validating a local Skill run:

```sh
python3 scripts/export_demo_research.py --data-root /absolute/path/to/data
npm run test:pages
```

The exporter writes all three recorded snapshots to `frontend/public/research/`. It uses the existing research adapter and validation-to-investigation consistency checks, and verifies the USDD historical supplement before applying it to an empty USDD scan. Exports contain normalized results, seed coverage, report evidence and source hashes. Only the public transaction/receipt responses needed for the USDD supplement are included; request headers, credentials and the full local `data/` directory are not published.

Review and commit these JSON files with the frontend changes. The static build imports the same files offered as evidence downloads, so GitHub Pages needs no `/api/` endpoint. Updating `main` triggers the existing build and deployment workflow. The collection scripts run locally and are not executed by GitHub Pages.
