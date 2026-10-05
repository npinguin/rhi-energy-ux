# Engineer handover — RHI Energy UX

## Zero-debt closure baseline

This repository is in the coordinated RHI frontend closure program. The target is **zero accepted technical debt, zero accepted feature debt and zero V1 product/runtime dependency**.

Current candidate context for this handover:

- candidate: `4.3.28`;
- closure PR: `#181`;
- public product authority: `RHI_ENERGY_PUBLIC_CONTRACT_V2`;
- minimum/tested backend baseline: `E0.15.97`;
- minimum Foundation: `F1.8.38` with `RHI_VISUAL_ASSET_REGISTRY_V2`;
- vendored UX Core: `1.6.3`;
- stable promotion: blocked until exact-candidate target Home Assistant qualification passes.

The machine-readable authorities remain `package.json`, `release/RELEASE_STATUS.json`, `release/QUALIFICATION.json` and `governance/BACKEND_GAPS.json`. If this paragraph ever disagrees with them, the machine-readable files win.

### Non-negotiable architecture

```text
Energy backend public V2 truth
        ↓
runtime gateway
        ↓
thin Energy projection / presentation model
        ↓
RHI UX Core grammar + Energy content
        ↓
user
```

Rules:

1. **V1 is decommissioned.** No V1 product authority, fallback, compatibility read or V1-shaped reconstruction may exist in `src/` or `dist/`.
2. **Frontend never invents domain truth.** Missing or ambiguous semantics are recorded in `governance/BACKEND_GAPS.json` and fixed in the owning backend/domain.
3. **One mapping boundary.** Backend fields/semantics are normalized once in runtime/projection. Screens do not probe aliases or rebuild semantics independently.
4. **Backend owns facts and meaning.** Planning totals, eligibility, relationships, pricing/value semantics, configured/effective policy, reasons, write capability and readback are backend-owned.
5. **UX is human-first.** Normal product surfaces must not expose contract names, entity IDs, property keys, raw reason codes or implementation terminology.
6. **Diagnostics is explicit.** Technical evidence may exist only in a deliberate diagnostics/engineering disclosure, never as normal product identity or guidance.
7. **Multilingual is release scope.** Pilot-visible product copy is EN/NL/FR through the localization layer; machine identifiers remain untranslated.
8. **Missing truth fails closed.** Unknown/unavailable/not-configured/unsupported remain distinct and are never silently converted to zero or a guessed state.
9. **Writes require readback.** A service-call success is not product success. Confirmed canonical readback and persistence are required.
10. **Shared visual grammar belongs to Core.** Energy may own domain-specific diagrams/content but must not fork shared Hero, status, asset, editor, typography or responsive primitives.

### Product UX grammar

Normal users should encounter:

```text
status / answer
    ↓
primary action
    ↓
details
    ↓
diagnostics (explicit, technical)
```

The target information architecture is user-language-first:

```text
ENERGY
Overview / Solar / Battery / Consumption

INTELLIGENCE
Plan / Settings

INSIGHTS
Performance / Value
```

Operational/tactical/strategic planning capabilities may remain internal subviews beneath Plan. Simplifying navigation must never remove capability.

### Backend-gap ownership

`governance/BACKEND_GAPS.json` is authoritative. A required unmapped semantic is a release blocker, not an invitation for frontend compensation.

At handover time the important tracked ownership gaps include:

- planning reconciliation and canonical D0/D1 totals → Energy backend;
- Settings / automation / strategy write-readback and persistence → Energy backend;
- Mobility planning eligibility and producer-command coherence → Energy backend consuming Mobility V2;
- per-asset period energy/value attribution → Energy backend;
- Foundation Visual Registry V2 → backend merged, still requires target-runtime qualification.

### Definition of done

A consistent Energy candidate requires all of the following:

- static validation green;
- zero V1 product/runtime dependencies;
- zero accepted technical and feature debt;
- EN/NL/FR key completeness and user-safe copy;
- no technical jargon leakage on normal surfaces;
- Core provenance correct;
- HACS installation proof;
- desktop/tablet runtime render proof;
- planning, Settings, pricing and strategy behavior proven against backend truth;
- write/readback/restart persistence proven;
- upgrade and rollback proven;
- every blocking backend gap either closed or the release remains blocked;
- qualification bound to the exact immutable candidate SHA.

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
