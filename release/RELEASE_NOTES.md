# RHI Energy UX 4.3.21 — RELEASE_RECOVERY_INTEGRITY_CLOSURE

- Consume Energy E0.15.86 canonical per-asset planning participants and D0/D1 horizon truth.
- Keep every real managed flexible consumer visible in Tactical Planning, including temporarily incomplete planning inputs.
- Make **Today | Tomorrow** the primary Tactical Planning selector and remove the redundant technical context panel.
- Read canonical flexible required/planned/still-to-plan totals without local recalculation.
- Consume backend-owned Settings profile groups rather than rebuilding profile semantics from property names.
- Render the Energy-owned participating hierarchy, including Home Battery children and charger/vehicle relationships.
- Preserve configured intent, write/readback lifecycle and effective-policy separation.
- Keep infrastructure-only charger fallbacks outside managed consumer/planning product surfaces.
- Retain UX Core 1.5.4 as the authoritative appearance-picker geometry and shared presentation primitive.

## Coordinated candidate baseline

- Foundation **F1.8.35**
- Mobility **M0.10.24**
- Energy **E0.15.86**
- UX Core **1.5.4**
- Energy UX **4.3.21**

Rollback: **v4.3.20**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.  
Target Home Assistant qualification remains required before stable promotion.
