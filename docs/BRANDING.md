# Robotix Home Intelligence — Company Brand Contract

The canonical Robotix company mark is owned by **RHI UX Core**.

Energy must not copy, redraw, recolour, transport or independently validate the company logo. The pinned build-time Core snapshot provides `rhiUxCompanyBrand()` and the canonical inline SVG used by `rhiUxDomainShell()`.

## Ownership

- RHI UX Core owns the canonical company artwork, geometry and shared brand-slot presentation.
- Energy owns only domain navigation metadata, state and Energy-specific composition.
- Energy may not introduce `src/assets/branding/company-logo.svg`, a package-local company-logo URL, or a second branding hash.
- Core remains build-time only; the Energy HACS artifact stays runtime-standalone.

## Validation

Energy validation is a boundary test: it verifies that the pinned Core declares `branding_owner: rhi-ux-core`, that the Core brand primitive is bundled, and that no Energy-local company-logo transport exists.
