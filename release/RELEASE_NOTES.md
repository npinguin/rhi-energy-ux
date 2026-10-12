# v4.3.36-rc.13 — Canonical Site Consumption and Metering (HACS TEST CANDIDATE)

- Consume backend-owned `site_consumption_power_kw` native metric in Power Flow; strict W/kW, unique publisher and zero/unavailable semantics, no guessed Home/Site source.
- Consume `RHI_ENERGY_METERING_PERIOD_V1` for hour/today/week/month/year from persisted Energy period evidence; per-field quality, stored kWh, cost evidence and individual flexible-load attribution remain backend-owned.
- Preserve independent Home Consumption, charger infrastructure exclusion, no double counting and no optimistic command/readback inference.
- Requires Energy E0.15.122 (Foundation F1.8.44 / Mobility M0.10.47 coordination).
- Period Metering and Flow source/UX contract regressions are covered by static CI; target HA install, meter history persistence, planner and permissions remain unqualified.

This is an immutable TEST CANDIDATE, **not a stable approval**. Current EMHASS selected provider's required solar forecast slot has not been confirmed in target runtime. No simulated plan or automatic actuation is provided. Rollback: v4.3.36-rc.12.
