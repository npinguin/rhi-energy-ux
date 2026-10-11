# v4.3.36-rc.4 — Canonical flexible inventory, available power and readiness (HACS TEST CANDIDATE)

- Preserve every unique backend-published canonical `flexible_load` object in Consumption, including missing-power and non-plan-ready objects.
- Preserve producer-owned operating, participation, availability and readiness only when explicitly published; unknown is not an active plan.
- Require explicit planning readiness, and show blocked/unassessed inventory separately.
- Consume `flexible_loads.available_power_kw` directly from canonical Energy property; valid zero and unavailable remain distinct.
- D0/D1 numeric totals alone do not prove an effective plan; incomplete EMHASS HOLD remains non-executable.
- Backend metering period diagnostics are not a public canonical period contract. Missing public publication is tracked in Energy #242. UX does not suggest unproven resets.
- Contract regressions for canonical inventory, zero and absent planning.

Compatibility: Energy E0.15.116 or newer; Foundation F1.8.44; Mobility M0.10.44 for cross-domain visuals. Rollback: v4.3.36-rc.3. Target HA qualification remains pending; **not stable**.
