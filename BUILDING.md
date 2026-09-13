# Building RHI Energy UX

R3.94.7 is the HACS migration baseline of the existing Energy UX. No backend semantics are reimplemented in the build.

```text
npm ci
npm run validate
```

`source/homebrain-energy-card.js` remains canonical for this baseline. `source/modules/` contains backend-contract and view-model modules synchronized into that source. The build writes `dist/rhi-energy-ux.js` and only rewrites legacy artwork URLs to the HACS-owned `/hacsfiles/rhi-energy-ux/assets/` namespace.

A release is valid only when `npm run validate` passes and a rebuild leaves `dist/` unchanged.
