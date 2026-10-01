# RHI Energy UX 4.3.25 — FLAT_HIERARCHY_SECTION_PARITY

UX-only hierarchy correction on **Foundation F1.8.35 / Mobility M0.10.25 / Energy E0.15.87 / UX Core 1.5.5**.

This release corrects the two remaining Solar hierarchy issues found in target review:

- **Home Battery and Solar Production use the same top-level section shell.** Solar Production is no longer a special lower-level root block.
- **Children expand below the parent, not inside a nested visual container.** Inverter, string/zone and optimizer/panel objects stay in one full-width vertical content column.
- **No recursive bordered child groups.** Semantic hierarchy is preserved through Children, Part of and object type labels rather than Russian-doll card geometry.
- **Every child keeps full usable width.** Opening deeper Children does not progressively narrow content.
- Existing object grammar remains **Visual → Key properties / Quick Actions → Configuration → Details → Diagnostics → Children**.

No backend semantics or contract changes are introduced by 4.3.25.

Rollback: **v4.3.24**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant visual qualification remains required before stable promotion.
