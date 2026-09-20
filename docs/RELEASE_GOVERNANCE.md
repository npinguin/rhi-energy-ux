# Release Governance

RHI Energy UX follows the same fail-closed release discipline as the backend, without backend-specific runtime complexity.

## Release path

```text
branch
  → tests + deterministic build
  → pull request
  → Validate green
  → squash merge to main
  → main Validate green
  → immutable GitHub release/tag
  → HACS install/update
  → target Home Assistant runtime proof
```

## Release rules

1. `source/homebrain-energy-card.js` is canonical source.
2. `dist/rhi-energy-ux.js` is generated and must be reproducible.
3. `package.json`, `package-lock.json`, `COMPATIBILITY.json`, source identity and build manifest must agree on the UX version.
4. The UX reads the backend version only from `sensor.energy_release_contract.backend_release`.
5. No frontend backend-version mapping or fallback is allowed.
6. PR validation must be green before merge.
7. Main must validate again after merge.
8. A version/tag is immutable. Never overwrite a published version.
9. A bad release is fixed by a new patch release.
10. Rollback uses the previous immutable HACS release.

## Runtime proof

Static CI proves package consistency; it does not prove the target browser/Home Assistant runtime.

Before retiring the previous deployment, verify:
- HACS resource loaded;
- dashboard renders;
- desktop and iPad;
- footer version identity;
- no duplicate legacy resource;
- update and rollback path understood.

## Current release

- candidate: `v3.94.8`
- backend minimum: `E0.15.12`
- rollback target: `v3.94.7`
