# v4.2.9 — Gas runtime correction TEST CANDIDATE

This candidate corrects the Gas-tab regressions proven on target Home Assistant after 4.2.8.

Changes:
- replaces the blurred SVG-derived Gas hero with the approved photographic Gas hero supplied by the product owner, packaged as immutable `gas-page-hero-v3.webp`;
- removes the obsolete `gas-page-hero-v2.svg` transport from source and HACS dist so it cannot be selected or cached again;
- scopes Gas page commands strictly to commands targeted at the canonical `gas_meter` asset, preventing unrelated global Energy/Planning commands such as Reset Baseline and Execute Plan from leaking into Gas;
- loads the Home Assistant Statistics Graph through `window.loadCardHelpers()` and `createCardElement()`, so the lazy-loaded native card is available before configuration;
- keeps the canonical total-increasing gas meter and Home Assistant long-term statistics authoritative; no gas history is estimated in the frontend;
- preserves RHI UX Core 1.4.1 ownership of Hero → Status → Page Controls → Body.

Rollback: v4.2.8.

Target Home Assistant HACS install, desktop/iPad render, Gas history rendering, refresh/restart, upgrade and rollback remain runtime qualification gates before stable promotion.
