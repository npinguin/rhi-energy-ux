# v4.3.36-rc.9 — Power Flow Card Plus dependency readiness (HACS TEST CANDIDATE)

- Flow detects actual browser registration of Power Flow Card Plus after a short loading grace period, and rechecks when its custom element registers later.
- If missing or unloaded, show a nonblocking status with exact HACS Dashboard resource and installation guidance; all Energy tabs remain usable.
- Detect runtime registration only: HACS cannot enforce installing another custom dashboard card or guarantee a specific resource version.
- This candidate does NOT yet replace existing RHI Flow visualization with Power Flow Card Plus; that requires explicit canonical adapter and rendering validation.
- Tests protect ready/checking/missing messages and report/recovery mechanics. Existing heroes, charts and Core branding stay untouched.

Home Assistant runtime validation and rollback proof are still pending. Rollback: v4.3.36-rc.8.
