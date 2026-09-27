# RHI Energy UX 4.3.12 — SOLAR_PRIMARY_OPTIMIZER_UX

- Make Solar zone/string UX energy-first instead of topology-first.
- Power optimizers are the primary module-level cards inside each Solar zone.
- Primary cards surface production/power, energy today and operating state when published.
- Missing explicit panel relationships no longer create large "No panels linked" empty states.
- An optimizer may remain a valid primary Solar object when its physical panel relationship is not explicitly published.
- Full topology, parent/source identifiers, lifecycle and complete properties remain available under Details.
- Explicit panel objects without an optimizer publication remain available as secondary topology detail.
- Preserve Energy E0.15.77 automation-authority, managed-consumer, Metering, Value and Retrospective semantics.

Minimum/tested backend: **E0.15.77**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
