# RHI Energy UX v4.3.9 — TEST CANDIDATE

## Connection identity and visual ownership closure

- one physical charger now produces exactly one Charging connections row;
- charger identity is keyed only by canonical charger asset_id; vehicle assignment is context, not a second connection identity;
- producer-owned Public V2 connection rows outrank Energy-local charger projections;
- Mobility-owned charger visual_ref can no longer be overwritten by an Energy projection during materialization;
- assigned vehicle visual_ref remains Mobility-owned and is resolved generically through the Foundation visual registry;
- Physical consumers remain target-side assets only, preserving the 4.3.8 charger->vehicle semantic fix;
- idle and zero-power chargers/vehicles remain visible without duplicate rows.

## Required package set

- RHI UX Core **1.5.1** at `bb275767d9e9672713c00b9e8bd9fde13b9b5962`;
- Foundation **F1.8.25+**;
- Mobility backend **M0.10.19+**;
- Energy backend **E0.15.73+**, tested with **E0.15.75**.

Rollback: **v4.3.8**.

Target Home Assistant qualification must prove:
1. exactly one row per physical charger;
2. no charger rows under Physical consumers;
3. charger and vehicle images resolve from Mobility visual_ref through Foundation registry;
4. no Energy fallback image replaces an explicit Mobility visual_ref;
5. upgrade/reload/restart and rollback work on the exact candidate.
