# Release Governance

RHI Energy UX follows the shared `docs/UX_RELEASE_STANDARD.md`. This file adds Energy-specific rules only.

## Release path

```text
branch
→ PR
→ Validate green
→ squash merge to main
→ main Validate green
→ automatic Publish HACS
→ immutable HACS-visible TEST CANDIDATE GitHub Release
→ target Home Assistant qualification
→ manual stable promotion of exact immutable candidate
```

## Rules

1. `validate.yml` is side-effect free.
2. `publish-hacs.yml` is the only TEST CANDIDATE publication path.
3. TEST CANDIDATE releases are normal GitHub Releases, not GitHub prereleases; HACS must expose them without a beta-version toggle.
4. Candidate publication re-runs source/package tests, reproducible-dist proof and HACS validation.
5. A published `vX.Y.Z` tag/release is immutable. Never republish it; fix forward with the next version.
6. `release/QUALIFICATION.json` records target runtime evidence and does not trigger candidate publication.
7. Stable promotion is manual, fail-closed and evidence-only. It may attach/update qualification evidence and release title/notes, but it may not move the tag or alter runtime bytes.
8. Stable promotion requires runtime proof, rollback proof, zero accepted technical debt and zero accepted feature debt.
9. Stable promotion verifies the current runtime bytes exactly match the immutable candidate asset.
10. Previous immutable HACS releases remain the rollback path.
11. UX owns only its own package version. Backend version comes only from `sensor.energy_release_contract.backend_release`; the UX never guesses or maps it.
12. Workflow-only, documentation-only and qualification-only changes must not republish an immutable runtime version.

## Required release identity

The following must agree with `package.json`:

- `COMPATIBILITY.json`
- `RELEASE_MANIFEST.json`
- `release/RELEASE_STATUS.json`
- `release/QUALIFICATION.json`
- source `UX_VERSION`
- first `CHANGELOG.md` entry
- current release notes
- engineer handover
- generated runtime artifact

## Current release

- candidate: `v3.94.22`
- minimum backend: `E0.15.25`
- rollback target: `v3.94.21`
