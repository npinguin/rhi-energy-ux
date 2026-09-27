# RHI Energy UX 4.3.14 — RELEASE_CLOSURE

- Persist Energy-owned appearance selection through Energy Public V2 instead of browser-local storage.
- Use canonical backend `energy.*` visual refs and normal write/readback semantics.
- Keep Mobility producer visuals authoritative and non-overridable from Energy.
- Converge Energy appearance editing on the shared RHI UX Core 1.5.2 picker shell.
- Make Solar cards compact and energy-first: primary operational facts stay visible; technical metadata stays under Details.
- Preserve 4.3.13 Solar hierarchy, E0.15.77 automation authority and all Metering/Value/Retrospective closures.

Minimum/tested backend: **E0.15.78**.
RHI UX Core: **1.5.2 @ 16a217a33f6a7cc90d42ad83492e90ba1d364eee**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
