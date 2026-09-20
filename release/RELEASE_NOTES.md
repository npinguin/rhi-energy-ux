# RHI Energy UX v3.94.10 — TEST CANDIDATE

## Scope

Canonical-owner closure over v3.94.9 without architecture or feature expansion.

- makes product property reads fail closed on the Public Interface Registry owner;
- removes cross-owner fallback scanning through all public UX entities;
- removes Consumer Mix reconstruction from Flexible Assets;
- resolves product diagnostic interface identity through the Public Interface Registry;
- aligns Metering diagnostics with the canonical `sensor.energy_asset_metering_index` owner;
- adds regression gates for each ownership invariant.

No Energy business semantics, screen scope, command behavior or visual design is added or reinterpreted.

## Compatibility

- Energy UX: 3.94.10
- Minimum backend: E0.15.12
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.9

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
