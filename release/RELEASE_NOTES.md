# RHI Energy UX v4.0.3 — Public V2 compatibility closure TEST CANDIDATE

## Scope

4.0.3 fixes the pilot-blocking compatibility defect found in target Home Assistant after v4.0.2.

- corrects the minimum backend from E0.15.48 to E0.15.52, where the canonical Public V2 core/pilot contract is actually published;
- validates the presence of RHI_ENERGY_CORE_V1 before treating the Energy product contract as renderable;
- reports an explicit incompatible-backend state instead of rendering an apparently valid dashboard full of unavailable values;
- preserves V2-only product ownership and does not fall back to legacy sensor.energy_* surfaces;
- preserves null/unavailable semantics and prohibits missing data from becoming 0;
- keeps E0.15.53 as the tested canonical-interface-authority backend;
- accepted technical debt: 0;
- accepted feature debt: 0.

## Compatibility

- Energy UX: 4.0.3
- Minimum Energy backend: E0.15.52
- Tested Energy backend: E0.15.53
- Product contract: RHI_ENERGY_PUBLIC_CONTRACT_V2
- Required core contract: RHI_ENERGY_CORE_V1
- Rollback release: v4.0.2

Target Home Assistant runtime qualification and rollback proof remain mandatory before stable promotion.
