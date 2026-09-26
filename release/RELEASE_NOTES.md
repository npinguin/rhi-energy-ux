# v4.0.4 — Public V2 runtime acceptance hotfix TEST CANDIDATE

v4.0.4 fixes the target-runtime blocker exposed by Home Assistant testing of v4.0.3.

The backend publishes the canonical entity `sensor.rhi_energy_public_contract_v2` without a `contract_visibility` attribute. v4.0.3 incorrectly required `contract_visibility=ux_safe` before allowing the exact canonical entity through the UX gateway, so the frontend reported “Energy Public V2: Entity Is Not Available” even when the backend-owned sensor was present.

This release removes that duplicate transport gate. Runtime acceptance is now:

`exact canonical entity id → contract_id validation → RHI_ENERGY_CORE_V1 validation → required core sections → projections`.

It also removes misleading “Producing now” / forecast labels when Solar values are unavailable.

Required backend: E0.15.52+
Tested backend: E0.15.53
Rollback: v4.0.3

Target Home Assistant runtime proof remains required before stable promotion.
