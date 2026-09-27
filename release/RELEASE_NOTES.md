# RHI Energy UX v4.3.5 — TEST CANDIDATE

## Cross-domain visual ownership closure

- removes the Energy-owned Mobility visual manifest and all duplicated Mobility vehicle/charger artwork;
- resolves producer-owned `visual_ref` exclusively through the Foundation `RHI_VISUAL_ASSET_REGISTRY_V1` presentation registry;
- preserves canonical producer visual identity when Energy materializes Mobility flexible assets;
- fails unknown/unregistered producer visuals closed to a neutral presentation fallback instead of showing the wrong Energy or real-product image;
- adds anti-drift gates that reject producer model/image-key mappings in Energy source;
- adds synthetic future-product coverage proving a new registered producer visual needs no Energy model-specific code.

## Required package set

- Foundation **F1.8.23+** for registry presentation locators;
- Energy backend **E0.15.69+**;
- Mobility backend **M0.10.19+** when Mobility producer visuals are present.

## UX scope

- no tabs removed or renamed;
- no Energy capability navigation reduction;
- no change to Energy semantic authority;
- existing Details/Diagnostics depth remains available.

## Qualification

This is an immutable TEST CANDIDATE only after repository validation passes. Target Home Assistant proof remains required for stable promotion, including real Mobility flexible-asset visuals, refresh/restart, arbitrary dashboard root, upgrade from v4.3.4 and rollback to v4.3.4.
