# v4.3.1 — compact asset truth and canonical Energy hierarchy TEST CANDIDATE

Energy 4.3.1 completes the asset-tab refinement on top of the 4.3.0 architecture without adding navigation or backend semantics.

## User-facing changes

- keeps the existing Energy tabs and applies the shared depth model: **Tab → Primary card → Details → dedicated view where justified**;
- makes primary asset cards concise: canonical visual, identity, published Home Assistant area/location, operational status and the most relevant live energy facts;
- moves profile, publication/source and telemetry-completeness information into **Details** instead of showing technical configuration in the primary card;
- adds Details to physical Home Battery contributors while retaining only backend-published per-battery Quick Actions;
- orders Solar as production summary → inverters → Home Battery system → solar zones → explicitly unassigned/support hardware;
- renders each published solar panel as one physical module card and attaches optimizer measurements/details only when the canonical optimizer→panel relationship is published;
- keeps zone-level or unassigned optimizers explicit instead of guessing a panel relationship;
- places the compact Gas meter card before the Home Assistant native statistics graph, with no invented controls;
- gives Consumers a compact operational summary for current power, required energy, planned energy and still-to-plan energy when those planning totals are published;
- keeps each managed Consumer card focused on current power, energy need/progress, canonical vehicle↔charger relationship, valid commands and progressive Details.

## Engineering / drift control

- no new tabs, backend contracts or name-based relationship inference;
- no second Mobility visual authority and no new shared presentation layer;
- adds regression gates for compact primary cards, Gas meter-first ordering, Solar module/optimizer composition and the required Solar section order;
- preserves RHI UX Core **1.5.0** and Mobility's generated cross-domain visual manifest;
- deterministic committed `dist`, immutable-tag HACS delivery and no GitHub release assets remain mandatory.

Rollback: **v4.3.0**.

This is an installable HACS test candidate. Target Home Assistant desktop/iPad runtime proof, live data verification, upgrade and rollback remain mandatory before qualification.
