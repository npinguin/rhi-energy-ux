# RHI Energy UX 4.3.15 — SOLAR_RELEASE_CLOSURE

- Keep Home Battery first in the Solar hardware body.
- Show Solar Production, then inverter cards, then each inverter's strings, then optimizer/panel combo cards.
- Keep identity and key energy properties primary; full technical metadata remains foldable under Details.
- Remove the bottom Solar energy facts/product-noise section from normal Solar UX.
- Add an explicit visible Appearance action for writable Energy-owned assets while preserving image-click entry.
- Persist appearance through Energy backend write/readback only.
- Preserve Mobility producer visual ownership.
- Pair with Energy E0.15.79 so Home Battery aggregate SoC is mathematically consistent with aggregate available/capacity energy.

Minimum/tested backend: **E0.15.79**.
UX Core baseline: **1.5.2**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
