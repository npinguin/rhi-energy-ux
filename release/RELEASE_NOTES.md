# RHI Energy UX v3.94.8 — TEST CANDIDATE

## Scope

This is a narrow UX release closure over v3.94.7.

- compact quiet footer while healthy;
- current UX version from the UX package;
- current backend version only from `sensor.energy_release_contract.backend_release`;
- warning/error colour only when an actual runtime/interface problem exists;
- technical problem details only in the warning tooltip;
- foolproof HACS installation and dashboard migration instructions;
- automatic immutable HACS TEST CANDIDATE publication after a green main merge;
- manual stable promotion only after exact target Home Assistant qualification and rollback proof.

No Energy business semantics are implemented or inferred by the UX.

## Compatibility

- Energy UX: 3.94.8
- Minimum backend: E0.15.12
- Existing public compatibility surface: R1.89.44_CONTRACT
- Previous rollback release: v3.94.7

## Release gates

The candidate may be published only after source/package tests, reproducible dist and HACS validation pass.

Stable promotion remains blocked until `release/QUALIFICATION.json` records target Home Assistant runtime proof and rollback proof as PASS with zero accepted technical debt and zero accepted feature debt.
