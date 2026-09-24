# RHI Energy UX v3.96.3 — canonical asset visuals everywhere TEST CANDIDATE

## Scope

3.96.3 closes the remaining text-only asset identity gaps in Value and consumer-allocation views.

- Consumer allocation preserves canonical source identity and visual_ref.
- Known consumers render picture + human asset name instead of technical hashes.
- Pricing of flexible loads renders the same asset visual used elsewhere.
- Disabled flexible loads and exception summaries remain picture-first.
- visual_ref stays the only cross-domain visual identity; Energy UX resolves it against its own packaged artwork.

## Compatibility

- Energy UX: 3.96.3
- Required/tested Energy backend: E0.15.32
- Mobility producer bundle: M0.10.1
- Rollback release: v3.96.2
- Accepted technical debt: 0
- Accepted feature debt: 0

Target Home Assistant qualification remains mandatory.
