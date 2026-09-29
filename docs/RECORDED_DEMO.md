# Demo seed data

The GitHub Pages frontend offers three seeds. Select one of the three visible radio options under **Choose current set**, then click **Replay Demo**. Selection alone does not start playback. The selector shows only these three seeds, without a subtitle or an All option. Existing shared links with `seed=all` still open combined results in the wallet, candidate and report columns. **Wallet Investigations** has no duplicate seed selector. All currently includes 13 wallets, 8 candidates and 8 reports; badges identify each seed and distinguish synthetic examples from recorded research. USDD now includes an explicitly synthetic scenario; its original zero-result research snapshot remains separate. Shared identities are merged, and a shared wallet history is counted once.

Switching seeds resets playback and wallet filters. Share links retain the selected seed; full reports also work after a page reload.

| Seed | Published data | Wallets | Candidates / reports |
| --- | --- | --- | --- |
| Energy Rental Liquidation | Original synthetic implementation-pack examples | 5 | 3 / 3 |
| JustLend Lending Liquidation | Saved Skill research from 29 September 2026 | 5 | 3 / 3 |
| USDD Keeper / Auction | Synthetic auction reset and purchase examples | 3 | 2 / 2 |

JustLend retains 3,814 primary transactions in the saved wallet histories. Its reports preserve transaction links, reconciled sample counts, recorded check times, missing evidence and research outcomes. Historical evidence does not establish a current executable opportunity.

USDD's demo uses `frontend/public/research/usdd-synthetic-demo.json`: three clearly fictional `DEMO-USDD-*` wallet identifiers, 1,980 simulated transactions, and two reports showing example Actionable and Monitor outcomes. The cards, report pages and downloaded fixture mark these results as synthetic. No transaction hashes, on-chain receipts or live contract checks are fabricated. Report evidence links to the scenario fixture.

The saved real USDD scan remains unchanged at `frontend/public/research/usdd-keeper-auction.json`: 27 bounded provider queries and zero verified executors. That file retains its query limitations and is not used to support the synthetic reports. The local Skill-results mode still shows the recorded scan. The large zero-result note is absent from the synthetic Demo and All view.

The top replay banner is omitted. Replay metadata, source badges and the footer identify recorded or synthetic data. Wallet candidate counts appear after Search Alpha completes. **View Details** on a candidate selects its summary in the right report column; the first report is shown by default. **Open Full Report** appears in that column, without a duplicate action on candidate cards. Playback timing is simulated; Replay Demo does not query the chain.

## Refresh the published snapshots

After completing and validating a new local Skill run:

```sh
python3 scripts/export_demo_research.py --data-root /absolute/path/to/data
npm run test:pages
```

Review and commit `frontend/public/research/*.json` with the frontend changes. The exporter updates the recorded files and leaves `usdd-synthetic-demo.json` untouched. It uses the existing research adapter, including validation-to-investigation consistency checks. It publishes normalized results, selected-seed coverage and source artifact hashes. Raw provider dumps, request headers, credentials and the full local `data/` directory are not copied.

Recorded reports link to the published snapshot and relevant TRON transactions/contracts; synthetic USDD reports link only to the fictional scenario fixture. Activity links also resolve to that snapshot; no `/api/` endpoint is required. The static build imports the same checked-in JSON that is available for download. GitHub Actions builds and deploys the committed snapshot when `main` is updated.

This integration publishes historical results. The local JustLend/USDD collection scripts are not executed or hosted by GitHub Pages.
