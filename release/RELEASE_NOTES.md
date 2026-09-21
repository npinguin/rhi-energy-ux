# RHI Energy UX v3.94.23 — TEST CANDIDATE

## Scope

Structural source/package release over v3.94.22. Energy product semantics, backend contracts, routes, planning meaning and user actions are intentionally unchanged.

- removes duplicated generated module code from the app source;
- establishes explicit source ownership under `src/app`, `src/runtime`, `src/domain` and `src/assets`;
- preserves historical module insertion points through `src/manifest.json`;
- makes `src/assets/` the single canonical artwork tree;
- promotes the previously dist-only hero artwork into canonical `src/assets/heroes/`;
- makes the build recreate `dist/` from scratch so stale generated assets cannot survive;
- creates structured asset categories `branding/` and `heroes/`;
- replaces `BUILD_MANIFEST.json` with a lean generated `PACKAGE_MANIFEST.json`;
- adds a committed runtime checksum;
- makes the immutable tag's complete `dist/` tree the HACS install package;
- makes GitHub Release assets evidence-only so HACS does not fall back to single-file plugin delivery;
- adds source ownership, asset policy, full package and HACS-install simulation gates;
- makes candidate publication idempotent.

## Compatibility

- Energy UX: 3.94.23
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.22

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
