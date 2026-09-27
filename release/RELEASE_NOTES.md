# v4.3.1 — compact asset truth and canonical hierarchy TEST CANDIDATE

Energy 4.3.1 refines the 4.3.0 asset experience without introducing any new tabs.

## User-facing changes

- keeps the existing asset tabs: **Solar, Home Battery, Gas and Consumers**;
- applies one compact primary asset grammar: canonical image, name, Home Assistant location when available, status, current power and the relevant energy/progress facts;
- keeps focus dashboards such as Overview, Flow, Planning and Metering deliberately narrower instead of repeating full asset cards;
- restructures Solar body order to **Inverters → Battery system → Solar zones**;
- renders each physical solar module as one **panel + optimizer card**: the panel provides visual identity and the optimizer provides measurement/interface truth;
- keeps Battery System inside Solar primary-only so Battery policies and controls are not duplicated there;
- makes Home Battery show the aggregate system, published system policies and physical battery cards with currently available quick commands and full Details;
- places the canonical Gas meter card directly above the existing Home Assistant native statistics graph;
- refines Consumers around current kW, energy need, planned energy and still-to-plan energy while preserving canonical charger/vehicle relationships.

## Domain-detail behavior

- Details expose currently published asset properties;
- editable properties use the existing authoritative `rhi_energy.write_property` path only when the backend publishes a supported write route;
- asset commands are shown only when the canonical command contract publishes them;
- inverter limits, modes and commands remain asset-detail concerns rather than primary-card clutter;
- physical battery controls remain asset-scoped; no aggregate fan-out is invented;
- missing telemetry is never converted into a false unavailable state.

## Engineering

- tested against backend model **E0.15.67**;
- adds Home Assistant area lookup from published/source device identity with graceful no-location fallback;
- removes duplicate panel/optimizer sibling presentation;
- adds regression coverage for asset-tab richness versus focus-dashboard restraint;
- keeps deterministic committed `dist/`, immutable-tag HACS delivery and zero release assets.

Rollback: **v4.3.0**.

This is an installable HACS test candidate. Target Home Assistant desktop/iPad rendering, live asset/property/command behavior, upgrade and rollback proof remain mandatory before stable promotion.
