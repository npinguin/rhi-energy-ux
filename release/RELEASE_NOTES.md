# v4.3.3 — restore published primary object truth TEST CANDIDATE

Energy 4.3.3 fixes the structural contract-adapter defect proven by the target Home Assistant review of 4.3.2: valid object properties could be published with `status=NORMALIZED`, `availability=AVAILABLE` and a resolved authoritative value, while the UX incorrectly treated the normalization status as availability and therefore hid the value from primary cards.

## User-facing changes

- restores published live facts on object primary cards instead of collapsing to only “Status OK”;
- Solar inverter cards consume published `solar.power_kw` / inverter power and other relevant facts when available;
- physical battery cards consume published SoC, power, available energy and capacity while keeping source/profile/asset identity in **Details**;
- Home Battery and Solar reuse the same physical-battery presentation, avoiding two truths for one battery;
- Solar distinguishes aggregate production from actual zones and consumes explicit `solar_zone` facts without name inference;
- Home Consumption and other current backend object classes consume their canonical property keys;
- full resolved secondary object properties are available progressively under **Details**;
- unavailable telemetry stays unavailable and is never promoted to a fabricated operational value.

## Structural correction

- separates property normalization status, availability, resolution status and quality in the Public V2 adapter;
- `NORMALIZED + AVAILABLE + RESOLVED` now correctly yields a resolved frontend field;
- explicit property-key aliases are governed by object type; names are never used to infer semantics;
- regression coverage reproduces the exact backend property shape that caused the 4.3.2 runtime defect;
- preserves Core 1.5.0, Mobility-owned visual identity, body-scoped View controls and the existing tab model.

Rollback: **v4.3.2**.

This is an installable HACS test candidate. Target Home Assistant desktop/iPad verification remains mandatory before qualification or stable promotion.
