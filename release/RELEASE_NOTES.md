# RHI Energy UX 4.3.16 — STRICT_SOLAR_PRODUCT_HIERARCHY

- Enforce the Solar body in exactly two primary sections: Home Battery, then Solar Production.
- Nest physical inverter cards inside Solar Production instead of rendering a sibling Inverter System section.
- Nest each canonical string below its inverter.
- Nest optimizer/panel combo cards below each canonical string.
- Keep identity and key energy properties visible; technical metadata stays foldable under Details.
- Present unresolved topology only as a folded diagnostic exception and never guess ownership.
- Keep the Appearance entry point visible whenever the backend directly publishes an Energy-owned write route and a compatible visual catalog exists.
- Pair with Energy E0.15.80 exact-serial SolarEdge topology closure.
- Preserve Mobility producer-owned visual precedence and shared UX Core 1.5.2 picker grammar.

Minimum/tested backend: **E0.15.80**.
UX Core baseline: **1.5.2**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
