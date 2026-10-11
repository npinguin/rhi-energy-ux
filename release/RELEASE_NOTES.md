# v4.3.36-rc.8 — Solar production hierarchy visibility (HACS TEST CANDIDATE)

- Restore immediately visible Solar Production → inverter → zone/string hierarchy in the Energy UX without semantic relationship reconstruction.
- Keep 40 optimizer cards discoverable through per-zone progressive disclosure instead of forcing multiple closed ancestors.
- Preserve canonical parent_asset_id authority, physical-source provenance and HA-native flat device projection.
- Add hierarchy visibility regression protection; tested against static source/package and HACS delivery gates.
- Coordinated installed backend evidence: Foundation F1.8.44, Energy E0.15.119, Mobility M0.10.47.

This is a TEST CANDIDATE, not a stable approval. Target Home Assistant desktop/tablet/mobile hierarchy, source links, reload and rollback remain to be qualified.
Rollback: v4.3.36-rc.7.
