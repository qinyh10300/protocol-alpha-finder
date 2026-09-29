---
name: wallet-alpha-investigation
description: Investigate protocol interactions across a wallet history and form non-standard strategy hypotheses with supporting transactions and falsification checks. Use for open-ended discovery after selecting a research wallet.
---

# Wallet Alpha Investigation

Accept the [wallet discovery handoff](../alpha-seed-wallets/references/wallet-handoff.md), or equivalent supplied wallet evidence. Preserve all originating seed IDs and role/evidence records; investigate a wallet once even if it was found through multiple seeds. Missing data for another seed does not invalidate this wallet's verified provenance.

Record the wallet's chain, network, covered block/time range, sources and retrieval completeness. Describe partial samples as partial; do not call them full history.

Inspect contracts, decoded functions, repeated transaction sequences and asset movement. Distinguish user calls from routers, failed transactions, internal actions and unrelated transfers. Read ABI, verified source and protocol context when needed; a function name alone does not establish semantics.

Inspect the wallet's broader activity, not only calls matching its original seeds. Cluster observed behavior, including patterns outside familiar liquidation/arbitrage labels. Separate observations from interpretation. For each candidate explain the hypothesized reward or accounting mechanism, supporting sequence, alternative explanation and evidence that would disprove it. Price appreciation and unexplained transfers are not proof of protocol rewards.

Pass candidate records to [protocol-alpha-validation](../protocol-alpha-validation/SKILL.md). Each record includes a candidate ID, originating wallet and seed IDs, chain/network, observed time/block range, source transactions, action sequence, mechanism hypothesis, alternative explanations, falsification checks, known costs/units and missing evidence. Keep seed provenance distinct from the candidate's own mechanism: an Energy Rental wallet may reveal a different protocol strategy. Do not invent performance metrics or claims of novelty. If no meaningful candidate emerges, report that result and the coverage limits.
