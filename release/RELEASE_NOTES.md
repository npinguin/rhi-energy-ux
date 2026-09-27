# RHI Energy UX v4.3.9 — TEST CANDIDATE

## Connection identity and visual ownership closure

- renders exactly one Charging connections row per physical charger identity;
- treats charger assignment as context on the charger, never as part of the row identity;
- prevents duplicate charger cards when Public V2, flexible-asset linkage and relationship fallbacks describe the same charger;
- preserves producer-owned Mobility `visual_ref` from the canonical connection row over any Energy-local projected visual;
- keeps Physical consumers on the connected target side, so vehicles/flexible loads remain distinct from charger infrastructure;
- keeps Mobility vehicle/charger artwork resolved only through the Foundation `RHI_VISUAL_ASSET_REGISTRY_V1` registry;
- keeps unregistered producer refs fail-closed rather than substituting Energy semantic artwork.

## Required package set

- RHI UX Core **1.5.1** at `bb275767d9e9672713c00b9e8bd9fde13b9b5962`;
- Foundation **F1.8.25+**;
- Energy backend **E0.15.73+**, tested with **E0.15.75**;
- Mobility backend **M0.10.19+**.

Rollback: **v4.3.8**.

Target Home Assistant qualification must prove:
- four physical chargers render as four Charging connections rows, not eight;
- VW ID4 / other connected vehicles remain under Physical consumers only;
- Wallbox/Peblar/Plug Car and vehicle artwork is resolved from Mobility-owned `visual_ref` through Foundation;
- refresh/reload/restart and rollback preserve the same result.
