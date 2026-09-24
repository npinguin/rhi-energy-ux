# RHI Energy UX v3.96.0 — canonical Energy asset context TEST CANDIDATE

## Scope

Focused Energy-only contract and ownership closure over v3.95.4.

The UX now consumes the additive Energy Public Contract V2 asset context introduced by backend E0.15.31. This is deliberately small: one canonical asset-profile reader, one publication-evidence reader and removal of name/power-based Flexible Asset semantic inference.

## Contract and ownership

- Backend Energy owns canonical `asset_type`, read-only `profile_id`, profile catalog and publication evidence.
- Foundation remains the technical discovery/selection owner.
- Mobility remains owner of vehicle/charger physical execution and producer truth.
- Energy UX owns presentation only.
- Asset profiles are `domain_asset_type` context, not manufacturer/model/SKU identity.
- No profile picker is rendered while the backend profile contract is read-only.
- Missing V2 publication evidence never falls back to V1.
- Flexible Asset storage identity is no longer inferred from labels.
- Flexible Asset operating state is no longer inferred from power thresholds.

## Compatibility

- Energy UX: 3.96.0
- Required/tested Energy backend: E0.15.31
- Existing V1 compatibility surface: R1.89.44_CONTRACT
- Accepted technical debt: 0
- Accepted feature debt: 0
- Rollback release: v3.95.4

## Qualification

Static/package validation is required before publication. Target Home Assistant proof must confirm V2 asset-profile publication, publication evidence, Flexible Asset state ownership, HACS upgrade and rollback.
