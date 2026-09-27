# RHI Energy UX 4.3.13 — SOLAR_HIERARCHY_VALUE_UX

- Nest Solar strings under their canonical inverter instead of presenting strings as peer hardware cards.
- Keep optimizer and panel detail below the string and suppress empty “No panels linked” boxes.
- Replace the verbose “From panel to home” story with one compact live value flow: **Solar → Battery → Home ↔ Grid**.
- Keep inverter hardware as Solar detail rather than a primary energy-flow node.
- Replace the image picker / wizard hybrid with one compact image editor: optional brand filter, draft selection, explicit Save, Cancel and profile-default reset.
- Persist an image only on explicit Save; Cancel leaves the stored preference unchanged.
- Keep hierarchy and live values contract-driven; the UX does not invent missing topology or energy allocation.

Minimum/tested backend: **E0.15.77**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
