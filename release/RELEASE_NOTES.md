# RHI Energy UX 4.3.20 — CORE_1_5_4_STRUCTURAL_CLOSURE

- Publish the already-merged Energy UX structural closure as a new immutable candidate instead of reusing v4.3.19.
- Consume UX Core 1.5.4 as the authoritative picker geometry and shared presentation primitive.
- Keep appearance lifecycle consistent: select → immediate pending visual → authoritative backend readback → confirm/revert.
- Include the merged compact asset-card, footer/settings, Consumers/Gas and canonical Solar hierarchy improvements.
- Qualify compatibility against Energy E0.15.85 while preserving E0.15.84 as the minimum supported backend.
- Do not implement Energy UX #139 frontend workarounds; Overview/Flow/Operational/Tactical closure remains dependent on backend runtime acceptance.

Rollback: **v4.3.19**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target Home Assistant qualification remains required before stable promotion.
