# Robotix Home Intelligence Energy UX

Public Home Assistant dashboard package for **Robotix Home Intelligence Energy**.

- UX release: **3.94.7**
- Minimum tested Energy contract: **R1.89.44_CONTRACT**
- Tested Energy backend: **R1.89.44**
- License: **GPL-3.0-only**

The Energy backend owns discovery, normalization, bindings, topology, planning, intelligence and command semantics. This UX consumes only backend-owned public runtime contracts.

## HACS installation

Add `npinguin/rhi-energy-ux` to HACS as a custom repository of type **Dashboard**, then install a published GitHub Release. HACS installs the contents of `dist/` and manages the Lovelace module resource.

Use the card as:

```yaml
type: custom:homebrain-energy-card
```

Do not manually copy JavaScript or artwork to `/config/www`.

## Update and rollback

Published releases are immutable. Use HACS **Redownload / Need a different version?** to select an earlier release when rollback is required. The default branch is intentionally hidden from the version selector.

## Development

```text
npm ci
npm run validate
```

`dist/` is deployable runtime. A clean build must leave committed `dist/` unchanged.

See `COMPATIBILITY.json`, `BUILDING.md` and `docs/CONTRACT.md`.
