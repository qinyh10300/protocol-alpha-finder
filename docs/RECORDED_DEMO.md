# Recorded research replay

All three frontend seeds use saved Skill research from 29 September 2026. Select a seed under **Choose current alpha seed**, then start replay. Selection alone does not start it. The same playback sequence reveals wallets, loads their recorded history, analyzes them, discovers candidates and publishes their saved reports.

Playback controls the presentation timing. It does not query the chain or create new evidence, wallets, candidates or assessments. The frontend no longer imports implementation-pack examples or synthetic scenarios.

| Seed | Wallets | Primary transactions | Distinct candidate / report cards | Original saved reports |
| --- | ---: | ---: | ---: | ---: |
| Energy Rental Liquidation | 5 | 48,768 | 1 / 1 | 2 |
| JustLend Lending Liquidation | 5 | 3,814 | 2 / 2 | 3 |
| USDD Keeper / Auction | 0 | 0 | 0 / 0 | 0 |

Candidates with matching titles and mechanism summaries within the same chain appear as one card. Each distinct candidate has one report slot, pending until its saved assessment is revealed. Wallet-specific candidate IDs, reports and evidence remain available inside that group and through report links. Filtering by wallet keeps only that wallet's findings. Original exports remain unchanged by replay or grouping.

Energy Rental's two assessments are **Insufficient evidence**. JustLend's three assessments are **Monitor**. All five preserve their original **UNCERTAIN** current state; historical evidence does not establish a current executable opportunity.

USDD retains the real scan: 27 bounded provider queries and zero verified executors. Its coverage and missing checks remain in `frontend/public/research/usdd-keeper-auction.json`. Replay finishes with zero wallets, candidates and reports; it does not fill the empty result with examples.

Switching seeds resets playback and wallet filters. Clicking a candidate card selects its report in the right column. Full reports can also open from a shared URL before replay starts. Existing `mode=demo` and `seed=all` links remain compatible: All combines 10 wallets, 52,582 primary transactions, 3 distinct mechanisms and their 5 underlying assessments. Shared identities and wallet histories are counted once.

## Refresh the published snapshots

After completing and validating a local Skill run:

```sh
python3 scripts/export_demo_research.py --data-root /absolute/path/to/data
npm run test:pages
```

The exporter writes all three recorded snapshots to `frontend/public/research/`. It uses the existing research adapter and validation-to-investigation consistency checks. Exports contain normalized results, seed coverage, report evidence and hashes of the original artifacts. Raw provider dumps, request headers, credentials and the full local `data/` directory are not published.

Review and commit these JSON files with the frontend changes. The static build imports the same files offered as evidence downloads, so GitHub Pages needs no `/api/` endpoint. Updating `main` triggers the existing build and deployment workflow. The collection scripts run locally and are not executed by GitHub Pages.
