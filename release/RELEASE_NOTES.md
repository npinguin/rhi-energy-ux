# RHI Energy UX 4.3.14 — SOLAR_HIERARCHY_PERSISTENT_APPEARANCE

- Move Home Battery ahead of Solar production/inverter hardware detail.
- Keep Solar strings visible directly below the inverter system; optimizers and panels are primary body content, not hidden behind the string Details toggle.
- Keep unresolved inverter↔string relationships visible without guessing ownership.
- Persist Energy-owned appearance through backend Public V2 property writes instead of browser localStorage.
- Use the shared UX Core 1.5.2 visual picker shell.
- Preserve producer ownership: Mobility-owned vehicle/charger/flexible-load visuals remain authoritative and cannot be overridden by Energy.
- Preserve E0.15.77 automation authority, planning, Metering, Value and Retrospective semantics.

Minimum/tested backend: **E0.15.78**.
UX Core baseline: **1.5.2 @ 16a217a33f6a7cc90d42ad83492e90ba1d364eee**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
