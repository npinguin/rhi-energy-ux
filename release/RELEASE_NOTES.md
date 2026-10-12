# v4.3.36-rc.16 — Trusted Energy Balance HACS TEST CANDIDATE

Paired target backend: **E0.15.124**; Foundation **F1.8.44**, Mobility **M0.10.48**.

- Correct Overview supply/demand accounting: Battery Discharge and Grid Import on Supply; Battery Charge is part of Site Consumption with Home Consumption and Flexible Loads; Grid Export is a separate outflow on the right.
- Do not publish false 0.0 kW with Unavailable. Missing or contradictory canonical battery/grid direction becomes a visible and explained unverified state, never inferred from child batteries.
- Read true producer-owned canonical Site Consumption without browser arithmetic. EN/NL/FR copy and direction/unknown-state regressions included.
- Includes rc.15 fixes for Strategic/Operational untranslated hero text, and Energy #294/#297 signed/typed charging need guard via paired E0.15.124.

## HACS test candidate — not stable

Real target Home Assistant must verify two SolarEdge charging batteries, the aggregate signed battery power and state, grid import/export direction, site demand reconciliation, source quality, D0/D1 plan and financial/history data, configuration write/readback, restart and rollback. Backend discrepancy tracked by npinguin/rhi-energy#299. No autonomous execution when evidence is incomplete.

Rollback: v4.3.36-rc.15. Do not overwrite historical tags.
