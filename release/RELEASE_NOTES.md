# RHI Energy UX v3.94.17 — TEST CANDIDATE

## Scope

Premium header/branding refinement over v3.94.16. No Energy backend semantics, routes, planning logic or command ownership change.

- aligns the left product identity vertically with the primary navigation;
- presents the hierarchy as Home Intelligence → ENERGIE;
- keeps Energy / Intelligence / Insights as the primary functional navigation;
- keeps contextual tabs as the quieter second navigation layer;
- adds the Robotix.be company mark in dark blue with the exact slogan “DomotiX · Network · Security”;
- isolates the company mark as the single replaceable asset `dist/assets/company-logo.svg`;
- preserves the shared outer frame, routing, session persistence and omni-device behaviour;
- upgrades the section glyphs to lightweight vector icons while retaining section-specific active accents.

## Compatibility

- Energy UX: 3.94.17
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.16

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
