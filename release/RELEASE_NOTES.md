# RHI Energy UX v3.95.1 — Mobility overview parity TEST CANDIDATE

## Scope

Presentation correction over v3.95.0. It keeps the Energy runtime contract unchanged and aligns the active-page hierarchy with the proven Mobility Overview layout.

## User experience

- Makes the hero a clean title/description + full-bleed image composition, matching Mobility Overview.
- Removes small live-value and availability substatus elements from inside the hero.
- Promotes the four primary tab facts into a dedicated top-level status row with the same visual weight as Mobility Overview.
- Aligns the Quick Actions bar height, spacing, borders and primary-action treatment with Mobility Overview.
- Corrects hero mapping by semantic navigation destination: Flow uses Flow, Solar uses Solar, Metering uses Metering, and planning/strategy/retrospective destinations use their matching artwork.
- Keeps the frozen Energy image set; no regenerated product imagery is introduced.

## Contract and compatibility

- Energy UX: 3.95.1
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Backend/domain contract delta: none
- Accepted technical debt: 0
- Accepted feature debt: 0
- Rollback release: v3.95.0

## Qualification

Static/package validation is required before publication. Target Home Assistant runtime, desktop/iPad rendering, HACS upgrade and rollback remain qualification gates for stable promotion.
