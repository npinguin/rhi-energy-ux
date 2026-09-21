## 3.94.16 — approved premium navigation alignment

- moves Home Intelligence identity into the shared two-layer navigation card;
- gives the primary row more premium spacing, scale and hierarchy;
- adds restrained section icons without adding mockup-only product controls;
- keeps contextual tabs as a quieter second row inside the same frame;
- preserves routing, persistence, omni-device behaviour and backend contracts.

## 3.94.15 — lighter shared navigation frame

- places both navigation layers inside one premium low-contrast frame;
- removes separate nested navigation containers and their duplicate visual weight;
- keeps primary navigation quieter than contextual navigation;
- adds restrained Energy, Intelligence and Insights accent states;
- preserves the same two-layer information architecture and omni-device behaviour.

## 3.94.14 — two-level navigation and premium headers

- introduces Energy / Intelligence / Insights as the first navigation layer;
- introduces contextual second-layer tabs for each product area;
- reclassifies the existing Solar screen as Operational Planning and current Planning as Tactical Planning;
- adds structural Solar and Strategic Planning destinations without moving or inventing domain semantics;
- persists section/item navigation across card recreation and remembers the last location per section;
- standardises the visible premium banner directly under navigation across desktop, tablet and phone;
- removes the old large top title from the active page layout.

## 3.94.13 — Planning D1 totals contract closure

- consumes the dedicated backend Tomorrow/D1 planning totals instead of the combined D0+D1 summary;
- labels D1 aggregate planning values as Planned tomorrow;
- keeps canonical lane totals backend-owned and does not recompute flexible-load energy;
- requires Energy E0.15.24 for the dedicated D1 totals contract.

## 3.94.12 — lifecycle interaction-state stability

- restores stable UX navigation state after Home Assistant recreates the card;
- keeps runtime/edit/command feedback ephemeral;
- prevents restored Metering period from being rehydrated back to backend defaults;
- removes generic selector first-item fallback;
- aligns Consumers sort defaults;
- adds executable recreation and unavailable-selection regression coverage.

## 3.94.11 — interaction-state stability

- preserves active view and viewport across runtime updates;
- unifies Metering and Value period selection/write behavior;
- prevents recurring backend refresh from taking over the locally selected period;
- prevents silent Outlook horizon fallback and Strategy profile substitution;
- adds regression gates for interaction-state stability.

## 3.94.10 — canonical owner closure

- makes runtime property lookup fail closed on the Public Interface Registry owner;
- removes Consumer Mix reconstruction from Flexible Assets;
- routes product diagnostic interface identity through the registry;
- aligns Metering diagnostics with the canonical asset metering interface;
- adds architecture gates preventing cross-owner fallback drift.

## 3.94.9 — audit closure

- centralizes product entity identity in the Public Interface Registry;
- removes direct public-entity owner selection from runtime product paths;
- fixes Metering to use the canonical registry owner only;
- adds engineer handover and stronger documentation-governance checks;
- adds executable bundle-load smoke coverage;
- removes stale release labels and Home Base Load terminology from evergreen documentation.

# Changelog

## 3.94.8

Release/footer and HACS installation closure.

- shows only `RHI Energy UX <version> · Backend <release>` in quiet gray when healthy;
- shows colored issue text only when a runtime/interface problem exists;
- exposes technical error details only through the issue tooltip;
- reads the backend version only from `sensor.energy_release_contract.backend_release`;
- removes frontend fallback/mapping of backend release identity;
- adds foolproof HACS dashboard/resource migration instructions;
- keeps immutable GitHub releases and HACS version rollback.

## 3.94.7

Initial public HACS migration baseline of the existing R3.94.7 Energy UX.

- preserves R3.94.7 runtime and Energy contract semantics;
- moves deployment to a standard HACS Dashboard repository;
- packages runtime artwork under `dist/assets`;
- adds reproducible build and regression validation;
- adds GPL-3.0-only and compatibility metadata;
- adds immutable GitHub Release workflow for HACS update and rollback.
