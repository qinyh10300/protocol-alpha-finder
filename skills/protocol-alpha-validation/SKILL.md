---
name: protocol-alpha-validation
description: Assess a protocol strategy candidate's mechanism, present applicability and execution conditions against traceable evidence. Use to distinguish observed patterns from validated protocol opportunities.
---

# Protocol Alpha Validation

Accept the investigation's candidate record, retaining its candidate ID, wallet, originating seed IDs and evidence references. Assess the candidate's specific hypothesis, including its alternative explanations and falsification checks. Seed membership is discovery provenance, not evidence that this new hypothesis is true.

## Mechanism

Reconstruct capital in, contract actions, protocol reward and capital out using deterministic tools. Reconcile asset units and decimals, token/TRX deltas, internal transfers, costs, deposits and returned principal. Avoid counting the same transfer twice. Separate protocol incentives from price changes. Any fiat conversion needs a timestamped price source. Report unknown economics instead of silently treating missing costs as zero.

Identify who controls and can withdraw the proceeds before attributing contract income to a wallet. For causal claims such as a preceding action changing liquidation eligibility, separate observed ordering from causation; identify the historical-state check or counterfactual replay needed to test the claim. A reward payment alone does not validate the claimed advantage.

## Current state

Pin checks to a network, block and retrieval time. Check contract version, parameters, liquidity, oracle dependencies, pause/upgrade state and relevant resource costs. A historical receipt cannot establish current availability. Do not assume a historical reward rate remains valid.

## Execution conditions

Describe capital, permissions, timing, competition, slippage, state races, capacity and failure costs. List the conditions that must remain true and what evidence supports them. Simulation, if available, is state-specific and does not guarantee inclusion or profit.

## Report

Keep mechanism validation and current status separate:

- `ACTIVE`: supported mechanism and current evidence satisfy stated conditions; execution remains conditional.
- `DEGRADED`: supported mechanism remains applicable with documented deterioration.
- `EXPIRED`: evidence shows the mechanism or opportunity is no longer applicable.
- `UNCERTAIN`: material evidence is missing, conflicting or only synthetic.

Include candidate/wallet/seed IDs, evidence references, historical versus current economics, assumptions, execution requirements, failure conditions and next checks. Return both mechanism-established/unproven and the current-state assessment to the discovery workflow. Only an established mechanism may be proposed as a new seed, with its limits and current status preserved. Never upgrade a candidate solely because an Agent finds its story plausible. Read-only validation does not authorize live transactions.
