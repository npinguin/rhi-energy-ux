# RHI Energy UX v3.94.13 — TEST CANDIDATE

## Scope

Planning contract closure over v3.94.12, aligned to Energy E0.15.24.

- consumes `planning_tomorrow_totals_json` as the authoritative D1/Tomorrow aggregate;
- no longer presents the combined D0+D1 planning total as Tomorrow;
- labels D0 aggregate values as **Planned today** and D1 aggregate values as **Planned tomorrow**;
- continues to read flexible-load aggregate energy from backend-owned planning lane totals; no frontend summation is introduced;
- retains the existing Value reader for `net_financial_result_eur`, which E0.15.24 now publishes from measured accounting;
- preserves interaction-state stability from v3.94.12.

## Compatibility

- Energy UX: 3.94.13
- Minimum backend: E0.15.24
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.12

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
