# RHI Energy UX v3.94.16 — TEST CANDIDATE

## Scope

Visual-only correction over v3.94.15 to match the approved premium navigation concept more closely. No backend semantics, routes or commands change.

- moves Home Intelligence identity into the shared navigation card instead of a separate breadcrumb above it;
- gives the first navigation row the approved premium proportions and spacing;
- adds lightweight section icons to Energy, Intelligence and Insights;
- keeps the active primary section as the dominant pill and the contextual second row as the supporting layer;
- keeps both layers inside one shared card with a single outer frame and a subtle divider;
- increases desktop/tablet whitespace and visual hierarchy while remaining compact on phone;
- preserves the approved two-level information architecture, lifecycle persistence and per-section memory;
- does not add mockup-only account/profile or system-online controls.

## Compatibility

- Energy UX: 3.94.16
- Minimum backend: E0.15.24
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.15

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
