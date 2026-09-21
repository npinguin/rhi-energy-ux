# RHI Energy UX v3.94.21 — TEST CANDIDATE

## Scope

Cross-package UX release-governance and footer convergence over v3.94.20. No Energy backend semantics, routes, planning logic, commands, header behavior or brand artwork change.

- aligns Energy with the shared RHI UX release standard;
- publishes TEST CANDIDATE versions as normal GitHub Releases so HACS exposes them without a beta/prerelease toggle;
- keeps TEST CANDIDATE status in release metadata and qualification evidence instead of the GitHub prerelease flag;
- adds explicit `release/RELEASE_STATUS.json` lifecycle state;
- makes stable promotion evidence-only and preserves immutable tag/runtime bytes;
- standardizes the footer with the shared RHI UX footer contract;
- keeps the healthy footer to `RHI Energy UX <version> · Backend <version>` and limits problems to one short issue label with tooltip detail;
- adds regression validation for the shared release lifecycle and shared footer shell.

## Compatibility

- Energy UX: 3.94.21
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.20

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
