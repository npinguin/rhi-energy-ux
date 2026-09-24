# RHI Energy UX v3.96.1 — cross-domain Mobility visual_ref TEST CANDIDATE

## Scope

3.96.1 is the consumer-side pilot of the Foundation F1.8.14 visual identity architecture.

Energy E0.15.32 preserves Mobility's package-neutral `visual_ref`. Energy UX resolves that reference only against its own packaged visual catalog and renders the corresponding vehicle or charger on live Energy Flow cards.

## Ownership

- Foundation owns visual registry mechanics and global key validation.
- Mobility owns assignment of `visual_ref` to vehicle/charger semantic assets.
- Energy preserves the producer-owned key without interpreting product identity.
- Energy UX owns its local image files, appearance filters and rendering.
- No Mobility UX URL/path or runtime dependency is introduced.

## Compatibility

- Energy UX: 3.96.1
- Required/tested Energy backend: E0.15.32
- Mobility producer bundle for this pilot: M0.10.1
- Existing Energy compatibility surface: R1.89.44_CONTRACT
- Accepted technical debt: 0
- Accepted feature debt: 0
- Rollback release: v3.96.0

Target Home Assistant qualification remains mandatory.
