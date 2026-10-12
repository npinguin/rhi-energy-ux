# v4.3.36-rc.18 — HACS TEST CANDIDATE

- Restore V1 parity for Actual Solar/Site/Home power (kW) alongside Energy-owned D0/D1 forecast (kWh), and per-load need, scheduled today/tomorrow and still-to-plan (source #245).
- Preserve native Supply / Demand / Balance, backend-owned Grid Balance and explicit incomplete evidence; real chargers remain infrastructure via Energy #300/#301.
- Coordinated test stack: Foundation **F1.8.44**, Mobility **M0.10.49**, Energy **E0.15.125**, Energy UX **v4.3.36-rc.18**.
- Target Home Assistant write/readback, restart, upgrade and rollback **NOT EXECUTED**. Stable **NO-GO**. Rollback to v4.3.36-rc.17.
