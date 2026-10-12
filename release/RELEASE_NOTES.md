# v4.3.36-rc.15 — Deterministic Energy planning and configuration HACS TEST CANDIDATE

Paired and tested backend source candidate: **E0.15.123**; Foundation F1.8.44 and Mobility M0.10.47.

- Intelligence navigation exposes Forecast, Strategic, Tactical, Operational and Settings as dedicated existing views with a single Home Intelligence style and data contract.
- Tactical displays D0/D1 day horizons, Solar/Grid/Battery/Home energy source/consumer lanes, per-flexible-load energy allocations, remaining needs and producer-owned kWh totals, honoring the backend's 15/30/60-minute resolution.
- Native Energy provider selector defaults to RHI Deterministic for unset configurations and native resolution selector writes 15/30/60 minutes through HA config-entry options and readback. User configurations explicitly selecting EMHASS must be changed by the user to RHI.
- Existing Energy UI contracts consume Site Consumption, native Flexible Loads power, trustworthy hour/day/week/month/year Metering and Retrospective evidence from Energy E0.15.123 without creating values in the browser.
- Retain fail-closed forecast and planning evidence status. External optimizers use the same planner input/output/admission concepts, not a parallel UI or physical command path.

## HACS candidate, not stable

Static CI, page contracts, checksum and HACS packaging are verifiable at build time; real HA 2026.10.x, physical forecast coverage, price history, per-load allocations, automation readback, command confirmation, restart and rollback remain **NOT EXECUTED** until a target installation produces proof. Do not infer a working plan where the provider still reports missing input.

Rollback: v4.3.36-rc.14. Do not overwrite historical tags.
