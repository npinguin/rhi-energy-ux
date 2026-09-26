# v4.1.0 — RHI UX Core baseline TEST CANDIDATE

Energy UX consumes a pinned build-time snapshot of RHI UX Core 1.1.0.

Shared ownership:
- Core: tokens, page hero, status grid and generic presentation primitives.
- Energy: Public V2 contract, projections, domain semantics, screen composition and interactions.

There is no Home Assistant runtime dependency on rhi-ux-core. Core is bundled into the Energy artifact.

RHI UX Core source commit:
`480eaef12955d56970ec172fdde6f5fe2e0ab9c6`

Backend compatibility:
- minimum E0.15.52
- tested E0.15.53
- Public V2 + RHI_ENERGY_CORE_V1 required

Rollback: v4.0.4

Target Home Assistant runtime proof remains mandatory before stable promotion.
