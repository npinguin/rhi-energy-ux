# Home Intelligence Energy UX Architecture

## Product purpose

Energy answers five user questions: **What is happening? Why? What is planned? Do I need to act? What was the outcome?** Product navigation follows Overview → Details → Actions → Configuration → Diagnostics, with Intelligence and Insights as meaningful user-level destinations. Screens should be calm, responsive and actionable without concealing unavailable truth.

## Contract authority — canonical-only target

```text
Energy domain model and canonical runtime
  → native HA canonical property entities + domain-owned native metrics
  → Energy runtime boundary / scoped index
  → domain-owned planning, consumption, asset and value projections
  → view models → reusable UI → screens
```

Backend owns identity, parentage, measured facts, period ownership, presentation family/surface, availability, quality, provenance, editing descriptors, command applicability, financial and planning semantics. UX owns selection, literal metadata grouping, formatting, rendering and permitted interaction. Never infer a physical relationship from an entity name, manufacture a zero, calculate planning totals, or apply optimistic write values as actual readback.

### Current implementation status (2026-10-11)

The canonical property index and native metric readers are implemented. Per-asset parent/HA source identity is preserved; Home Consumption uses `home_consumption_power_kw`; native D0/D1 totals use `planning_today_*` and `planning_tomorrow_*`; `net_financial_result_eur` is accepted only for the exact backend-selected period. Missing, duplicate, stale and invalid values fail closed. The UI now uses these native readers in additional product paths.

**This is not yet a canonical-only release.** `src/runtime/public-interface-registry.js`, `src/runtime/energy-contract-gateway.js`, `src/runtime/energy-v2-contract.js` and remaining `src/app/energy-card.js`/selector paths still consume the retired Public V2 aggregate. These must be removed as complete vertical changes, with parity tests and no replacement snapshot. The strict audit remains authoritative over the older zero-debt check.

### Native scope and backend gaps

- `RHI_ENERGY_CANONICAL_PROPERTY_V2` — direct per-asset HA property truth, presentation metadata, editing/readback descriptors when published.
- Native `canonical_source=rhi_energy.runtime` / `metric_key` — Home Consumption, D0/D1 totals, selected-period financial result. No guessed entity ID.
- `RHI_ENERGY_PLANNING_HORIZON_V1` — detailed buckets/lanes/asset outcomes only when a uniquely published backend horizon supplies explicit status and buckets. Pending producer closure: Energy #249.
- Physical relationships, full period metering/attribution, effective Strategy/Price, commands and editing depend on exact native producer authority; missing contracts are backend gaps, not frontend calculation tasks. See Energy #240 and #242.

## Layer responsibilities

- `src/runtime/canonical-property-index.js`: bounded native property/metric discovery, producer identity, duplicate and quality rejection, change invalidation.
- `src/runtime/consumption-contract.js`: read native Home Consumption and independently published Site/Flexible consumption without arithmetic.
- `src/domain/planning/planning-contract.js`: backend-owned D0/D1 totals and optional horizon details, no synthetic combined totals.
- `src/runtime/asset-profile-contract.js`: one asset identity from unambiguous native property rows; no asset/profile fabrication.
- `src/domain/models/`: normalized UX meaning from published facts only.
- `src/app/energy-card.js`: screen composition, routing, lifecycle and user interaction. Its long-term decomposition into screen-owned modules is product-supporting refactoring, not permission for a second semantic interpretation.

## Invariants

1. Unknown, absent, unavailable, stale, invalid and duplicate are **not zero**. Known numeric zero remains zero.
2. Unscoped duplicate semantic keys across physical assets must fail closed; exact asset IDs are required for per-asset reads.
3. Parent asset IDs and HA source links must be preserved literally; source devices are never cloned or reparented.
4. Requested/configured values are distinct from actual/backend-confirmed readback.
5. Planning/value numbers and selected period are Energy-owned, not a Mobility or frontend derivation.
6. Render revision invalidation must preserve navigation, editor state and interaction. No full-root churn for routine telemetry.
7. Tests and package are deterministic. `src/manifest.json` is build composition authority, `src/OWNERSHIP.json` source authority, `dist/` generated output; `validation/OWNERSHIP.json` owns regression scope.

## Release rule

No stable release until the strict canonical-only scan, full source/UX/package tests, real target HA behavior (including multi-battery, consumption, plans, strategies, pricing and readback), mobile/tablet/desktop, restart, upgrade and rollback are proven against exact backend SHA/version. See `docs/CANONICAL_ONLY_MIGRATION_AUDIT.md` and `release/QUALIFICATION.json`.
