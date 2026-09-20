# Building RHI Energy UX

The canonical source is `source/homebrain-energy-card.js`. The build produces the single HACS runtime `dist/rhi-energy-ux.js` and rewrites only artwork URLs to the HACS-owned asset namespace.

```text
npm ci
npm run validate
```

Release acceptance requires:

- package/source/dist version identity matches;
- syntax, contract, architecture and regression tests pass;
- HACS package/public-repository checks pass;
- a clean rebuild leaves committed `dist/` unchanged;
- the release is created only from validated `main`;
- GitHub release/tag versions are immutable.

Do not edit `dist/rhi-energy-ux.js` manually.
