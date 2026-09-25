# RHI Energy UX v4.0.0 — canonical V2 architecture TEST CANDIDATE

## Scope

4.0.0 makes Energy UX a V2-only product runtime using the same architecture model as Mobility.

- uses `RHI_ENERGY_PUBLIC_CONTRACT_V2` as the sole Energy product-state contract;
- introduces one Home Assistant-aware contract adapter, a normalized V2 store and pure product selectors/projectors;
- routes Overview, Energy assets, Planning, Strategies, Pricing, Value, Activity and Commands through typed projections;
- removes Energy V1 product-index and `script.energy_*` dependencies from UX product runtime;
- keeps Energy domain truth backend-owned: Home Consumption, planning totals, value accounting, command readiness and configuration semantics are never reconstructed in screens;
- preserves UX interaction state across backend refreshes;
- fails closed when E0.15.47 does not publish canonical detail, notably period-energy Metering and physical charging-connection telemetry;
- keeps diagnostic health entities observational only and outside product truth;
- adds release-blocking anti-drift gates for V1 dependencies, raw contract access and selector-boundary bypass;
- accepted technical debt: 0;
- accepted feature debt: 0.

## Compatibility

- Energy UX: 4.0.0
- Required/tested Energy backend: E0.15.47
- Product contract: RHI_ENERGY_PUBLIC_CONTRACT_V2
- Rollback release: v3.99.0

Target Home Assistant runtime qualification and rollback proof remain mandatory before stable promotion.
