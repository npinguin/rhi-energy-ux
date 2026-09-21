# RHI Energy UX v3.94.14 — TEST CANDIDATE

## Scope

Navigation and premium-header refactor over v3.94.13. No backend semantics or product-control behavior is moved in this release.

- introduces the two-level information architecture:
  - Energy → Overview, Flow, Solar, Home Battery, Consumers;
  - Intelligence → Strategy, Operational Planning, Tactical Planning, Strategic Planning;
  - Insights → Metering, Value, Retrospective;
- maps the existing Solar renderer to Intelligence / Operational Planning;
- maps the existing Planning renderer to Intelligence / Tactical Planning;
- maps the existing Strategies renderer to Intelligence / Strategy;
- adds structural placeholder routes for the new Energy / Solar and Intelligence / Strategic Planning screens without inventing content;
- preserves legacy Outlook and Intelligence route intent by migrating them into the new Intelligence navigation rather than deleting their code;
- makes navigation section + item part of lifecycle-persistent interaction context;
- keeps per-section last location and card recreation stability;
- places one premium semantic banner directly below the two navigation layers;
- removes the old oversized top page title from the active layout;
- keeps the navigation omni-device: fixed three-section layer and horizontally scrollable contextual second layer on narrow screens;
- keeps Tactical Planning on the same premium header contract as the other visible tabs.

## Compatibility

- Energy UX: 3.94.14
- Minimum backend: E0.15.24
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.94.13

Stable promotion remains blocked until target Home Assistant runtime and rollback proof are PASS.
