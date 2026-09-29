# Research record

Use this structure when reporting a run; unknown values remain explicit.

- **Run:** chain, network, source mode (real/synthetic), query time, covered blocks/dates, retrieval completeness.
- **Seeds:** every requested seed ID/name, mechanism, contract identity/version, query status and coverage, source references, verified wallet count, executor-selection rationale and missing checks. Include unavailable seeds explicitly.
- **Wallet:** chain/network/address key, all originating seed IDs, executor/proxy/reward-recipient roles, supporting transactions and ambiguities. Deduplicate the same wallet across seeds while preserving its evidence.
- **Candidate:** candidate ID/name, originating wallet and seed IDs, its own mechanism, observed sequence, source transaction references, hypothesis, alternative explanations and falsification checks. Its mechanism may differ from the original seeds.
- **Mechanism:** capital in/out, reward source, asset units, deterministic method, historical costs and remaining gaps.
- **Current state:** observation block/time, parameters, liquidity, oracle, upgrade/pause status, current economics and source references.
- **Assessment:** mechanism established/unproven; ACTIVE/DEGRADED/EXPIRED/UNCERTAIN; reasons.
- **Execution:** required capital, permissions, timing, capacity, risks and conditions that must remain true.
- **Next checks:** missing evidence and the smallest useful follow-up.

Every numerical claim must identify units, observation interval and source/method. No current-state claim may inherit the date or state of a historical transaction implicitly.
