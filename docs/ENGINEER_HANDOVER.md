# Engineer handover — RHI Energy UX

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
4. `docs/TEST_GOVERNANCE.md`
5. `validation/OWNERSHIP.json`
6. `docs/DRIFT_PREVENTION.md`
7. `docs/BRANDING.md`
8. `docs/UX_FOOTER_STANDARD.md`
9. `release/product.json`
10. `release/QUALIFICATION.json`

## Product boundary

```text
Energy backend
→ public Energy contracts
→ Public Interface Registry / Energy Contract Gateway
→ normalized view models
→ renderers
```

UX owns presentation only. Backend semantics and backend release identity are never inferred or remapped in the frontend.

## Testing ownership

Testing mirrors code ownership: **one invariant, one test owner**.

Do not make:
- a domain test own release version;
- a footer test own branding delivery;
- a branding test own responsive header geometry;
- a package test own contract compatibility semantics.

If one local change breaks several unrelated suites, classify test-ownership drift before teaching all suites the new implementation.

## Brand authority

- Canonical company mark: `source/assets/company-logo.svg`.
- Distribution copy: `dist/assets/company-logo.svg`.
- Branding validation owns artwork, source/dist parity and cache-safe delivery.
- Navigation/layout owns header-slot geometry separately.
- Footer tests do not assert brand transport.

## Footer authority

- Healthy footer is readable at 11px desktop / 10.5px phone.
- Issues are expandable in-page; hover-only diagnostics are forbidden.
- Footer presentation and footer runtime-data safety have separate explicit owners in `validation/OWNERSHIP.json`.

## Release path

```text
branch
→ owned change + owned regression tests
→ PR
→ one full Validate gate
   → candidate build
   → complete tests
   → deterministic second build
   → committed-dist equality
   → HACS validation
→ squash merge
→ exact committed artifact publication (no rebuild)
→ immutable HACS-visible TEST CANDIDATE
→ target HA runtime + rollback proof
→ qualification bound to exact tag/SHA
→ stable promotion (no rebuild)
```

Normal build budget: **2 builds**.

Any runtime-impacting correction after publication requires the next version. Governance/test/documentation changes may stay on an existing published version only when runtime bytes remain identical to that tag.

## Validation

Run:

```text
npm ci
npm run validate
npm run check:test-ownership
```

Use `npm run release:sync` only when preparing a new candidate.

## Pending qualification

Stable promotion remains blocked until `release/QUALIFICATION.json` records the required target Home Assistant and rollback evidence as PASS and binds that evidence to the exact immutable candidate SHA.

## HACS migration

Use `custom:homebrain-energy-card`. HACS resource path is `/hacsfiles/rhi-energy-ux/rhi-energy-ux.js`. Do not load the old `/local/homebrain/...` bundle at the same time.
