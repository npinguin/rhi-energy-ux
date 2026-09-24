# RHI Energy UX v3.96.3 — Energy-wide asset identity TEST CANDIDATE

## Scope

3.96.3 completes picture-first asset identity across the remaining Energy UX surfaces visible in the target runtime.

- Consumers managed assets show the canonical asset picture.
- Strategy participating assets show the canonical asset picture.
- Metering Flexible Load rows show the canonical asset picture and suppress invalid `undefined` source labels.
- Value flexible-load pricing rows show the canonical asset picture.
- Value consumer allocation attempts a canonical Flexible Asset join before falling back to the published consumer identity.
- Existing Planning/Flow/Outlook picture-first rendering from 3.96.2 remains intact.

The UX still resolves only backend-published `visual_ref` against its own packaged artwork.

Compatibility:
- Energy backend: E0.15.32
- Mobility producer: M0.10.1
- Rollback: v3.96.2
- Accepted technical debt: 0
- Accepted feature debt: 0

Target Home Assistant runtime proof remains mandatory.
