# Energy Backend-to-UX Contract — Canonical Native Boundary

## Single-source rule

The backend owns product semantics. The UX reads producer-owned native HA property entities and domain-owned native metrics, and it never computes missing business values, assumes asset identity or uses a retired aggregate as fallback. `sensor.rhi_energy_public_contract_v2` is **retired producer transport** and remains an explicit migration blocker where still referenced in UX source.

## Canonical property entity

The current Energy backend materializes `RHI_ENERGY_CANONICAL_PROPERTY_V2` properties with `asset_id`, `logical_object_class`, `parent_asset_id`, `asset_display_name`, `property_key`, `availability`, `quality`, `value`, `presentation_family`, `presentation_role`, `presentation_surface`, editable/write metadata and exact source provenance. These are backend-owned attributes. Duplicate `asset_id::property_key` publishers are invalid product truth. A missing property does not imply zero or an absent asset.

## Native domain metrics

Identify by the exact **pair** `canonical_source=rhi_energy.runtime` and `metric_key`, not an assumed `entity_id`. Reject absent/multiple/invalid/stale publication. Current backend keys:

- `home_consumption_power_kw` — current Home Consumption, in kW.
- `planning_today_{required_kwh,planned_kwh,still_to_plan_kwh,flexible_required_kwh,flexible_planned_kwh,flexible_still_to_plan_kwh}`.
- `planning_tomorrow_{required_kwh,planned_kwh,still_to_plan_kwh,flexible_required_kwh,flexible_planned_kwh,flexible_still_to_plan_kwh}`.
- `net_financial_result_eur` — for the explicit backend-selected `period` only; `actual_complete`, `availability`, `quality`, `reason_code` and `provenance` are not optional guesses.

No frontend aggregation of these totals and no claiming unselected periods from the selected-period metric. Known zero and absent values remain distinct.

## Planning horizons

`RHI_ENERGY_PLANNING_HORIZON_V1` may supply provider, plan ID, buckets, planning assets, source/consumer lanes, balance and execution policy when exactly one producer-owned horizon for D0/D1 is present. **Backend Energy #249 remains open.** Without that publication, present native totals and an explicit gap for detailed buckets and per-asset outcomes. Do not invent combined totals, execution intent or allocations.

## Configuration and actions

Canonical editable properties must publish the service target, operation, allowed values/constraints, applicability and readback authority. An accepted service call is not proof of saved configuration: show pending until confirmed canonical readback; on failure keep editor content and surface the reason. Commands must come from an exact domain-owned command contract, not an inferred script or entity naming rule. Missing configured/effective strategy differentiation is a contract gap, never a UI heuristic.

## Product evidence still required

- Backend-native full D0/D1 horizon coverage and financial period attribution (Energy #242/#249).
- Real HA multi-battery, solar, grid, gas, home consumption and flexible consumer identity/availability.
- Strategy/price/metering/appearance edit, invoke, error and persistence readback.
- Installation, upgrade, reload/restart, outage/recovery, responsive UI and rollback.

**Qualification status:** see `release/QUALIFICATION.json`. No target Home Assistant result is implied by passing static tests.
