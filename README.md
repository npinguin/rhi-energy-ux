# Robotix Home Intelligence Energy UX

![Robotix Home Intelligence Energy UX](dist/assets/overview-hero.webp)

Public Home Assistant dashboard package for **Robotix Home Intelligence Energy**.

- UX release: **3.94.7**
- Minimum tested Energy contract: **R1.89.44_CONTRACT**
- Tested Energy backend: **R1.89.44**
- License: **GPL-3.0-only**

The Energy backend owns discovery, normalization, bindings, topology, planning, intelligence and command semantics. This UX consumes only backend-owned public runtime contracts.

## HACS installation

Add `npinguin/rhi-energy-ux` to HACS as a custom repository of type **Dashboard**, then install a published GitHub Release.

For the initial migration, install **v3.94.7**.

### 1. Install through HACS

1. Open **HACS**.
2. Open **Custom repositories**.
3. Add `https://github.com/npinguin/rhi-energy-ux`.
4. Select repository type **Dashboard**.
5. Install **Robotix Home Intelligence Energy UX**.
6. Select release **v3.94.7**.

HACS deploys the runtime from `dist/`. The expected Lovelace resource is:

```text
/hacsfiles/rhi-energy-ux/rhi-energy-ux.js
```

Normally HACS manages this resource automatically. Verify it under **Settings → Dashboards → Resources**.

### 2. Remove the legacy manual resource

Remove the old manually deployed Energy UX resource, for example:

```text
/local/homebrain/cards/homebrain-energy.bundle.js?v=R3.94.7
```

or any older `/local/homebrain/cards/homebrain-energy.bundle.js?v=...` entry.

Do not load both the legacy and HACS resources at the same time.

Do **not** delete the old files from `/config/www` until the HACS deployment has been verified on the target Home Assistant instance.

### 3. Dashboard YAML

Use the canonical card declaration:

```yaml
type: custom:homebrain-energy-card
```

A complete dedicated Energy view can be defined as:

```yaml
title: Energy
path: energy
icon: mdi:flash
type: panel
cards:
  - type: custom:homebrain-energy-card
```

If the existing dashboard already has the Energy card inside another view/layout, keep the surrounding dashboard YAML and replace only the card declaration with:

```yaml
type: custom:homebrain-energy-card
```

The compatibility alias `custom:homebrain-energy-domain-card` is still registered by v3.94.7, but new dashboard configuration should use `custom:homebrain-energy-card`.

### 4. Resource management

Most installations should let HACS manage the resource automatically. Verify it under **Settings → Dashboards → Resources**.

Do **not** paste a top-level `lovelace:` / `resources:` block into the dashboard raw configuration editor. That editor expects dashboard YAML with a top-level `views:` array.

If your Home Assistant instance explicitly manages Lovelace resources in `configuration.yaml`, use this there:

```yaml
lovelace:
  resources:
    - url: /hacsfiles/rhi-energy-ux/rhi-energy-ux.js
      type: module
```

For a dashboard managed through the raw configuration editor, use dashboard YAML such as:

```yaml
views:
  - title: Energy
    path: energy
    icon: mdi:flash
    type: panel
    cards:
      - type: custom:homebrain-energy-card
```

Remove the old `/local/homebrain/cards/homebrain-energy.bundle.js?...` resource entry from **Settings → Dashboards → Resources** once the HACS resource is present.

### 5. Verify after migration

After installing:

1. Reload or hard-refresh the Home Assistant frontend.
2. Confirm the Energy dashboard renders.
3. Confirm **Settings → Dashboards → Resources** contains only the HACS Energy UX resource, not the legacy resource.
4. Verify on desktop and iPad before removing the old manual files.
5. Keep the prior deployment files until runtime verification is complete.

Do not manually copy JavaScript or artwork to `/config/www` for new installations.

## Update and rollback

Published releases are immutable. Use HACS **Redownload / Need a different version?** to select an earlier release when rollback is required. The default branch is intentionally hidden from the version selector.

## Development

```text
npm ci
npm run validate
```

`dist/` is deployable runtime. A clean build must leave committed `dist/` unchanged.

See `COMPATIBILITY.json`, `BUILDING.md` and `docs/CONTRACT.md`.
