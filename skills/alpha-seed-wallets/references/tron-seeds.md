# TRON seed reference

Use these three mechanisms to select research wallets. Verify deployment identity and parameters at the relevant block; documentation describes a mechanism but does not establish a currently profitable opportunity.

## 1. Energy Rental liquidation

**Seed ID:** `energy-rental-liquidation`

- **Mechanism:** eligible rental orders with insufficient deposits can be liquidated. The liquidator receives a protocol reward; any remaining deposit belongs to the renter.
- **Discover:** verify the Energy Rental market deployment, then query `Liquidate` events or successful `liquidate(renter, receiver, resourceType)` calls. Filter `resourceType=1` for Energy; record other resource types separately if requested.
- **Verify:** match transaction identity, block, success, event-emitting contract and decoded fields to the raw receipt. Trace the top-level owner through any executor contract to the market. The event's `receiver` is the rented-resource recipient; it is not automatically the liquidation reward recipient. Check the actual payout to the `liquidator`.
- **Research signals:** repeated liquidations, custom executor contracts, retry patterns, or rent/liquidate/return sequences. Record observed sequences without assuming that a preceding rental caused liquidation eligibility.
- **Economics:** distinguish reward, deposit refund, resource-recovery charges and execution costs. Resource delegation amounts are not spendable cash transfers or counts of Energy units. Obtain current parameters before quoting current rewards.

Official references: [contract and event semantics](https://docs.justlend.org/developers/energy_rental/), [rental lifecycle](https://docs.justlend.org/getting_started/concepts/energy_rental/).

## 2. JustLend lending liquidation

**Seed ID:** `justlend-lending-liquidation`

- **Mechanism:** a liquidator repays debt for an eligible undercollateralized position and receives collateral with a liquidation incentive.
- **Discover:** identify the market version and its verified contracts first. For the classic Supply & Borrow Market, use the relevant jToken market's successful `liquidateBorrow` calls and ABI-verified liquidation events. The high-risk-account API can locate borrowers to investigate; those borrower addresses are not the strategy wallets sought here.
- **Verify:** trace the actual repayment, borrowed-asset units, collateral market, seized jTokens and recipient. Separate borrower, transaction sender, helper contract and collateral recipient. When checking eligibility at a block, use Comptroller liquidity/shortfall and the corresponding parameters. A present-day healthy position does not invalidate its historical liquidation.
- **Research signals:** repeated execution, contract-based funding or liquidation sequences, management of collateral proceeds and transaction timing. A standard liquidation-tool user is a baseline candidate unless further technical behavior is demonstrated.
- **Economics:** query the liquidation incentive and close factor for the relevant block. The documented 8% incentive is a reference, not a constant to hard-code. Use the jToken exchange rate and token decimals to value received collateral; account for repayment principal, redemption constraints and execution/exit costs.
- **Version boundary:** JustLend V2/Moolah has a separate market interface and liquidation mechanics. If encountered, record its version and use its own verified ABI and accounting; do not decode it as a classic jToken market or transfer the 8% assumption to it.

Official references: [liquidation overview](https://docs.justlend.org/getting_started/concepts/liquidations/), [classic market contracts](https://docs.justlend.org/developers/supply_and_borrow_market/sbm/), [contract identities](https://docs.justlend.org/developers/contracts_overview/), [V2 market boundary](https://docs.justlend.org/developers/supply_and_borrow_market/sbmV2/).

## 3. USDD keeper and auction actions

**Seed ID:** `usdd-keeper-auction`

- **Mechanism:** liquidation and auctions resolve undercollateralized USDD vault debt. Keepers can perform maintenance actions; auction buyers purchase collateral. Their roles and sources of return differ.
- **Discover:** confirm the target network, deployment and collateral type. Search successful calls or ABI-verified events for each action below. Establish the deployed interfaces before constructing queries; do not invent event names from method names.

| Action type | Documented interface | Evidence and role checks |
| --- | --- | --- |
| `liquidation_trigger` | Dog `bark(ilk, urn, kpr)` | Vault owner, initiating wallet, new auction and actual incentive recipient; `kpr` need not equal the sender |
| `auction_reset` | Clip `redo(id, kpr)` | Existing auction, reset eligibility, successful reset and any actual incentive; a reset is not a purchase and does not automatically prove a reward |
| `auction_purchase` | Clip `take(...)` | Auction ID, USDD paid, collateral amount/recipient and internal settlement; use the verified deployed ABI for the exact signature |

- **Research signals:** repeated valid triggers/resets, monitoring across auctions, contract-based purchases and subsequent collateral handling. Do not infer bot operation or proprietary insight from a single successful call.
- **Economics:** keep keeper incentives separate from auction purchase proceeds. Verify configured fixed/proportional incentives and payment conditions for the operation. Buying collateral requires payment; a discount relative to an observed price does not establish realized profit. USDD accounting may use `wad`, `ray` and `rad`; determine each field's scale and whether funds remain in an internal auction account or were withdrawn to a wallet.
- **Missing deployment evidence:** retain this seed in the coverage report as unavailable or unverified, with the missing contract/ABI/state checks. Do not fabricate a wallet list or current profitability.

Official references: [Dog](https://docs.usdd.io/developers/core-contracts/dog), [Clip](https://docs.usdd.io/developers/core-contracts/clip), [liquidation rewards](https://docs.usdd.io/user-guide/liquidation), [collateral auctions](https://docs.usdd.io/user-guide/collateral-auction), [units and parameters](https://docs.usdd.io/developers/glossary).

## Tools and available implementation

Use chain tools available in the host, retaining request and evidence references. All three seed definitions are research instructions, not three preimplemented data collectors.

In the Protocol Alpha Finder repository, `scripts/collect_energy_rental.py` and `docs/energy-rental-collection.md` provide the existing Energy Rental adapter. Locate the repository before running it; a copied skill bundle may not include those files. That adapter covers only the first seed. The other two require suitable chain queries or supplied transaction/receipt data. If those inputs are unavailable, report the gap and continue the evidence-backed part of the workflow.
