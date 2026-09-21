# Engineer handover — RHI Energy UX

## Current candidate

- Source candidate: **v3.94.17**
- Minimum backend: **E0.15.25**
- Backend version owner: `sensor.energy_release_contract.backend_release`
- Public compatibility surface: **R1.89.44_CONTRACT**
- Runtime artifact: `dist/rhi-energy-ux.js`
- Rollback target: **v3.94.16**

## Product boundary

```text
Energy backend
→ public Energy contracts
→ Public Interface Registry / gateway
→ normalized view models
→ renderers
```

UX owns presentation only. Backend semantics and backend release identity are never inferred or remapped in the frontend.

## Release path

```text
branch
→ PR
→ Validate green
→ squash merge
→ main Validate green
→ automatic Publish HACS
→ immutable TEST CANDIDATE
→ target HA runtime + rollback proof
→ manual stable promotion
```

Any runtime-impacting correction after publication requires the next version.

## Validation

Run:

```text
npm ci
npm run validate
```

Validation covers syntax, contract/view-model tests, architecture drift, bundle-load smoke, HACS package checks, public-repository hygiene and reproducible dist.

## Pending qualification

Stable promotion remains blocked until `release/QUALIFICATION.json` records HACS install, desktop/iPad render, refresh, backend release identity, upgrade and rollback proof as PASS.

## HACS migration

Use `custom:homebrain-energy-card`. HACS resource path is `/hacsfiles/rhi-energy-ux/rhi-energy-ux.js`. Do not load the old `/local/homebrain/...` bundle at the same time.
