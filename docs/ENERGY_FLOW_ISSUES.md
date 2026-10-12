# Energy Flow — issue-by-issue UX recovery

Status: **WORK IN PROGRESS — not a release candidate**. No merge, tag or publication is authorized by this document.

## Issue E-FLOW-01 — Home Battery missing from flow

Observed: Power Flow Card Plus diagram contains Grid, Solar and Site Consumption but omits Home Battery; the header may display a numerical battery power with state Unavailable.

Cause: the previous adapter intentionally did not map battery.power_kw because the canonical sign convention does not establish the Power Flow Card Plus charge/discharge directions. Rendering it as signed is unsafe.

Current workbranch fix:
- consumes an explicit, unique, available and unit-compatible **battery.charge_power_kw** and **battery.discharge_power_kw** sensor pair when both are published by Energy's canonical battery_system interface;
- SoC is optional and read only from a unique available percent sensor;
- a battery status row in the Flow panel remains visible even when the pair is unavailable, with a truthful label *Direction not proven*, numeric state where available and direct navigation to Home Battery;
- never synthesizes a directional arrow from battery.power_kw or state text.

Acceptance still open: verify the target backend actually publishes both directional properties. If not, the flow diagram battery circle remains intentionally absent until backend provides explicit direction-compatible data. Verify real charge, discharge, idle and unknown on Home Assistant; do not accept a false line animation.

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

## Gates

Static: canonical contract, domain projection, split battery sensor validation, cross-domain visual/navigation, source ownership, public hygiene, test ownership and deterministic build. Record evidence on draft PR only.

Runtime (required before any release decision): physical Home Assistant installation, exact backend state, charging/idle/unknown/reversed flow, verified SoC, two same-model vehicles, unknown/zero values, phone/tablet/desktop, detail navigation/Back, update/rollback, planning control/readback.

**Do not merge or publish** while additional UX issues are still being reported or runtime acceptance is pending.