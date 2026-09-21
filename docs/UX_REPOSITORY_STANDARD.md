# RHI UX Repository Standard

This document defines the shared baseline for all Robotix Home Intelligence UX repositories.

## Mandatory architecture

Every UX package must have these logical owners:

- `src/app/` — application shell, navigation and rendering entry points.
- `src/runtime/` — Home Assistant/public backend contract boundary.
- `src/domain/` — canonical UX models/adapters/planning semantics.
- `src/assets/` — canonical package artwork grouped by category.
- `src/manifest.json` — explicit build composition/order.
- `src/OWNERSHIP.json` — source ownership.
- test ownership map — one invariant, one test owner.
- deterministic package builder under `tools/`.
- complete generated HACS package under `dist/`.

Physical names may differ where the implementation language differs (for example JavaScript vs Python tooling), but ownership semantics may not.

## Mandatory package model

`dist/` is the complete HACS install package and must contain:

- the runtime JS;
- runtime checksum;
- `PACKAGE_MANIFEST.json`;
- the full structured asset tree.

GitHub Releases for plugins with nested assets must not attach a release asset with the same filename as the runtime JS. The immutable Git tag owns the installable `dist/` tree; release assets are evidence only.

## Mandatory release lifecycle

```text
branch
→ generate complete dist package
→ PR
→ Source/package validation
→ HACS validation
→ squash merge
→ verify exact committed package
→ create or verify immutable tag
→ evidence-only GitHub Release
→ target Home Assistant qualification
→ stable promotion of the exact immutable candidate
```

Normal candidate build budget: two builds total:
1. candidate build;
2. deterministic rebuild proof.

Publication: zero builds.
Stable promotion: zero builds.

## CI cost rule

Source/package validation must complete successfully before the HACS validation job starts. Do not spend HACS runner/container time on a source candidate that already fails local deterministic checks.

Use concurrency cancellation for superseded PR commits.

## Ownership rules

- One source concern, one owner.
- One invariant, one test owner.
- Release identity has one machine authority.
- Asset semantics and asset transport are separate concerns.
- Generated output is never source authority.
- Documentation drift is machine-checked.
- A governance/documentation-only change may keep an existing published version only when the complete regenerated `dist/` package is byte-identical to the immutable tag.

## Mean and lean rule

Do not add a framework, registry, event bus, provider layer or shared package unless there is a proven repeated need across at least two real implementations or a public compatibility contract requires it.

Local explicit code is preferred over generic abstraction.

## Engineer handover rule

A new engineer should be able to determine, without reverse engineering:

1. where source authority lives;
2. who owns each concern;
3. how bundle order/composition is defined;
4. where canonical assets live;
5. exactly what HACS installs;
6. which tests own which invariants;
7. how a candidate is built, validated, published, qualified and rolled back;
8. which steps are forbidden to rebuild or mutate released bytes.

If any of these require guessing, repository governance has drifted.
