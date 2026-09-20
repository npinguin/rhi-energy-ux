# RHI Energy UX v3.94.9 — TEST CANDIDATE

## Scope

Small audit-closure release over v3.94.8.

- one public-interface registry owner for product entity identity;
- removes screen/runtime owner selection through direct `sensor.energy_*` checks;
- adds engineer handover governance;
- aligns evergreen architecture and maintainability documentation;
- adds executable bundle-load smoke coverage;
- strengthens architecture drift checks;
- keeps the compact footer and E0.15.12 backend-version ownership unchanged.

No Energy business semantics are added or reinterpreted.

## Compatibility

- Energy UX: 3.94.9
- Minimum backend: E0.15.12
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.8

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
