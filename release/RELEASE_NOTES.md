# RHI Energy UX v3.97.0 — logical-device visual catalog and picker TEST CANDIDATE

## Scope

3.97.0 brings the Mobility visual-library pattern to Energy logical devices without moving product semantics into UX artwork.

- Adds a representative image catalog partitioned by logical Energy device type.
- Resolves profile/integration context to a same-type representative default.
- Adds a type-safe image picker; batteries cannot select inverter artwork and vice versa.
- Stores the selected appearance as an Energy UX presentation preference while Energy backend profiles remain intentionally non-visual.
- Preserves producer-owned Mobility visual_ref as authoritative for cross-domain flexible loads.
- Routes existing asset rendering through one common Energy asset visual resolver so overview, planning, value and detail surfaces stay aligned.
- Adds CI ownership and contract tests for type partitioning, default resolution, preference persistence and producer visual precedence.
- Adds a Solar hardware experience showing published solar panels, inverters and batteries with image, configuration/profile context and live facts.
- Adds a measured-flow answer panel explaining panel → inverter → Home Bus → battery/grid without inventing solar-versus-grid source allocation.
- Reuses the same product visual resolver in Solar, Battery and Physical Flow so image selection and cropping stay consistent.

## Compatibility

- Energy UX: 3.97.0
- Required/tested Energy backend: E0.15.32
- Energy contract: R1.89.44_CONTRACT
- Mobility producer bundle: M0.10.1
- Rollback release: v3.96.3
- Accepted technical debt: 0
- Accepted feature debt: 0

Target Home Assistant qualification remains mandatory.
