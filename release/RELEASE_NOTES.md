# RHI Energy UX v3.94.15 — TEST CANDIDATE

## Scope

Visual-only navigation refinement over v3.94.14. Information architecture, routes, backend contracts and commands remain unchanged.

- wraps both navigation layers in one shared light premium frame;
- removes the nested double-box visual weight from section and contextual navigation;
- makes the first layer quieter than the contextual second layer;
- uses restrained section accents: Energy blue, Intelligence violet, Insights teal;
- keeps hover and active states subtle, without heavy outlines or shadows;
- preserves horizontal scroll behaviour for contextual navigation on narrow screens;
- keeps the three primary sections visible as one compact row on phone;
- retains all v3.94.14 lifecycle persistence and per-section location memory.

## Compatibility

- Energy UX: 3.94.15
- Minimum backend: E0.15.24
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.14

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
