# v4.1.1 — RHI UX Core 1.3 convergence TEST CANDIDATE

Energy UX now consumes the pinned RHI UX Core 1.3.0 baseline for all shared presentation layers: domain shell, page hero, status grid and technical footer.

Shared ownership:
- Core: tokens, shared domain shell, canonical company branding, page hero, status grid and technical footer presentation.
- Energy: Public V2 contract, projections, domain semantics, navigation metadata, screen composition, interactions and runtime issue evidence.

There is no Home Assistant runtime dependency on rhi-ux-core. Core is bundled into the Energy artifact.

RHI UX Core source commit:
`0078ecae433892e90693014c3f34bec2c1bba62d`

Backend compatibility:
- minimum E0.15.52
- tested E0.15.53
- Public V2 + RHI_ENERGY_CORE_V1 required

Rollback: v4.1.0

Target Home Assistant runtime proof remains mandatory before stable promotion.
