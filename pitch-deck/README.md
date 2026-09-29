# Pitch Deck

**English** · [简体中文](README.zh-CN.md) · [Project home](../README.md)

## Download

**[Download the original TRON pitch deck · 11 slides](Protocol_Alpha_Finder_TRON_Pitch.pptx)**

[Bilingual speaker guide](../docs/Protocol_Alpha_Finder_Pitch_Guide_v2_Bilingual.md) · [Original product positioning](../docs/Protocol_Alpha_Finder_Product_Positioning_v2.md) · [Current system architecture](../docs/ARCHITECTURE.md)

The original PPTX remains available as the project's founding pitch. The notes below connect its product vision to the current implementation.

## The story

An executor has already demonstrated one protocol insight on-chain. What else can we learn from that wallet's history?

Protocol Alpha Finder starts with known protocol mechanisms, finds their executors, and investigates each wallet for new candidates. Every candidate can produce a report that explains the mechanism, evidence, current state, and execution conditions.

**Alpha finds wallets. Wallets find more Alpha.**

## Slide outline

| Slide | Topic |
| --- | --- |
| 1 | Protocol Alpha Finder |
| 2 | The liquidation research problem |
| 3 | Protocol Alpha and trading alpha |
| 4 | TRON discovery seeds |
| 5 | Alpha → Wallet → Alpha |
| 6 | Open-ended discovery with an Agent |
| 7 | Technical architecture |
| 8 | TRON as the launch ecosystem |
| 9 | Related products and positioning |
| 10 | Hackathon MVP and Alpha Graph vision |
| 11 | Source appendix |

## Current demo and presentation notes

| Topic | Current implementation |
| --- | --- |
| Discovery seeds | The Skills default to Energy Rental liquidation, JustLend lending liquidation, and USDD keeper / auction actions. They retain evidence and coverage gaps for each seed. The Python collector currently covers Energy Rental; the other entries need host tools or supplied evidence. |
| Research workflow | Four Skills guide a host Agent through orchestration, wallet discovery, wallet investigation, and validation. Each wallet has its own History → Analyze → Search Alpha job. |
| Product output | Wallet Investigations → Alpha Candidates → Alpha Reports. Transactions appear as evidence volume and supporting sources. Every candidate can receive a report. |
| Report outcomes | `ACTIONABLE`, `MONITOR`, `REJECTED`, or `INSUFFICIENT_EVIDENCE`. The local archived run contains five reports: three Monitor and two Insufficient Evidence. All five preserve the original `UNCERTAIN` current state. |
| Runtime | The frontend reads saved Skill artifacts through a local API and refreshes them when files change. A host Agent executes the Skills. The API does not run an autonomous research loop. |

The archived reports support research review. They do not establish current profitability or an actionable opportunity. Monitor means that a candidate has reasons to be checked again when the stated evidence or conditions become available.

### Differences from the original materials

- Slide 4 calls JustLend lending liquidation a “Broad Seed.” The original v2 positioning calls it a conditional seed. The current Skills include it among the three default entry points and require evidence to distinguish ordinary participation from technical execution patterns.
- Slide 7 illustrates an actionable output. The current product supports all four report outcomes above, including useful reports for inconclusive or inactive candidates.
- The deck describes a target architecture for deterministic accounting, live state checks, and validation. Complete profitability accounting and an autonomous backend Agent loop remain future work.
- Reward rates, keeper incentives, and protocol interfaces in the original deck need current contract, transaction, block, and query-time evidence before being presented as live facts. Demo data illustrates the workflow and is separate from archived research results.
