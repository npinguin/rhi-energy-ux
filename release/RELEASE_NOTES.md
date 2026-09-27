# v4.3.0 — coherent asset experience and body-control convergence TEST CANDIDATE

Energy 4.3.0 consolidates the runtime issues found during the 4.2.8/4.2.9 target-HA review into one clean candidate.

## User-facing changes

- preserves the approved photographic Gas hero and supported native Statistics Graph loading introduced in 4.2.9;
- separates page-level **Quick Actions** from body-scoped **View** controls: View now appears only where the body has a real horizon, period, filter, sort or alternate representation;
- moves Today/Tomorrow, period and list filters directly above the content they govern;
- consumes canonical Mobility vehicle/charger visual identity through a generated producer-owned manifest instead of a copied identity table;
- preserves producer `visual_ref` through Consumers materialization so Audi, VW, BMW, Wallbox, Peblar and other Mobility assets keep the correct identity;
- gives managed assets a consistent minimum user view: status, current power, relationship, planning intent, valid actions and deeper details;
- distinguishes battery health/availability from missing child telemetry; missing per-battery power no longer makes a healthy battery appear unavailable;
- materializes Solar as published arrays/zones with panels and optimizers underneath, with progressive disclosure and explicit unassigned-device handling;
- keeps connected/linked chargers and vehicles visible in Flow even at 0 kW, separating topology from active power flow;
- surfaces vehicle↔charger context in Consumers when the canonical relationship is published;
- reports incomplete/not-published planning data explicitly instead of presenting subsystem existence as a positive status.

## Engineering cleanup

- upgrades the bundled presentation baseline to **RHI UX Core 1.5.0**;
- removes the mixed page-control bar and the obsolete Energy-owned shared-control styling;
- removes embedded base64 battery artwork from `energy-card.js`; package assets are the only image transport;
- adds regression coverage for cross-domain visuals, body-scoped controls, battery telemetry completeness, Solar topology and idle physical topology;
- keeps Energy semantics, calculations, relationships and command authority backend-owned.

Rollback: **v4.2.9**.

This is an installable HACS test candidate. Target Home Assistant desktop/iPad rendering, live contracts, write/readback, refresh, upgrade and rollback proof remain mandatory before stable promotion.
