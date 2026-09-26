# v4.2.1 — Energy header/status hotfix TEST CANDIDATE

This hotfix closes the remaining visual drift found after v4.2.0.

Changes:
- enforces the canonical Core page stack as Hero → Status → Quick Actions;
- updates Energy to RHI UX Core 1.4.1, where the page order is an explicit CSS invariant;
- removes duplicate headline/status surfaces from Solar, Gas, Home Battery, Outlook and Tactical Planning;
- keeps page detail and domain-specific body content, but prevents a second KPI/status row from appearing below the canonical status layer;
- extends release-blocking visual ownership checks so these duplicate surfaces cannot be reintroduced silently.

RHI UX Core: 1.4.1 at 7e035980b690719ff9c05876e905322194d52df2.
Rollback: v4.2.0.

Target Home Assistant rendering and runtime qualification remain separate evidence gates.
