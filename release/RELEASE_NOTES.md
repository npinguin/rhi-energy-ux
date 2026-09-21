# RHI Energy UX v3.94.24 — HACS full-tree delivery correction TEST CANDIDATE

## Scope

Release-governance/package-delivery correction over v3.94.23. Energy product semantics, backend contracts, routes, planning meaning and user actions are unchanged.

## Root cause

Current HACS tagged-plugin installation prefers GitHub Release assets whenever a tagged release has any assets. The previous RHI UX model attached checksum/manifest/qualification files as “evidence-only” assets. On a clean install HACS therefore installed those attachments instead of materializing the immutable tag's complete `dist/` package, so runtime JS and nested assets could disappear.

## Correction

- GitHub Release remains HACS-visible but contains **zero assets**.
- The immutable Git tag owns the complete `dist/` package.
- `content_in_root: false` retains the standard nested `dist/` plugin layout.
- Candidate publication and stable promotion fail if any GitHub Release asset exists.
- HACS install simulation now models actual tagged-release selection before installing the `dist/` tree.
- Qualification remains repository-governed and is never uploaded as a release asset.
- No Energy runtime/product behavior is changed.

## Compatibility

- Energy UX: 3.94.24
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.23

Target Home Assistant qualification must use a clean HACS install and prove that `www/community/rhi-energy-ux/` contains `rhi-energy-ux.js` and the complete packaged `assets/` tree before runtime promotion.
