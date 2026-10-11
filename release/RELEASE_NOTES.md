# v4.3.36-rc.6 — Compact Energy asset rows and preserved charts (HACS TEST CANDIDATE)

- Adopt Core 1.6.4 compact asset presentation on canonical Consumption rows: visual left, measured live power and state right, energy need when published; retain configuration, actions, Details and Diagnostics.
- Show a charger relationship as a navigable link only when Mobility advertises a same-origin asset-detail route; otherwise show its published label without inventing a route.
- Keep the actual Home Assistant Statistics Graph for Gas and existing week/month/quarter/year controls; adopt responsive chart container/empty-state styling, without inferring daily consumption from the cumulative meter.
- Tighten domain-local context/data-row spacing. Preserve the current six operational tabs, Robotix branding, existing hero images, hierarchy and all other charts.
- Add source-level regression for visual stability, zero/unavailable, Core row escaping, optional cross-domain navigation and native Gas chart contract.

This is a HACS TEST CANDIDATE. No target HA runtime, cross-device screenshot, write/readback or rollback qualification is implied by a passing CI. Stable promotion remains blocked until those proofs pass.

Compatibility: existing canonical Energy V2 public contracts, no backend changes. Core 1.6.4 (vendored). Rollback: v4.3.36-rc.5.
