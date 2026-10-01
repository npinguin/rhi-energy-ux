# RHI Energy UX 4.3.23 — HIERARCHY_AND_PRODUCER_VISUAL_CLOSURE

UX-only hotfix on the coordinated backend baseline **Foundation F1.8.35 / Mobility M0.10.25 / Energy E0.15.87 / UX Core 1.5.5**.

This release contains exactly two product fixes:

- **Hierarchy:** Children render as full-width sibling stacks below the parent object instead of recursively nesting cards inside cards. Inverter → string → optimizer/panel therefore keeps usable width at every level, and the redundant INVERTERS wrapper is removed.
- **Consumers visual identity:** managed vehicle cards preserve the producer-published Mobility `visual_ref` through Energy object enrichment. The selected/published vehicle image is used when registered; the generic fallback is used only when no producer visual can be resolved.

No backend semantics, planning rules, command authority or Energy/Mobility contracts change in this release.

Rollback: **v4.3.22**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant visual qualification remains required before stable promotion.
