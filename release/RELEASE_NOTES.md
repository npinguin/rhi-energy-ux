# v4.3.5 — registry-driven cross-domain visuals TEST CANDIDATE

Energy 4.3.5 removes consumer-owned Mobility visual mappings and makes flexible-asset presentation resolve through the Foundation Visual Asset Registry.

## User-facing changes

- Mobility-owned flexible assets use the producer visual registered through Foundation instead of Energy-owned copies or model mappings;
- a new producer visual can appear in Energy without product-specific Energy code;
- missing/unregistered producer visuals fail to a neutral visual state instead of showing a wrong real product or Energy consumer hero;
- producer visual identity survives Energy flexible-load materialization unchanged.

## Engineering

- consumes `RHI_VISUAL_ASSET_REGISTRY_V1` contract 1.1.0 presentation locators;
- removes the copied Mobility visual manifest and copied Mobility assets from Energy;
- removes `RHI_ENERGY_MOBILITY_ASSET_TRANSPORT`;
- blocks producer-specific Mobility presentation paths/mappings from returning through CI;
- adds a synthetic future-product regression (Volvo EX30) proving zero Energy product mapping is required;
- keeps all existing Energy capability tabs and routes unchanged.

Target stack for qualification:
- Foundation F1.8.23 or newer compatible registry contract;
- Mobility M0.10.19 or newer compatible producer registration;
- Energy E0.15.69 tested backend.

Rollback: **v4.3.4**.

This remains a TEST CANDIDATE until target Home Assistant install, visual registry, flexible-asset rendering, refresh, upgrade and rollback are evidence-backed.
