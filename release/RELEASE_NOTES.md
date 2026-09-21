# RHI Energy UX v3.94.19 — TEST CANDIDATE

## Scope

Structural company-brand ownership correction over v3.94.18. No Energy backend semantics, routes, planning logic or command ownership change.

- replaces the synthetic company-logo artwork with a vector trace derived from the approved Robotix artwork supplied for this release;
- makes `source/assets/company-logo.svg` the single canonical company-brand source;
- makes the build synchronize canonical source assets byte-for-byte into `dist/assets`;
- keeps runtime branding as an external HACS-owned asset instead of drawing or reconstructing it in component code;
- removes CSS colour filtering/reinterpretation from the company mark;
- adds a branding governance gate that pins the approved asset hash and verifies source/distribution parity;
- preserves the approved premium header composition and compact secondary-navigation icons.

## Compatibility

- Energy UX: 3.94.19
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.18

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
