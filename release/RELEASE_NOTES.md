# v4.2.8 — Frontend convergence and Gas hero identity TEST CANDIDATE

This candidate closes the remaining structural frontend cleanup before runtime qualification.

- binds the Gas page to a new immutable `gas-page-hero-v2.svg` asset carrying the approved photographic Gas hero, separate from gas-meter device visuals;
- removes legacy `hiTab*` and `hiQuickAction*` shared presentation authority from Energy;
- replaces historical r326/r346 release-era class names with semantic domain names;
- removes all remaining `!important` declarations from `src/app/energy-card.js`;
- closes the UX debt ratchet at zero so these presentation layers cannot return;
- keeps Hero → Status → Page Controls → Body owned by RHI UX Core 1.4.1;
- clarifies RHI UX Core as the sole company-branding authority;
- keeps Energy meaning, totals, planning and command truth backend-owned.

Rollback: v4.2.7.

Target Home Assistant HACS install, desktop/iPad rendering, live contracts, write/readback, refresh, upgrade and rollback remain mandatory runtime qualification gates before stable promotion.
