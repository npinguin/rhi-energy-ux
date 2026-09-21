# RHI Energy UX v3.94.20 — TEST CANDIDATE

## Scope

Shared company-brand package and header-slot cleanup over v3.94.19. No Energy backend semantics, routes, planning logic or command ownership change.

- replaces the prior traced company mark with the approved transparent Robotix logo used for the shared module direction;
- keeps dark-blue Robotix.be and building artwork while rendering “DomotiX · Network · Security” in the approved lighter blue;
- keeps `source/assets/company-logo.svg` as the single canonical company-brand source;
- keeps build-time source → dist byte parity and immutable brand hash validation;
- binds the runtime through one `COMPANY_LOGO_ASSET` constant instead of scattering asset paths;
- introduces portable `--rhi-company-*` header tokens for slot width, height, padding and divider styling;
- keeps the company logo unfiltered and transparent so the same asset can be reused unchanged by Energy, Mobility and future modules;
- preserves the approved two-level navigation, compact gray second-line icons and responsive behaviour.

## Compatibility

- Energy UX: 3.94.20
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.19

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
