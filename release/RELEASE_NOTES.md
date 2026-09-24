# RHI Energy UX v3.96.2 — picture-first asset identity TEST CANDIDATE

## Scope

3.96.2 makes visual asset recognition a default Energy UX principle instead of a screen-specific enhancement.

Backend-published `visual_ref` remains the only cross-domain identity. Energy UX resolves that key against its own packaged artwork and now renders the corresponding asset picture consistently in Flexible Loads, Tactical Planning, Outlook and operational summaries.

## Ownership

- Foundation owns visual registry mechanics and global key validation.
- Mobility owns assignment of vehicle/charger `visual_ref`.
- Energy E0.15.32 preserves producer-owned visual identity without interpretation.
- Energy UX owns local artwork, filters, sizing and presentation.
- Missing artwork falls back explicitly to a domain icon; text-only rendering is not the default when a known visual exists.

## Compatibility

- Energy UX: 3.96.2
- Required/tested Energy backend: E0.15.32
- Mobility producer bundle: M0.10.1
- Energy contract: R1.89.44_CONTRACT
- Accepted technical debt: 0
- Accepted feature debt: 0
- Rollback release: v3.96.1

Target Home Assistant qualification remains mandatory.
