# RHI Energy UX 4.3.24 — BORDERED_HIERARCHY_GROUPS

UX-only hierarchy closure on the coordinated backend baseline **Foundation F1.8.35 / Mobility M0.10.25 / Energy E0.15.87 / UX Core 1.5.5**.

This release keeps the 4.3.23 product fixes and adds the hierarchy presentation rule validated in target review:

- **Solar Production is the hierarchy root object.** It is no longer wrapped in a second Solar Production section/card.
- **Children stay full width.** Opening Children shows the child group directly below the parent instead of progressively narrowing content.
- **Hierarchy uses compact bordered groups, not recursive indentation.** Parent and children remain visually related without a Russian-doll layout.
- **Child objects remain vertically stacked.** Inverter → string/zone → optimizer/panel preserves usable width at every depth.
- Existing object grammar remains **Visual → Key properties / Quick Actions → Configuration → Details → Diagnostics → Children**.
- Producer-published Mobility vehicle visuals remain authoritative for managed consumers.

No backend semantics, planning rules, command authority or Energy/Mobility contracts change in 4.3.24.

Rollback: **v4.3.23**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant visual qualification remains required before stable promotion.
