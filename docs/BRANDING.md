# Robotix Home Intelligence — Company Brand Contract

This package treats the Robotix company mark as a reusable product asset, not as module artwork.

## Canonical asset

- Source of truth: `source/assets/company-logo.svg`
- Distribution copy: `dist/assets/company-logo.svg`
- Background: transparent
- Primary company/building colour: `#0B4C86`
- Slogan colour: `#5B95C8`
- Slogan: `DomotiX · Network · Security`
- Aspect ratio: preserved from the canonical SVG viewBox

The asset must be copied unchanged when reused by another RHI module. Do not redraw it, recolour it, add a background, apply CSS filters, or reconstruct the text with local fonts.

## Header slot contract

The header owns layout; the asset owns brand geometry. Modules may tune only these CSS custom properties:

```css
--rhi-company-area-min
--rhi-company-area-max
--rhi-company-logo-max-width
--rhi-company-logo-max-height
--rhi-company-logo-padding
--rhi-company-divider
```

The logo itself must remain:

```css
display: block;
height: auto;
object-fit: contain;
object-position: center;
```

Desktop, tablet and mobile may override the shared slot tokens. They must not edit or crop the SVG.

## Ownership

- Brand asset ownership: shared RHI UX convention
- Module ownership: header placement and responsive slot sizing
- Build ownership: source asset → distribution asset synchronization
- Validation ownership: canonical hash, source/dist parity, approved copy/colours, no runtime redraw/filter

## Transfer to another module

Copy the canonical SVG unchanged, keep the same validation principles, and reuse the `--rhi-company-*` slot contract. Module-specific active colours belong to the module navigation and must never modify the company mark.
