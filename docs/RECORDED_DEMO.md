# Demo seed data

The GitHub Pages frontend offers three seeds. Select one under **Current Seed**, then select **Run Discovery**. Choose **All** to combine all three seeds in the wallet, candidate and report columns. The seed selector in **Wallet Investigations** stays synchronized with the top selector. All currently includes 10 wallets, 6 candidates and 6 reports; badges identify each seed and distinguish synthetic examples from recorded research. USDD retains its zero-result coverage note. Shared identities are merged, and a shared wallet history is counted once.

Switching seeds resets playback and wallet filters. Share links retain the selected seed; full reports also work after a page reload.

| Seed | Published data | Wallets | Candidates / reports |
| --- | --- | --- | --- |
| Energy Rental Liquidation | Original synthetic implementation-pack examples | 5 | 3 / 3 |
| JustLend Lending Liquidation | Saved Skill research from 29 September 2026 | 5 | 3 / 3 |
| USDD Keeper / Auction | Saved bounded query coverage from 29 September 2026 | 0 | 0 / 0 |

JustLend retains 3,814 primary transactions in the saved wallet histories. Its reports preserve transaction links, reconciled sample counts, recorded check times, missing evidence and research outcomes. Historical evidence does not establish a current executable opportunity.

USDD completed 27 bounded provider queries with no verified executor. The page retains the coverage gaps, including empty deployed ABI metadata and the absence of an independent block-wide scan. Zero indexed matches do not establish that no such activity exists on-chain. No wallets, candidates or reports are synthesized for this seed.

Both recorded scenarios display **Recorded research replay**. Playback timing is simulated; Run Discovery does not query the chain. Energy Rental continues to display **Synthetic demo**.

## Refresh the published snapshots

After completing and validating a new local Skill run:

```sh
python3 scripts/export_demo_research.py --data-root /absolute/path/to/data
npm run test:pages
```

Review and commit `frontend/public/research/*.json` with the frontend changes. The exporter uses the existing research adapter, including validation-to-investigation consistency checks. It publishes normalized results, selected-seed coverage and source artifact hashes. Raw provider dumps, request headers, credentials and the full local `data/` directory are not copied.

Each report links to its published snapshot and relevant TRON transactions/contracts. Activity links also resolve to that snapshot; no `/api/` endpoint is required. The static build imports the same checked-in JSON that is available for download. GitHub Actions builds and deploys the committed snapshot when `main` is updated.

This integration publishes historical results. The local JustLend/USDD collection scripts are not executed or hosted by GitHub Pages.
