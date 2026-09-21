# RHI Energy UX v3.94.24 — HACS full-tree delivery correction + shared top-navigation alignment TEST CANDIDATE

## Scope

This candidate closes the confirmed HACS clean-install packaging defect and aligns the first-level RHI navigation geometry with Mobility. Energy semantics, backend contracts, routes, planning meaning and user actions are unchanged.

## HACS delivery correction

- GitHub Release remains HACS-visible but contains **zero assets**.
- The immutable Git tag owns the complete `dist/` package.
- `content_in_root: false` retains the standard nested `dist/` plugin layout.
- Candidate publication and stable promotion fail if any GitHub Release asset exists.
- HACS install simulation models actual tagged-release selection before installing the `dist/` tree.
- Qualification remains repository-governed and is never uploaded as a release asset.

## Shared top navigation

- Energy / Intelligence / Insights use three equal-width primary navigation columns.
- Primary navigation buttons are centered inside their columns.
- Tablet spacing is tightened so the Insights item cannot clip into the Robotix company-brand area.
- Company logo geometry and second-level navigation remain unchanged.

## Compatibility

- Energy UX: 3.94.24
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.23

Target Home Assistant qualification must prove a clean HACS install, complete `rhi-energy-ux.js + assets/` delivery, correct desktop/iPad rendering and browser refresh.
