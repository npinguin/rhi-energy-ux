# Engineer handover — RHI Energy UX

## Current coordinated Flow candidate and handover (14 October 2026)

The canonical Energy backend **E0.15.130** (model **1.4.5**) provides optional native battery-system charge/discharge power. This UX repository's next immutable candidate is **v4.3.36-rc.20**, minimum/tested source E0.15.130. It preserves simultaneous mixed directions on Power Flow Card Plus, but must not fabricate a battery arrow from signed net power or treat missing measurements as zero. Source validation/HACS publication do not qualify physical Wessels Flow rendering. The central execution and defect ledger is [Foundation #129](https://github.com/npinguin/rhi-foundation/issues/129); use its latest comment for exact verified SHA/CI and unresolved exceptions. Wessels/Huis 1 → Molas/Huawei → separate Sonnen/SMA. Do not silently change the immutable v4.3.36-rc.19 tag. Stable remains NO-GO.


## Active engineering recovery — 2026-10-11

**Read [ENGINEERING_RECOVERY_HANDOVER_2026-10-11.md](ENGINEERING_RECOVERY_HANDOVER_2026-10-11.md) first.** It identifies the exact unreleased Foundation/Energy/Mobility producer branches, 34 Public V2 source violations, native D0/D1 schema mismatch, execution plan, test gates and blocked release qualification. The legacy Public V2 gateway below is **historical implementation debt, not an endorsed product authority**. Do not merge/release the current Energy UX recovery candidate until the canonical-only cutover and target-HA evidence are complete.

## Start here

Do not copy current release identity from this document. Authoritative sources are:

- package version: `package.json`;
- contract/backend/stage/rollback context: `release/product.json`;
- runtime qualification: `release/QUALIFICATION.json`;
- published versions: GitHub Releases.

Read in this order:

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/RELEASE_GOVERNANCE.md`
- `docs/UX_REPOSITORY_STANDARD.md`
4. `docs/SOURCE_PACKAGE_GOVERNANCE.md`
5. `src/OWNERSHIP.json`
6. `src/manifest.json`
7. `docs/TEST_GOVERNANCE.md`
8. `validation/OWNERSHIP.json`
9. `docs/DRIFT_PREVENTION.md`
10. `docs/BRANDING.md`
11. `docs/UX_FOOTER_STANDARD.md`
12. `release/product.json`
13. `release/QUALIFICATION.json`

## Product boundary

```text
Energy backend
→ public Energy contracts
→ runtime registry/gateway
→ canonical domain models/planning adapters
→ app renderers
```

UX owns presentation only. Backend semantics and backend release identity are never inferred or remapped in the frontend.

## Source ownership

- `src/app/`: app shell, navigation, renderers and package asset references.
- `src/runtime/`: Home Assistant/public Energy contract boundary and commands.
- `src/domain/models/`: canonical Energy view models.
- `src/domain/planning/`: planning adaptation, contract reader and planning view model.
- `src/assets/`: canonical artwork by category.
- `src/manifest.json`: module insertion points/order.
- `tools/build.py`: deterministic package generation.
- `dist/`: complete generated HACS package, never source.

Do not reintroduce `source/`, copied generated module blocks inside the app template, flat asset roots, or stale files preserved only because a build did not clean `dist/`.

## Testing ownership

Testing mirrors code ownership: **one invariant, one test owner**.

Do not make a domain test own release version, a footer test own branding delivery, a branding test own responsive geometry, or a package test own contract semantics.

If one local change breaks several unrelated suites, classify test-ownership drift before changing all suites.

## Brand authority

- Canonical company mark: `src/assets/branding/company-logo.svg`.
- Distribution copy: `dist/assets/branding/company-logo.svg`.
- Hero artwork: `src/assets/heroes/` → `dist/assets/heroes/`.
- Branding validation owns artwork and byte parity.
- Navigation/layout owns header-slot geometry separately.

## Release path

```text
branch
→ owned change + owned regression tests
→ generate complete dist package
→ PR
→ one full Validate gate
   → candidate build
   → complete owned tests
   → complete-package immutability check
   → deterministic second build
   → committed-dist equality
   → HACS validation
→ squash merge
→ verify complete committed dist package
→ create or verify immutable tag (no rebuild)
→ normal GitHub Release with evidence assets only
→ HACS-visible TEST CANDIDATE
→ target HA runtime + rollback proof
→ qualification bound to exact tag/SHA
→ stable promotion (no rebuild)
```

Normal build budget: **2 builds**. Publication and stable promotion use **0 builds**.

Publication is idempotent. If the tag/release already exists, it must match the complete `dist/` package and release target; verify it and finish green without mutation.

## Validation

```text
npm ci
npm run validate
```

Use `npm run release:sync` only when preparing a new candidate.

## Pending qualification

Stable promotion remains blocked until `release/QUALIFICATION.json` records the required target Home Assistant and rollback evidence as PASS and binds that evidence to the exact immutable candidate SHA.

## HACS migration

Use `custom:homebrain-energy-card`. Resource path: `/hacsfiles/rhi-energy-ux/rhi-energy-ux.js`.

The installed HACS directory must contain the complete generated package, including `assets/branding/` and `assets/heroes/`. Do not load the old `/local/homebrain/...` bundle at the same time.
