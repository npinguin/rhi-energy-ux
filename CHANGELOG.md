# Changelog

## 3.94.8

Compact, uniform RHI release identity and safer HACS migration guidance.

- shows only UX and backend release information while healthy;
- hides contract/diagnostic detail in a tooltip and shows colored issue text only when a problem exists;
- reads backend identity only from the Energy release contract;
- aligns the public runtime identity with `ENERGY_PUBLIC_RUNTIME_V1`;
- documents HACS installation, dashboard YAML, legacy resource removal, validation and rollback step by step.

## 3.94.7

Initial public HACS migration baseline of the existing R3.94.7 Energy UX.

- preserves R3.94.7 runtime and Energy contract semantics;
- moves deployment to a standard HACS Dashboard repository;
- packages runtime artwork under `dist/assets`;
- adds reproducible build and regression validation;
- adds GPL-3.0-only and compatibility metadata;
- adds immutable GitHub Release workflow for HACS update and rollback.
