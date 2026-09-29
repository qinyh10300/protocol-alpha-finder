---
name: alpha-seed-wallets
description: Locate and assess actual executors of a known protocol mechanism using supplied or accessible chain evidence. Use when a protocol alpha seed needs an evidence-backed wallet shortlist.
---

# Alpha Seed Wallets

Establish the mechanism and deployed contract from authoritative material and actual chain evidence. Keep original address formats and chain/network identity; do not guess addresses or function signatures.

For each matching transaction, record hash, block, timestamp, success status, decoded action and source. Separate transaction sender, proxy/router, ultimate executor and reward recipient. Do not infer common ownership from shared infrastructure.

A successful call alone does not prove profit or technical insight. Inspect whether the action is a standard UI path, whether execution differs from that path, and whether asset/reward evidence supports the seed hypothesis. Explain inclusion and exclusion without ranking by balances alone.

Return a bounded shortlist with the evidence supporting each wallet, ambiguity and excluded cases. Record query filters, pagination and coverage so that partial retrieval is visible. If no evidence establishes an actual executor, return an empty shortlist and the missing checks.
