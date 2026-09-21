# Robotix Home Intelligence Energy UX

![Robotix Home Intelligence Energy UX](dist/assets/overview-hero.webp)

Public GPL-3.0-only Home Assistant dashboard package for **Robotix Home Intelligence Energy**.

- UX release: **3.94.22**
- Backend minimum for this release: **E0.15.25**
- Legacy UX contract compatibility: **R1.89.44_CONTRACT**
- HACS category: **Dashboard**
- Runtime artifact: `dist/rhi-energy-ux.js`

The backend owns Energy semantics. The UX renders backend-owned public contracts and never invents the backend version.

Company branding is source-owned at `source/assets/company-logo.svg`. The build copies this canonical transparent vector asset byte-for-byte to `dist/assets`; runtime code must not redraw, recolour, filter or synthesize the company mark. The browser-facing logo URL is versioned with the UX package version so an already-open Chrome profile cannot keep serving an older cached logo after an update. Shared sizing is controlled only through the `--rhi-company-*` header tokens so the same asset and slot contract can be reused by other RHI modules.

## Install with HACS

### First-time install

1. Open **HACS** → **Custom repositories**.
2. Add `https://github.com/npinguin/rhi-energy-ux`.
3. Select **Dashboard**.
4. Install **v3.94.22** for this TEST CANDIDATE qualification.
5. Go to **Settings → Dashboards → Resources**.
6. Confirm this resource exists as **JavaScript Module**:

```text
/hacsfiles/rhi-energy-ux/rhi-energy-ux.js
```

Do not manually copy JavaScript or artwork to `/config/www` for a normal HACS install.

### Migrate from the old manual Energy UX

When the HACS resource above is present, remove the old active resource such as:

```text
/local/homebrain/cards/homebrain-energy.bundle.js?v=...
```

Do **not** load the old and HACS bundles at the same time.

Keep the old files on disk until the HACS runtime has been verified on the target Home Assistant instance.

## Copy-paste dashboard YAML

For a dedicated Energy dashboard, **Edit dashboard → Raw configuration editor** must contain a top-level `views:` array:

```yaml
views:
  - title: Energy
    path: energy
    icon: mdi:flash
    type: panel
    cards:
      - type: custom:homebrain-energy-card
```

If your existing dashboard already has its own view/layout, keep that YAML and use only this card declaration where the Energy card belongs:

```yaml
type: custom:homebrain-energy-card
```

### Important: do not paste resource YAML into the dashboard editor

This is **not** dashboard YAML:

```yaml
lovelace:
  resources:
    - url: /hacsfiles/rhi-energy-ux/rhi-energy-ux.js
      type: module
```

Use that block only in `configuration.yaml` on installations that explicitly manage Lovelace resources in YAML. Most HACS installations should let HACS manage the resource.

If Home Assistant reports **"views -- Expected an array"**, you pasted resource configuration into the dashboard editor. Replace it with the `views:` example above.

## Runtime verification

After install or update:

1. Hard-refresh the Home Assistant frontend.
2. Open Energy and verify the card renders.
3. Verify desktop and iPad.
4. Confirm only the HACS Energy UX resource is active.
5. Check the footer:
   - healthy: quiet gray `RHI Energy UX 3.94.22 · Backend E0.15.25`;
   - problem: the short issue summary becomes amber/red;
   - click `issues · details` to expand the concrete runtime/backend conditions and verification guidance.
6. Only after this proof, remove obsolete files under `/config/www/homebrain/...`.

The backend version comes only from `sensor.energy_release_contract.backend_release`. If that value is wrong, fix the backend release contract; the UX must not map or guess it.

## Update and rollback

Published GitHub releases are immutable. TEST CANDIDATE releases are normal GitHub Releases so HACS exposes them without enabling beta/prerelease versions; qualification status is tracked separately.

To rollback:

**HACS → Robotix Home Intelligence Energy UX → Redownload / Need a different version? → select the previous release.**

For the 3.94.22 rollout, select **v3.94.22** while qualifying the TEST CANDIDATE. The rollback target is **v3.94.21**.

## Development

```text
npm ci
npm run validate
```

A release is valid only when validation is green and rebuilding leaves committed `dist/` unchanged.

See `BUILDING.md`, `docs/CONTRACT.md`, `docs/BRANDING.md`, `docs/UX_RELEASE_STANDARD.md`, `docs/UX_FOOTER_STANDARD.md` and `docs/RELEASE_GOVERNANCE.md`.
