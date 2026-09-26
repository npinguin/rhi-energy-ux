# v4.1.1 — Core-owned company branding TEST CANDIDATE

Energy UX consumes RHI UX Core 1.3.1 build-time and receives the canonical Robotix.be company brand from Core.

Ownership:
- Core: canonical company logo, brand rendering/geometry, shared presentation primitives and tokens.
- Energy: Energy semantics, Public V2 projections, screen composition and interactions.

No separate rhi-ux-core Home Assistant resource is required. The Core snapshot is bundled into the Energy artifact.

RHI UX Core source commit:
`13fc1e1b07f3fcfe9aac960471b74cfd0e96a8b9`

Backend compatibility remains unchanged: minimum E0.15.52, tested E0.15.53.
Rollback: v4.1.0.

Target Home Assistant runtime proof remains mandatory before stable promotion.
