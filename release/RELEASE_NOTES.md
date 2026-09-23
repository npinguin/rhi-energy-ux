# RHI Energy UX v3.95.2 — Mobility rc.38 visual parity TEST CANDIDATE

## Scope

Presentation-only closure over v3.95.1. Energy keeps its own semantics and content but now uses the same top-level visual grammar as Mobility rc.38.

## User experience

- Uses the Mobility Overview/rc.38 hero geometry on every Energy destination.
- Hero contains only section label, title, purpose and artwork — no live value, badge or mini status inside the hero.
- Keeps exactly four primary status cards directly under the hero on desktop and tablet; phone collapses to two columns.
- Places Quick Actions directly below the status cards with the same height, border, spacing and primary-action treatment as Mobility.
- Adds a consistent action bar to Home Battery and any top-level view that had no explicit actions.
- Leaves Energy-specific body content, planning, strategy, pricing, battery, metering and command semantics unchanged.

## Governance

- Adds an executable visual-parity gate against the Mobility rc.38 presentation contract.
- HACS structured `dist/assets/**` package delivery remains unchanged.
- Backend/domain contract delta: none.
- Accepted technical debt: 0.
- Accepted feature debt: 0.

## Compatibility

- Energy UX: 3.95.2
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.95.1

## Qualification

Static/package validation is required before publication. Target Home Assistant runtime proof must confirm Overview, Flow, Solar, Home Battery, Consumers, Strategy, Planning, Metering, Value and Retrospective maintain the shared hero/status/action hierarchy on desktop and iPad.
