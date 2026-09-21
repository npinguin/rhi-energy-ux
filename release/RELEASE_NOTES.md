# RHI Energy UX v3.94.22 — TEST CANDIDATE

## Scope

Cross-package UX usability and browser-cache correction over v3.94.21. No Energy backend semantics, routes, planning logic, commands, header geometry or brand artwork change.

- increases the shared footer to a readable 11px desktop / 10.5px phone with full opacity;
- replaces hover-only issue disclosure with an expandable `issues · details` control;
- expanded footer details show the concrete runtime/backend conditions, backend release and contract context;
- keeps one concise warning/error summary in the normal footer;
- versions the externally loaded company-logo URL with the UX package version so Chrome cannot reuse a stale logo URL across HACS upgrades/reloads;
- keeps the canonical logo asset itself unchanged;
- updates shared regression/documentation so Energy and Mobility use the same footer and asset-refresh contract.

## Compatibility

- Energy UX: 3.94.22
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.21

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
