# RHI Energy UX Source and Package Governance

This document is normative for Energy UX and follows the RHI UX reference structure proven in Mobility.

## Principle

**One source concern, one owner. One canonical source tree, one canonical asset tree, one HACS package tree.**

Do not maintain the same module code both as a standalone module and as a copied block inside the app source.

## Canonical source skeleton

```text
src/
  manifest.json
  OWNERSHIP.json
  app/
    energy-card.js
  runtime/
    public-interface-registry.js
    energy-contract-gateway.js
    consumption-contract.js
    command-contract.js
    command-action-model.js
  domain/
    models/
      current-energy-view-model.js
      physical-flow-view-model.js
      metering-status-model.js
      flexible-asset-model.js
    planning/
      contract-adapter.js
      planning-contract.js
      planning-view-model.js
  assets/
    branding/
      company-logo.svg
    heroes/
      *.webp
```

The app contains three build placeholders at the historical module insertion points. `src/manifest.json` owns which canonical modules are inserted at each point and in which order. This preserves runtime ordering without duplicating module source.

## Dependency direction

```text
app presentation
      ↓
runtime public-contract boundary
      ↓
domain models / planning adapters
      ↓
rendered user experience
```

Home Assistant/public contract entity access belongs to runtime/gateway ownership. Domain models normalize meaning. App code renders that meaning.

## Asset framework

`src/assets/` is the only canonical artwork source.

The build recursively mirrors its relative tree under `dist/assets/`.

Examples:

```text
src/assets/branding/company-logo.svg
→ dist/assets/branding/company-logo.svg
→ /hacsfiles/rhi-energy-ux/assets/branding/company-logo.svg

src/assets/heroes/overview-hero.webp
→ dist/assets/heroes/overview-hero.webp
→ /hacsfiles/rhi-energy-ux/assets/heroes/overview-hero.webp
```

Future real categories can be added without changing build code.

## HACS package

`dist/` is the complete HACS install package:

```text
dist/
  rhi-energy-ux.js
  rhi-energy-ux.js.sha256
  PACKAGE_MANIFEST.json
  assets/
    branding/
    heroes/
```

There is no parallel generated root asset tree.

For HACS Dashboard/plugin packages with nested assets, the GitHub Release must not attach a release asset named `rhi-energy-ux.js`. That would force HACS single-file mode and omit nested assets. The immutable tag owns the complete installable `dist/` tree; GitHub Release assets are evidence only.

## Package manifest

`dist/PACKAGE_MANIFEST.json` is generated and records package version, source-manifest schema, runtime SHA-256, asset categories and file inventory/byte sizes. It is evidence, not an independent source of truth.

## Migration sequence

Energy follows the corrected sequence learned from Mobility:

1. governance/test ownership first;
2. restructure canonical source without product redesign;
3. normalize assets;
4. update build/package gates;
5. generate and commit complete `dist/` before PR;
6. run candidate build + owned tests + deterministic second build + HACS validation;
7. merge and publish idempotently;
8. only then perform target Home Assistant qualification.

No half-generated review state and no post-publication mutation are allowed.

## Mean and lean rule

Add an abstraction only when there is a second real implementation, repeated drift that one owner cannot contain, or a public contract requiring stability. Otherwise keep the implementation explicit and local.
