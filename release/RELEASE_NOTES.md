# RHI Energy UX v4.0.2 — Gas consumption experience TEST CANDIDATE

## Scope

4.0.2 completes the Gas tab as a first-class Energy-family experience while preserving the canonical V2 ownership boundary.

- replaces the placeholder Gas illustration with a wide Viessmann Vitodens family hero;
- shows measured live flow and the canonical cumulative gas meter without frontend estimation;
- shows daily measured usage through Home Assistant's native 30-day Statistics Graph;
- keeps missing gas truth explicit as unavailable/not configured rather than zero;
- provides setup guidance when the authoritative total-increasing gas meter is absent;
- adds Gas-specific usage/history/meter navigation and conclusion semantics;
- preserves `RHI_ENERGY_PUBLIC_CONTRACT_V2` as the sole Energy product-state contract;
- accepted technical debt: 0;
- accepted feature debt: 0.

## Compatibility

- Energy UX: 4.0.2
- Required/tested Energy backend: E0.15.48
- Product contract: RHI_ENERGY_PUBLIC_CONTRACT_V2
- Rollback release: v4.0.1

Target Home Assistant runtime qualification and rollback proof remain mandatory before stable promotion.
