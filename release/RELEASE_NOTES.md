# RHI Energy UX v3.95.3 — hero/status stacking correction TEST CANDIDATE

## Scope

Focused presentation correction over v3.95.2.

The v3.95.2 rc.38 styles were present, but an older Energy two-column `.hiTabExperienceHeader` grid template still survived and placed the hero beside the status cards. v3.95.3 explicitly overrides that layout owner.

## User experience

- Hero spans the full page width below navigation.
- Four status cards render in their own row directly below the hero.
- Quick Actions remain in the next row.
- Energy-specific content remains below that hierarchy.
- Existing Energy hero imagery, semantics, controls and backend contracts are unchanged.

## Governance

- Adds a regression gate requiring a one-column top-level header stack.
- Accepted technical debt: 0.
- Accepted feature debt: 0.

## Compatibility

- Energy UX: 3.95.3
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Rollback release: v3.95.2
