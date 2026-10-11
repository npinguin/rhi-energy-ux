# v4.3.36-rc.2 — Native canonical Energy UX (HACS TEST CANDIDATE)

This immutable candidate migrates the Energy frontend off the retired Public V2 product sensor to backend-owned native Home Assistant object, property, command, metric and planning-horizon entities. **This is not a qualified stable release.** Target Home Assistant functional acceptance and cross-domain upgrade/rollback remain blocked in `release/QUALIFICATION.json`.

## Implemented and source-verified

- Native canonical object identity, child/parent hierarchy and visual provenance; duplicate object/property publishers fail closed.
- Native canonical configuration properties for pricing, strategies and metering settings, with explicit write descriptors and canonical readback authority.
- Exact canonical Energy command button invocation with support, visibility, execution allowed, availability and duplicate-publisher safety gates. No guessed command targets.
- Producer-owned Home Consumption metric, D0/D1 numeric totals, effective horizon `attributes.details`, planning assets, lane data and execution policy. No frontend-computed totals.
- Financial outcome only for the backend-selected period. Missing/invalid/unpublished value, period, topology or metering attribution remains unavailable rather than reconstructed.
- Structural navigation presence uses canonical object/configuration inventory, never a transient 0 kW reading or a retired snapshot.
- Full EN/NL/FR, desktop/tablet layout, canonical UX Core, deterministic HACS package and strict zero-retired-contract regression gates executed in CI.

## Minimum joint package baseline

Energy E0.15.116, Foundation F1.8.44 and Mobility M0.10.44; shared UX Core 1.6.3 pinned at `2eff5c50408e32ec604fc2877cf9a404808ecaab`.

## Outstanding release acceptance

The native producer does not yet provide complete period-scoped Metering/Retrospective or all physical charging relationship and consumer attribution evidence required for full product parity; the UX must report explicit gaps rather than fabricate values. Do not represent those surfaces as completed. Pricing/strategy write→canonical readback, D0/D1 detail rendering, managed commands, Home Assistant device lifecycle, iPad/desktop visual parity, upgrade and rollback require physical target-instance proof.

HACS install source is the committed `dist/` tree of the immutable release tag. GitHub Release assets are intentionally absent. A tag does **not** mean stable qualification.
