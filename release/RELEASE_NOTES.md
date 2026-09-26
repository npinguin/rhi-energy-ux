# v4.2.0 — Unified Home Intelligence UX TEST CANDIDATE

Energy now consumes the shared RHI UX Core 1.4.0 visual system instead of maintaining page-level variants of the same product grammar.

Changes:
- standardises the Energy hero on the shared background-image hero used across Home Intelligence;
- keeps exactly one page status layer and removes obsolete duplicate KPI/status strips from Solar, Gas and Operational Planning;
- places status before Quick Actions on every shared Energy header;
- aligns Quick Actions to the shared Mobility-style blue primary / outlined secondary treatment;
- moves font-family, typography scale, shared hero/status/action styling and body grammar to RHI UX Core;
- applies the Home Assistant font authority through Core instead of a local Inter stack;
- keeps domain semantics and data ownership in Energy while shared look-and-feel stays Core-owned;
- adds a release-blocking shared-visual-ownership check to prevent local typography and shared-component drift;
- keeps the HACS package self-contained through the pinned build-time Core snapshot.

RHI UX Core: 1.4.0 at 50cf7e135c90af15cf34b4f41dfba78aa1a5fc5e.
Rollback: v4.1.4.

Target Home Assistant rendering, functional journeys, refresh/restart, upgrade and rollback proof remain mandatory before stable promotion.
