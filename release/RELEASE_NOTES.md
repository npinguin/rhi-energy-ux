# RHI Energy UX v3.94.12 — TEST CANDIDATE

## Scope

Lifecycle interaction-state closure over v3.94.11 without architecture or feature expansion.

- persists only stable user navigation context across Home Assistant card recreation;
- restores active view, Metering/Value period, Outlook/Planning/Metering horizons, sorts, filters, selected Strategy profile and card-local scroll/disclosure state;
- excludes drafts, command/write feedback and other runtime-ephemeral state from persistence;
- prevents restored Metering period from being overwritten by fresh backend hydration after card recreation;
- removes silent first-item fallback from the generic scope selector;
- makes Consumers sort defaults consistent;
- includes local interaction state in the render signature so user sort/filter/profile changes cannot be skipped;
- adds executable card-recreation regression proof in the bundle-load test.

No Energy semantics, command ownership, screen structure or visual design is expanded.

## Compatibility

- Energy UX: 3.94.12
- Minimum backend: E0.15.12
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.11

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
