# RHI Energy UX v4.0.1 — Retrospective V2 boundary hotfix TEST CANDIDATE

## Scope

4.0.1 fixes the runtime render defect discovered after the 4.0.0 V2-only release.

- removes the final retired V1 `retrospective` contract lookup from Energy UX;
- makes Retrospective fail closed when E0.15.48 does not publish canonical retrospective evidence;
- prevents Overview from failing merely because Retrospective is unavailable;
- keeps `RHI_ENERGY_PUBLIC_CONTRACT_V2` as the sole Energy product-state contract;
- adds a regression gate so `contractGateway().state('retrospective')` cannot return;
- preserves the 4.0.0 selector/projector architecture and zero legacy product references;
- accepted technical debt: 0;
- accepted feature debt: 0.

## Compatibility

- Energy UX: 4.0.1
- Required/tested Energy backend: E0.15.48
- Product contract: RHI_ENERGY_PUBLIC_CONTRACT_V2
- Rollback release: v4.0.0

Target Home Assistant runtime qualification and rollback proof remain mandatory before stable promotion.
