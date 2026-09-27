# v4.2.8 — Gas hero design authority and frontend governance TEST CANDIDATE

This candidate uses the approved photographic Gas page hero supplied for Energy and tightens frontend ownership rules.

Changes:
- adds the approved wide Gas hero as a new immutable `gas-page-hero-v2.webp` asset;
- maps the Gas page explicitly to the new page-level hero and removes the legacy Gas page hero from page resolution;
- keeps gas-meter/device visuals separate from page-hero presentation;
- adds release-blocking checks for the canonical Gas hero mapping and packaged asset;
- clarifies that Robotix branding is owned by RHI UX Core and must not become a second domain authority;
- preserves the Core-owned Hero → Status → Page Controls → Body grammar and backend-owned Energy semantics;
- keeps HACS delivery on the immutable tagged `dist/` tree with no publication rebuild.

Rollback: v4.2.7.

Target Home Assistant desktop/iPad rendering, functional journeys, refresh/restart, upgrade and rollback proof remain separate runtime qualification gates.

Validation: full source/package validation, deterministic rebuild proof and HACS repository validation are required before publication.
