# v4.3.36-rc.14 — Energy Flow & Intelligence recovery (HACS TEST CANDIDATE)

- Restore separate Forecast, Strategic, Tactical, Operational and Settings journeys for native Today (D0) / Tomorrow (D1).
- Show read-only RHI deterministic baseline when a requested external provider has no validated effective result; never issue commands on baseline.
- Select operational planner and resolution using exact backend-owned HA selectors and readback; Energy automation mode through canonical energy.operating_mode, no fabricated setting.
- Read actual canonical D0/D1 source/consumer lanes, completeness and financial evidence without phantom allocations or estimated zeros.
- Flow presents Home Battery even when direction-safe separate charge/discharge signals do not exist; animation is enabled only with verified sign-compatible sensors.
- Flow shows one real Flexible consumers list with identity, Energy needed (kWh), Power now (kW), Requested power (kW), associated charger and owner detail navigation. Physical charger interfaces are not duplicate loads; technical connections fold into diagnostics.
- Consume backend-native Site Consumption, Flexible Loads instantaneous power and canonical Metering/Retrospective from E0.15.122.
- Tests include canonical ownership, no unproven charger-to-vehicle attribution, independent battery direction, native planner/readback, cross-surface UI and HACS deterministic build.

**Target HA hardware/runtime and real backend E0.15.122 + companion pending planner controls remain unqualified.** This is an immutable candidate, not stable. No fallback execution, no hardware actuation by a shadow provider. Rollback: v4.3.36-rc.13.
