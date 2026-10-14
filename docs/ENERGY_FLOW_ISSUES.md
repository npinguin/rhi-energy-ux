# Energy Flow — issue-by-issue UX recovery

Status: **source validation for v4.3.36-rc.20**. E0.15.130 now publishes the two system-only native battery direction properties, but target-HA installation / browser exceptions / physical controls / rollback are **not qualified**; no stable promotion.

## Issue E-FLOW-01 — Home Battery missing from flow

Observed: Power Flow Card Plus diagram contains Grid, Solar and Site Consumption but omits Home Battery; the header may display a numerical battery power with state Unavailable.

Cause: the previous adapter intentionally did not map battery.power_kw because the canonical sign convention does not establish the Power Flow Card Plus charge/discharge directions. Rendering it as signed is unsafe.

Current workbranch fix:
- consumes an explicit, unique, available and unit-compatible **battery.charge_power_kw** and **battery.discharge_power_kw** sensor pair when both are published by Energy's canonical battery_system interface;
- SoC is optional and read only from a unique available percent sensor;
- a battery status row in the Flow panel remains visible even when the pair is unavailable, with a truthful label *Direction not proven*, numeric state where available and direct navigation to Home Battery;
- never synthesizes a directional arrow from battery.power_kw or state text.

Source gate: E0.15.130 now declares and publishes both directional properties as optional native HA properties (model 1.4.5); source CI passed, while physical Wessels presence and readback remain open. The UX adapter requires non-negative finite values and uses `two_way` to preserve simultaneous opposing flows. If a physical source does not publish both available values, the flow diagram battery circle remains intentionally absent until backend provides explicit direction-compatible data. Verify real charge, discharge, idle and unknown on Home Assistant; do not accept a false line animation.

## Issue E-FLOW-02 — Multiple conflicting consumer lists / charger treated as load

Observed: the Flow page showed All flexible loads plus duplicate Charging connections and Physical consumers sections. A charger could enter the flexible_load inventory as a fallback while its connected vehicle remained a real consumption identity. The row did not show requested vs actual power or remaining energy need.

Current workbranch fix:
- a genuine flexible_load must not be classified as connection infrastructure or storage;
- canonical consumer inventory merged by consumer asset ID with published physical connection projection, maintaining idle/unknown consumers without duplicates;
- **one** primary Flexible consumers list below the flow, with the registered producer visual, state, Energy needed (kWh), Power now (kW), Requested power (kW), named charger and optional producer-owner detail navigation;
- charger interfaces move to expandable *Charging connection diagnostics*, not another consumer card or Power Flow Card Plus individual node;
- empty/unavailable values stay unknown, zero stays zero, no attribution inferred from matching name or visual.

Acceptance still open: test with VW ID4, two distinct Audi Q8 identities, unassigned wallbox, disconnected charger, idle vehicle, non-EV flexible load and actual charging. Validate correct images from canonical visual_ref and generic producer navigation registration.

## Further findings — track without pretending resolved

- **E-FLOW-03**: screenshot shows Summary Demand unavailable while Power Flow Card Plus shows Site Consumption; compare native site metric vs Home/Site canonical property authority. Do not back-calculate Home Consumption.
- **E-FLOW-04**: verify storage totals, contribution/aggregation and the Home Battery card from the same canonical object and status (zero vs unknown).
- **E-FLOW-05**: review desktop, phone and tablet identity hierarchy, spacing, linked-object affordances, text overflow and fallbacks on the target HA runtime.
- **E-FLOW-06**: physical power must not be attributed to a vehicle from mere charger assignment: connected identity proof is independent from configured/effective relation. Keep measured charger connection power distinct.
- **E-FLOW-07**: maintain a consistent Energy ↔ Mobility navigation contract for vehicle/charger Details and a predictable Back journey.

## Issue E-PLAN-01 — Previously working forecast and planning disappeared

**Confirmed cause in code:** Energy backend publishes separate effective and RHI deterministic baseline D0/D1 horizon contracts. The UX consumed only effective horizons and did not carry their nested forecast summary into the Outlook view. An unvalidated external planner enters HOLD without erasing the independent baseline.

Source recovery on work branch: explicit read-only baseline horizon, no command authority; restored Forecast / Strategic / Tactical / Operational navigation with Today/Tomorrow; preserve published supply/demand summary, bucket allocations and vehicle identities. Effective plan remains the only source of execution permission.

Runtime proof pending: selected deterministic versus EMHASS HOLD, baseline absent/partial/stale, two batteries, PV, price curves, D0 and D1, totals and per-device allocation.

## Issue E-PLAN-02 — Planner and automation selector

Backend already exposes HA select unique ID rhi_energy:planning:requested_provider and RHI_ENERGY_PLANNER_PROVIDER_CATALOG_V1, with registry-assigned entity ID and native selection/readback. Deterministic planner is SUPPORTED, EMHASS ADVISORY_ONLY, HAEO and EOS DESIGN_ONLY. Canonical automation mode is a separate property-controlled Off/Advice/Automatic selector.

WIP UX presents requested/effective planner and native options alongside existing automation control. Changes use the HA native select service; no frontend-only override or silent execution fallback. Real HA reload, readback, error, HOLD and authorization still need proof.

## Issue E-PLAN-03 — Restore the different planning levels

Forecast: independent source, quality and provenance. Strategic: goals, constraints and strategy. Tactical: actual D0/D1 buckets, energy demand and sources. Operational: what is active now, next actions, effective plan and command readback. A tomorrow preview must never be treated as an action to execute now.

Full user acceptance, exact previous-working-runtime comparison and cross-device qualification remain open. No merge or release before closure.

## Gates

Static: canonical contract, domain projection, split battery sensor validation, cross-domain visual/navigation, source ownership, public hygiene, test ownership and deterministic build. Record evidence on draft PR only.

Runtime (required before any release decision): physical Home Assistant installation, exact backend state, charging/idle/unknown/reversed flow, verified SoC, two same-model vehicles, unknown/zero values, phone/tablet/desktop, detail navigation/Back, update/rollback, planning control/readback.

**Publication of a TEST CANDIDATE is allowed by the explicit user release request; STABLE promotion is forbidden until physical target-HA validation and all documented release gates pass.**
## E-PLAN-08 / E-PLAN-09 — native forecast & planner controls (rc.14)

- Preserve the native RHI D0/D1 baseline independently of effective provider HOLD. Baseline is a read-only preview, NEVER command-authorizing.
- Forecast, Strategic, Tactical, Operational, and Settings are separate user journeys, with Today/Tomorrow explicit for forecast/tactical. No artificial 48h or derived prices.
- The HA-native planner selector, when published, is persisted through select.select_option and validated by native readback; the backend-owned operating-mode property is used instead of a phantom key. Planners not execution-qualified remain HOLD.
- Companion backend npinguin/rhi-energy #290/#291 and actual deployment of the current backend must be checked before claiming the requested planner selectors, scheduled actions or physical readback are operational.
