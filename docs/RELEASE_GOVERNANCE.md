# Release Governance

RHI Energy UX uses the same release discipline as the RHI backend, kept intentionally simple.

## Release path

```text
branch
→ PR
→ Validate green
→ squash merge to main
→ main Validate green
→ automatic Publish HACS
→ immutable TEST CANDIDATE prerelease
→ target Home Assistant qualification
→ manual stable promotion
```

## Rules

1. `validate.yml` is side-effect free.
2. `publish-hacs.yml` runs automatically for relevant changes on `main`.
3. Candidate publication re-runs source/package tests, reproducible-dist proof and HACS validation.
4. A published `vX.Y.Z` tag/release is immutable. Never republish it; fix forward with the next version.
5. `release/QUALIFICATION.json` records target runtime evidence and does not trigger a new candidate publication.
6. Stable promotion remains manual and fail-closed.
7. Stable promotion requires runtime proof, rollback proof, zero accepted technical debt and zero accepted feature debt.
8. Stable promotion verifies that the current runtime bytes exactly match the immutable candidate asset.
9. Previous immutable HACS releases remain the rollback path.
10. UX owns only its own package version. Backend version comes only from `sensor.energy_release_contract.backend_release`; the UX never guesses or maps it.

## Current release

- candidate: `v3.94.9`
- minimum backend: `E0.15.12`
- rollback target: `v3.94.8`
