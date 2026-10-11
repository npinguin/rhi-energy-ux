# v4.3.36-rc.5 — Shared Core asset grammar layout correction (HACS TEST CANDIDATE)

- Repair a structural CSS collision: legacy Energy device cards still supplied an outer narrow image column around the shared `rhiUxAssetIdentity`, whose Core grammar already contains its own visual and title columns. This squeezed Gas identity and fact text and caused overlap on tablet and desktop.
- Use the Core-asset-specific grid rule for identity, facts, relationships and disclosures; auto-fit fact tiles by available width. Apply to all core-backed Energy device cards, not a gas-entity special case.
- Preserve all canonical data, ownership and actions. No screen-level numeric corrections or hardcoded asset IDs.
- Responsive markup/CSS regression added; source/package/HACS deterministic validation required.
- Carry forward rc.4 canonical flexible inventory and available-power changes. HA tablet/desktop/mobile visual qualification and rollback remain pending. **Not stable**.

Compatibility: Energy E0.15.116+; Foundation F1.8.44; UX Core 1.6.3. Rollback: v4.3.36-rc.4.
