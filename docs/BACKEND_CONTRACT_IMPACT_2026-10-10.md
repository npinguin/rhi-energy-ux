# Backend contract impact — 2026-10-10

## Authoritative source heads (engineering main)
- Foundation F1.8.43 / commit 7866e2e2d51c3fe2628edaf6b18d443e07e48b91 / Shared Baseline 1.8.5; ADR-017 presentation roles (key, detail, history, planning, configuration, diagnostics); Foundation runtime-passive.
- Mobility M0.10.43 / commit 8f9de7eaa50179d138d621f7d5d82e0fba3b27a8; M0.10.42 retires aggregate Runtime V2 and retains native canonical HA properties, bounded COMMAND_V2 and ENERGY_V2.
- Energy E0.15.114 / commit b684f9f72fcdbe9e20986a4040b6cd17e9d0a98a; E0.15.110 retires Public V2 transport. E0.15.112–114 add native advisory planner selection, EMHASS discovery, canonical configuration and financial results.

## P0 cutover invariants
1. Domain-owned native HA property/publication is the sole product truth. An aggregate Public V2 or Runtime V2 reader is not a permitted fallback.
2. Asset identity, asset type, presentation role/family/section, availability, quality, reason, provenance, editable and write targets are backend-owned, never guessed by UI.
3. Unknown, unavailable, stale, invalid, duplicate and missing are not zero. Multi-asset inputs must be addressed by exact asset identity; no first-match selection.
4. Keep Mobility COMMAND_V2 and ENERGY_V2 as bounded producer/command boundaries where explicitly published; their retention does not authorize aggregate Runtime V2.
5. Distinguish input selection, pending write, confirmed readback and command execution. HACS build success is not target HA product acceptance.
6. Release manifests, COMPATIBILITY, qualification, test fixtures and dist checksum must all describe the same released authority and source commits.
7. Target HA proof requires eight Mobility assets; Energy live consumption, gas, solar, multi-battery, meter, planning D0/D1, value, profiles/strategies and save/readback; transitions on reload/rename/outage/recovery and mobile/tablet/desktop.
8. Do not promote before native identity/coverage proven on the exact backend candidates and target HA instance.

## Latest backend deltas
| Producer | Change | UX consequence |
|---|---|---|
| Foundation F1.8.43 | Explicit presentation metadata, change-scoped projectors | Render literal presentation ownership; no key-name heuristics; test metadata updates |
| Mobility M0.10.42 | Runtime V2 aggregate removed | Replace runtime asset discovery and relationship lookup with native canonical identities; retire aggregate readers |
| Mobility M0.10.43 | Capability Service, product-vs-engineering visibility | Show product-placed offerings; keep intentionally hidden engineering fields out of 'missing' diagnostics |
| Energy E0.15.110 | Public V2 removed | Remove public V2 gateway and dependent screen projections |
| Energy E0.15.112 | Provider-selected deterministic/native EMHASS advisory | D0/D1 buckets, provider, source and policy/hold status need native planning adapter |
| Energy E0.15.113–114 | Official Supervisor EMHASS discovery; canonical config offerings | UI must not request duplicate technical configuration; reuse backend-published editable descriptors |

## Actual UX branch contract drift
- Energy UX 4.3.36-rc.1 release/product.json: RHI_ENERGY_PUBLIC_CONTRACT_V2, E0.15.112, F1.8.42, M0.10.41: obsolete compared with current code and backend.
- Mobility UX 1.0.0-rc.88 release/product.json: MOBILITY_PUBLIC_RUNTIME_V2, M0.10.41: obsolete.
- Both source manifests still bundle legacy access paths. Strict gate rightly blocks HACS validation.
- Previously published versions must not be called functionally qualified.

## Engineering closure order
A. Exhaustive active source dependency inventory, including Energy screen template.
B. Native gateway/interface and asset identity projections with explicit duplicate/availability diagnostics.
C. Replace all screen adapters while preserving capability parity (including D0/D1 totals, net financial result, strategies, readback and Mobility connections).
D. Realistic end-to-end fixture across both domains, then browser/target HA and rollback.
E. Regenerate immutable dist, synchronize release manifests and compatibility; rerun CI and HACS qualification. Do not only edit release metadata to hide an incompatible contract.

Status: OPEN — this document is an engineering impact baseline, not implementation completion or target HA proof.
