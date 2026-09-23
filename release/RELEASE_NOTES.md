# RHI Energy UX v3.95.0 — structural UX alignment TEST CANDIDATE

## Scope

Clean Energy UX alignment release over v3.94.24. It adopts the proven Mobility presentation pattern without moving Energy semantics, calculations, commands or ownership into the frontend.

## User experience

- Uses the same compact copy-left / image-right hero geometry as Mobility across desktop, tablet and phone.
- Freezes a dedicated Energy hero family for Overview, Solar, Home Battery, Consumers, Planning, Metering/Pricing, Strategy, Value and Diagnostics/Retrospective.
- Keeps hero artwork presentation-only: no product title text is baked into the images.
- Gives every current Energy navigation destination an explicit presentation profile instead of silently falling back to Overview.
- Preserves Energy-specific color and imagery while keeping Home Intelligence modules visibly related.

## Maintainability

- Introduces one declarative Energy navigation model.
- Introduces one declarative hero-asset map and a small view/profile alias map.
- Adds a single presentation module for responsive hero and reusable card grammar.
- Reuses existing backend-owned values, status, actions and page renderers.
- Does not introduce a generic frontend framework, new data layer, new state store or duplicated domain model.
- Existing card bodies remain semantically unchanged; the shared grammar standardizes compact facts, context cards and data rows.

## Contract and compatibility

- Energy UX: 3.95.0
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Backend/domain contract delta: none
- Accepted technical debt: 0
- Accepted feature debt: 0
- Rollback release: v3.94.24

## Qualification

Static and package validation are required before publication. Target Home Assistant runtime, desktop/iPad rendering, clean HACS install and rollback proof remain qualification gates for stable promotion of this immutable candidate.
