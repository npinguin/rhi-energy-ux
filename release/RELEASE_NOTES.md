# v4.3.36-rc.19 — HACS TEST CANDIDATE

- Restore producer-owned known Home Consumption + Solar forecasting, usable Supply and Grid Impact evidence even when unknown vehicle needs block the complete executable plan (Energy #309/#310, Energy UX #247).
- Explicitly disclose the known-load-only boundary; it **excludes unknown vehicle demand and battery dispatch**, and grants no scheduling/physical execution authority.
- Reconciled source history: historical Energy UX Flow/Planning branches were closed superseded by #236/#245; their complete old branches must NOT be merged. Target runtime Flow exception is still an open P0.
- Coordinated source target: Foundation **F1.8.45**, Mobility **M0.10.50**, Energy **E0.15.128**, Energy UX **v4.3.36-rc.19**.
- Target HA desktop/tablet/mobile, physical write/readback, restart, install and rollback **NOT EXECUTED**; stable **NO-GO**, rollback to **v4.3.36-rc.18**.
