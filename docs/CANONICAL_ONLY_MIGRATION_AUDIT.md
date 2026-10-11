# Energy UX — Native canonical-only migration / recovery evidence

**Source migration:** complete on `work/ux-structural-closure-20261011` for bundled product-runtime consumers, pending branch Validate/merge.
**Release status:** HACS `v4.3.36-rc.2` TEST CANDIDATE; **joint target Home Assistant acceptance remains NO-GO**. This status is not permission to mark `release/QUALIFICATION.json` as passed.

## Single-source architecture

Energy E0.15.116 → exact native HA `RHI_ENERGY_CANONICAL_OBJECT_V2`, `RHI_ENERGY_CANONICAL_PROPERTY_V2`, `RHI_ENERGY_CANONICAL_COMMAND_V1`, `RHI_ENERGY_PLANNING_HORIZON_V1` and native `metric_key` → Energy gateway + property/object index → domain selectors / view models → RHI UX Core components.

- Retired `RHI_ENERGY_PUBLIC_CONTRACT_V2` and `sensor.rhi_energy_public_contract_v2` may be referred to **only in historical documentation**, never consumed by bundled source. `npm run check:canonical-only` is mandatory in the package gate.
- No integration-specific HA entity names, guessed devices, inferred financial/planning totals, stale-property backfill or duplicate-authority preference.
- Both object and property publishers are indexed. A conflicting asset or `asset_id::property_key` fails closed, as do missing, invalid and stale native metrics. Multiple physical batteries with the same `property_key` remain distinct scoped assets.
- User navigation presence is from structural object/configuration rows, not the latest measurement. An installed but currently idle or unavailable asset remains discoverable.
- Canonical button commands publish an exact target, service, `supported`, `visible`, `execution_allowed` and availability; UX cannot elevate readback or bypass backend execution gates.

## Verified implementation and regression owners

| Product concern | Canonical authority | Automated protection |
|---|---|---|
| Home Consumption | unique numeric `home_consumption_power_kw` | `validation/test_current_energy_view_model.js` |
| D0/D1 planning and incomplete quality | native per-horizon numeric metrics and effective `attributes.details` | `validation/test_planning_contract.js` |
| Battery identity, children, source visual | canonical object/property entities | `validation/test_energy_v2_projection.js`, `validation/test_native_energy_backend_interfaces.js` |
| Pricing and strategy editors | canonical configuration property + backend write/readback | `validation/test_native_energy_backend_interfaces.js`, property/control gates |
| Charging commands | canonical button command entity and exact invocation | `validation/test_command_contract.js` |
| Period financial result | uniquely published `net_financial_result_eur` and exact `period` | `validation/test_planning_contract.js`, projection test |
| Structural capability presence | object/configuration inventory, not telemetry | `validation/test_structural_capability_presence.js` |
| No old transport or generated drift | source manifest audit, zero-debt and committed `dist/` | `npm run check:canonical-only`, `npm run validate`, `tools/check-committed-dist.mjs` |

## Outstanding product/runtime acceptance (not waived)

1. Real target-HA deployment of the **same immutable** Foundation F1.8.44, Energy E0.15.116, Mobility M0.10.44, Energy UX rc.2 and Mobility UX rc.90. Confirm actual installed config entries and artifact SHAs.
2. Home Consumption and battery hierarchy with multiple battery units; no wrong placeholder identity or guessed source-device connection.
3. Effective D0/D1 provider results: buckets, flexible-load totals, per-asset allocations and incomplete statuses. No totals silently synthesized from render data.
4. Edit pricing, strategies, metering and visual appearance; save→service result→canonical terminal readback→refresh/reload/restart, failure/revert handling.
5. Physical vs assigned/effective charger identity; commands visible and executable only under backend gates; command lifecycle and Activity chronology.
6. Period-scoped Metering/Retrospective, financial attribution and charging relationships need complete producer evidence where currently unpublished. Missing backend semantics remain reported as contract gaps. A blank panel or fake zero is not an accepted substitute.
7. Responsive iPad/iPhone/desktop visual parity, installation/upgrade from previous immutable HACS tags, rollback, cache refresh and repeated HA update performance.

**Publish policy:** test candidate source/package validation is necessary but is not stable product qualification. Stable promotion requires evidence recorded under `release/QUALIFICATION.json` and reviewed together across five runtime packages. No green CI or renaming exercise substitutes for this.

## Historical migration context

This work supersedes the previous 2026-10-09 dependency inventory that counted 36 retired Public V2 references. References in old handovers and legacy backend interface discussions are historical, not a supported runtime compatibility path.
