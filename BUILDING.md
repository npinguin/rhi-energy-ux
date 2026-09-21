# Building RHI Energy UX

Canonical source lives under `src/`. The app template is `src/app/energy-card.js`; canonical runtime/domain modules are inserted according to `src/manifest.json`.

```text
npm ci
npm run validate
```

The build recreates `dist/` from scratch and produces the complete HACS package:

```text
dist/
  rhi-energy-ux.js
  rhi-energy-ux.js.sha256
  PACKAGE_MANIFEST.json
  assets/
    branding/
    heroes/
```

Release acceptance requires:

- package/release metadata identity matches;
- canonical source ownership and asset policy pass;
- contract, architecture, UX and regression tests pass;
- simulated HACS full-tree installation passes;
- a deterministic second build matches the first;
- committed `dist/` matches the clean build;
- HACS repository validation passes;
- publication performs no rebuild;
- GitHub release/tag versions are immutable.

Do not edit `dist/` manually.
