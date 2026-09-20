# RHI Energy UX v3.94.11 — TEST CANDIDATE

## Scope

Interaction-state stability closure over v3.94.10 without architecture or feature expansion.

- runtime updates refresh data without changing the active tab or viewport position;
- Metering and Value period selectors use one canonical selection/write path;
- backend Metering period hydrates the UX once and no longer takes over the user's local context on every HA update;
- Hour is supported consistently as a Metering period;
- Outlook keeps the requested horizon when data is temporarily unavailable instead of silently falling back to another horizon;
- Strategy keeps the requested profile when it is temporarily unavailable instead of silently showing another profile;
- regression gates protect these interaction-state invariants.

No Energy semantics, command ownership, screen structure or visual design is expanded.

## Compatibility

- Energy UX: 3.94.11
- Minimum backend: E0.15.12
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.10

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
