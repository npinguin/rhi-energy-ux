# v4.3.4 — portable dashboard mounting and install UX TEST CANDIDATE

Energy 4.3.4 keeps the primary-object truth restored in 4.3.3 and makes dashboard portability an explicit, regression-tested deployment contract.

## User-facing changes

- the Energy dashboard may use any Home Assistant dashboard URL, including a custom root such as `robotix-energy`;
- the Energy card does not depend on a fixed Lovelace root or view path and works on generated view paths such as `/robotix-energy/0`;
- Energy capability navigation stays inside the card instead of rewriting the dashboard URL;
- HACS resources and package artwork remain root-absolute under `/hacsfiles/rhi-energy-ux/...`, so dashboard renaming cannot redirect asset requests;
- installation instructions now make the dashboard URL/view-path distinction explicit and provide one minimal copy/paste configuration;
- runtime verification explicitly includes custom-root refresh and navigation checks.

## Preserved 4.3.3 UX contract

- published primary object truth remains visible on inverter, battery, Solar, consumption, managed consumer and other object cards;
- technical identity, source, profile, lifecycle and publication diagnostics stay under **Details**;
- missing telemetry remains distinct from device unavailability;
- Solar hierarchy, Mobility visual ownership, Core 1.5.0 View/Context semantics and deterministic HACS packaging remain unchanged.

## Engineering

- adds a regression gate that rejects fixed Lovelace dashboard roots and browser-path-driven Energy capability routing;
- deliberately does **not** introduce a second router or `dashboard_path` abstraction because Energy navigation is already card-local.

Rollback: **v4.3.3**.

This is an installable HACS test candidate. Target Home Assistant proof under a custom dashboard URL, desktop/iPad rendering, refresh, upgrade and rollback remains required before stable promotion.
