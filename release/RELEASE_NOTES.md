# v4.3.18 — planning closure + unified appearance

- Incomplete vehicle charging needs remain visible in Tactical Planning with user-safe guidance.
- Energy appearance now consumes UX Core 1.5.3 canonical filter and image-choice primitives.

# RHI Energy UX 4.3.17 — STRUCTURAL_CAPABILITY_PRESENCE

- Consume Energy E0.15.81 backend-owned structural capability presence.
- Hide Home Battery and Gas when those optional subsystems are not configured in the home.
- Hide Consumers when no flexible-load capability is structurally present.
- Hide Value when no pricing source is configured.
- Remove absent Home Battery KPI/reserve placeholders from Overview.
- Keep configured-but-unavailable capabilities visible so faults and stale telemetry remain visible rather than being mistaken for absence.
- Keep structural presence semantics backend-owned and UX rendering presentation-only.
- Add release-blocking structural-presence regression coverage.

Minimum/tested backend: **E0.15.81**.
UX Core baseline: **1.5.2**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
