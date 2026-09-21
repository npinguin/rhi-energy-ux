# Engineer handover — RHI Energy UX

## Current candidate

- Source candidate: **v3.94.22**
- Minimum backend: **E0.15.25**
- Backend version owner: `sensor.energy_release_contract.backend_release`
- Public compatibility surface: **R1.89.44_CONTRACT**
- Runtime artifact: `dist/rhi-energy-ux.js`
- Rollback target: **v3.94.21**

## Asset refresh authority

- External company-logo requests carry `?v=<UX_VERSION>` so browser cache identity changes with every UX package release.
- Never use a timeless external brand URL for an asset that can change between packages.

## Brand authority

- Canonical company mark: `source/assets/company-logo.svg`
- Distribution copy: `dist/assets/company-logo.svg`
- Build owns source → dist synchronization.
- Branding validation pins the approved asset hash and source/dist byte parity.
- Runtime must not redraw, reinterpret, recolour, filter or synthesize the Robotix company mark.
- The company slot uses shared `--rhi-company-*` CSS tokens; module-specific code may size the slot only by overriding those tokens, never by editing the logo asset.

## Product boundary

```text
Energy backend
→ public Energy contracts
→ Public Interface Registry / gateway
→ normalized view models
→ renderers
```

UX owns presentation only. Backend semantics and backend release identity are never inferred or remapped in the frontend.

## Footer authority

- Healthy footer is readable at 11px desktop / 10.5px phone.
- Issues are expandable in-page; hover-only diagnostics are forbidden.
- Expanded details must expose concrete runtime/backend conditions and verification guidance.

## Shared UX standards

- `docs/UX_RELEASE_STANDARD.md` is normative for release lifecycle across all RHI UX packages.
- `docs/UX_FOOTER_STANDARD.md` is normative for footer layout, data ownership and diagnostics presentation.

## Release path

```text
branch
→ PR
→ Validate green
→ squash merge
→ main Validate green
→ automatic Publish HACS
→ immutable HACS-visible TEST CANDIDATE
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
