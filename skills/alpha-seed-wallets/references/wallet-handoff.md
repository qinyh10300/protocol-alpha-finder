# Wallet discovery handoff

Use these fields in JSON or an equivalent structured report. Keep nulls and evidence gaps explicit. This is an Agent handoff, not a claim that the existing Energy Rental collector emits this exact schema.

## Run

- `chain`, `network`, `source_mode` (`real` or `synthetic`), `queried_at`.
- `requested_window`, `wallet_limit_per_seed` and any sampling or query limits.
- `requested_seed_ids`: all requested seeds, including those with no usable data.

## Coverage per seed

- `seed_id`, protocol version, deployed contracts and identity sources.
- Action types queried, filters, time/block bounds, pagination and raw source references.
- `query_status`: `complete`, `partial` or `unavailable`; complete means the documented provider query finished, not full-chain independence.
- `verified_wallet_count`, selection/exclusion rationale and `missing_checks`. A completed query with zero wallets is distinct from an unavailable query or an event-only sample with no verified initiator.

## Deduplicated wallet records

- `wallet_key`: chain + network + normalized address; retain `original_addresses`.
- `seed_ids`: every seed through which this wallet was actually evidenced.
- `evidence`: for each seed/action, include transaction hash, block/time, success, decoded action, contract version, sender, intermediaries, protocol executor, reward/collateral recipient and raw references. Add amount, unit and source for any monetary claim; otherwise leave it unknown.
- `technical_observations`, `baseline_or_strategy_signal`, `selection_reason` and `ownership_or_relayer_ambiguity`. A candidate label does not imply validated alpha.
- `history_request`: address, requested window, needed primary transactions/receipts/logs/asset flows and outstanding coverage checks.

Do not merge distinct addresses based on presumed common ownership. One wallet supported by two seeds has one history request with both sets of evidence. Event-only identities without a verified originating wallet remain in the seed coverage/gaps, not in the verified wallet shortlist.

The next stage investigates all available activity in the bounded wallet history, including contracts and mechanisms unrelated to the starting seeds. It must retain the original seed provenance while forming new candidates.
