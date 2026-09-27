# RHI Energy UX v4.3.8 — TEST CANDIDATE

## Physical consumer chain closure

- defines Charging connections as charger/infrastructure rows and Physical consumers as the connected target assets;
- projects `connection.asset_id -> connected_asset_id/connected_consumer_id` directionally instead of allowing the charger to reappear as its own consumer;
- excludes charger object types and canonical charger ids from the Physical consumers list;
- materializes assigned vehicles from the exact connection snapshot so idle 0 kW vehicles remain visible;
- preserves non-charger flexible consumers such as thermal/outdoor loads;
- preserves Mobility-owned vehicle and charger `visual_ref` and resolves both only through the Foundation visual registry;
- treats Mobility `asset_connected` as a connected state;
- fails closed to a neutral empty visual when a producer `visual_ref` is not registered; Energy-owned fallback artwork is not used for cross-domain assets.

## Required package set

- RHI UX Core **1.5.1** at `bb275767d9e9672713c00b9e8bd9fde13b9b5962`;
- Foundation **F1.8.25+**;
- Energy backend **E0.15.73+**, tested with **E0.15.74**;
- Mobility backend **M0.10.19+**.

Rollback: **v4.3.7**.

Target Home Assistant qualification must prove the full visible chain:
**charger image/name -> assigned vehicle image/name -> vehicle as Physical consumer**, including idle 0.0 kW.
