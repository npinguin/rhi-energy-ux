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
