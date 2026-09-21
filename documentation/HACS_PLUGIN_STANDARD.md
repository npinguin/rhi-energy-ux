# RHI UX HACS Plugin Standard

This repository uses the standard HACS plugin distribution layout.

## Canonical repository layout

```text
repo/
├─ hacs.json
├─ src/
├─ dist/
│  ├─ <plugin>.js
│  ├─ <plugin>.js.sha256
│  ├─ PACKAGE_MANIFEST.json
│  └─ assets/
└─ ...
```

`hacs.json` must declare the plugin filename and explicitly set:

```json
"content_in_root": false
```

For HACS plugin repositories this means the distributable payload is taken from `dist/`. HACS installs the contents of that remote `dist/` directory into the local plugin directory under `www/community/<repo>/`; the local resource therefore remains:

```text
/hacsfiles/<repo>/<plugin>.js
```

Do not duplicate generated runtime/assets at repository root. Do not set `content_in_root: true` unless the repository is deliberately redesigned as a root-content plugin.

## Release model

- `dist/` is generated and committed before publication.
- The immutable tag contains the exact validated `dist/` tree.
- Publication does not rebuild.
- GitHub Releases for tagged HACS plugins carry **zero assets**. This is mandatory: current HACS prefers release assets for tagged plugin installs whenever any release assets exist, even when those files are only intended as evidence.
- The normal GitHub Release remains the version/discovery surface and contains release notes only. The immutable Git tag owns the installable `dist/` tree.
- Qualification evidence remains in the governed repository record and release notes; it is never uploaded as a GitHub Release asset.

## Required validation

Every RHI UX repository must prove all of the following before publication:

1. `hacs.json.filename` exists at `dist/<filename>`.
2. `content_in_root` is explicitly `false`.
3. Simulated HACS installation strips the remote `dist/` prefix and produces:
   ```text
   www/community/<repo>/<filename>
   www/community/<repo>/assets/...
   ```
4. All files in `PACKAGE_MANIFEST.json` exist after simulated installation.
5. The generated JS passes syntax validation.
6. The installed/generated JS executes in the bundle-load smoke test and registers the expected custom element(s).
7. Nested asset references resolve to installed files.
8. Publication and stable-promotion workflows create/upload **zero GitHub Release assets**.
9. HACS validation passes.

A green source/build test without points 3 and 6 is not sufficient installation proof.

## Runtime qualification

Static HACS validation is not the same as target Home Assistant qualification.

After HACS installation/update, verify on the target Home Assistant instance:

- the resource exists at `/hacsfiles/<repo>/<filename>`;
- requesting that resource returns JavaScript rather than 404/HTML;
- the expected custom element is registered;
- the dashboard renders without `Custom element doesn't exist`;
- nested assets load;
- hard refresh/reload works;
- rollback to the previous immutable release works.

Target-runtime failure blocks promotion even when CI is green.
