# v4.3.36-rc.20 — Canonical Battery Flow, Source Validation Only

- Coordinates Foundation **F1.8.45**, Mobility **M0.10.50**, Energy **E0.15.130** (canonical model **1.4.5**) and Energy UX **v4.3.36-rc.20**. Compatible producer now declares `battery.charge_power_kw` and `battery.discharge_power_kw` on the canonical battery system.
- The Power Flow Card Plus adapter consumes only unique, available, finite and **non-negative** backend directional measurements with explicit W/kW units. Unsupported, stale, negative and non-numeric values fail closed; observed zero remains valid.
- Card battery `display_state: two_way` preserves simultaneous battery charging and discharging across multiple physical units, unlike `one_way`. Charge is card consumption; discharge is production. Grid and Solar follow their existing canonical owners.
- Includes the existing post-rc.19 fixes merged to `main` for shared runtime version/health footer and two-decimal display formatting; published generated JS/assets/checksum are locked to the candidate.
- **TEST CANDIDATE ONLY.** Physical Wessels Flow browser exception, selected native readback/quality, actual mixed-direction conditions, power-flow-card-plus resource registration, desktop/tablet/mobile, Molas/Sonnen, charging and rollback remain **NOT EXECUTED**. Stable **NO-GO**. Source static green does not constitute runtime proof.
- Rollback: **v4.3.36-rc.19**. Central blocker and resume authority: [Foundation #129](https://github.com/npinguin/rhi-foundation/issues/129).
