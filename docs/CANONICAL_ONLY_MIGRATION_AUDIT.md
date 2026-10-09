# P0 — Canonical-only frontend migration audit (2026-10-09)

Status: **OPEN / preparation only**. Branch is not releasable. Canonical replacement IDs and attributes are **not assumed**.

## Architectural decision
Runtime presentation path: domain-owned canonical state → native HA devices/entities → Energy gateway → scoped view models → components.
**No** Public V2 reader, dual-contract gateway, reverse relationship lookup, derived totals or fallback arithmetic. Do not remove backend-to-backend producer contracts.

## Verified active dependencies (main, 2026-10-09)
| Frontend consumer | Current source | Canonical replacement | Backend owner | Required properties | Availability | Migration status |
|---|---|---|---|---|---|---|
| `src/runtime/public-interface-registry.js` | `sensor.rhi_energy_public_contract_v2` via `UX_INTERFACES.publicV2` | Native Energy canonical HA entities; exact mapping pending catalog | Energy | Asset/object identity, properties, availability, reason, freshness, provenance, placement | Not independently verified | BLOCKED — replace entrypoint |
| `src/runtime/energy-contract-gateway.js` | Contract-key resolution and cached Public V2 envelope | Bounded native entity selector indexed by backend-provided canonical asset/property identity | Energy | Stable IDs, revision/change detection, quality metadata | Pending native contract | BLOCKED — refactor gateway |
| `src/domain/planning/planning-contract.js` | `readEnergyPublicV2(gateway)`, `planning.horizons`, `planning.assets`; source marker is `RHI_ENERGY_PUBLIC_CONTRACT_V2.planning.horizons` | Native, Planning-owned D0/D1 properties and asset outcomes | Energy | Planning horizon totals, lane totals, buckets, asset results, incomplete reasons | Backend release pending | BLOCKED — no UX totals calculation |
| `validation/test_energy_contract_gateway.js` | Test fixture injects `RHI_ENERGY_PUBLIC_CONTRACT_V2` aggregate and asserts Public V2 entity | Canonical native entity fixture and fail-closed missing-field tests | Energy / UX | Exact published native metadata | Pending contract | REWRITE REQUIRED |
| `docs/CONTRACT.md` | Describes `sensor.energy_planning_index` and `sensor.rhi_energy_public_contract_v2` as product owners | Canonical presentation boundary | Energy / UX | Actual published identifiers and write/readback descriptors | Pending contract | DOCUMENTATION DRIFT |

## Workstream A
- [ ] Enumerate *all* runtime references to Public V2, snapshot JSON, caches, legacy revisions and semantic fallback chains; extend this initial verified sample into an exhaustive inventory.
- [ ] Replace Public V2 gateway with canonical-only, bounded native HA entity selection when exact contract is published; never invent entity IDs.
- [ ] Add independent regression fixtures for missing/unknown/zero/unavailable/not-applicable and structural addition/removal.
- [ ] Make component render invalidation dependency-scoped and benchmark repeated identical HA state, scalar change and closed surfaces.
- [ ] Independently address iOS Safari widths, responsive wrapping, image sizing, appearance hierarchy.
- [ ] Keep missing canonical truth visibly blocked as contract gap rather than backfill.

## Backend acceptance dependencies
Energy #240 and #241 must publish exact canonical native HA identifiers, attributes, command/write boundaries, planning totals and financial truth before the integration cutover. Do not infer Foundation Shared Baseline adoption; verify each domain manifest and catalog separately.

## Release gate
No candidate promotion before actual backend candidate publication and same-instance HA integration/performance/rollback evidence. Zero accepted technical and feature debt. This audit is **not** runtime proof.

## Coordinated P0 release gates — blocking
Six issue program: Foundation #109/#111; Mobility #246/#247; Energy #240/#242.

1. Domain model first: normalized property changes must update domain model, canonical catalog, HA materialization and bidirectional Validate canaries in the same backend PR.
2. Backend complete: exact public native entity/unique IDs, attributes, typed state/quality/freshness, placement, invoke and terminal readback; missing capability stays open at owning backend issue.
3. Backend validated: Foundation, Mobility and Energy CI PASS, no active retired aggregate transport in UX/HA hot path, no shadow semantic authority.
4. Backend released: immutable tested backend tags, full SHA and baseline-adoption manifests for all three domains; confirm identities rather than assuming.
5. UX validated: all critical screens and actions use native canonical entities only; absent backend truth is visible contract gap.
6. Joint qualified: one HA instance, install/upgrade, dynamic asset lifecycle, reload/restart, outages, write/readback, rollback, iPhone/iPad/desktop and measured event→gateway→component processing. Backend CPU ≤25% target must be assessed in same qualification.

**No premature closure:** backend CI green alone is not product acceptance. Keep WIP backend decommission PRs blocked until canonical replacement is proven. Technical debt acceptance = 0; feature debt acceptance = 0. Never substitute frontend logic for missing backend semantics.
