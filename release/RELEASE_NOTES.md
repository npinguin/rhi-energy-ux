# RHI Energy UX v3.98.0 — Solar hardware hierarchy and product artwork TEST CANDIDATE

## Scope

3.98.0 restores clear information architecture and makes Solar the canonical hardware/configuration experience.

- Removes the Physical energy devices inventory from Flow.
- Keeps Tactical/Operational Planning focused on planning, allocations, loads, exceptions and execution status; no hardware inventory is rendered there.
- Removes the misplaced Operational overview block from Solar.
- Adds a hierarchical Solar hardware experience:
  - Solar arrays / zones with per-zone representative panel selection.
  - Inverter system with child inverters.
  - Battery system aggregate with physical child batteries.
  - Solar support devices such as optimizers and backup interfaces.
- Keeps the user-facing panel → inverter → Home Bus → battery/grid explanation based on measured facts without inventing source allocation.
- Extends the type-safe picker so each solar array can independently select SunPower SPR-X21-335-BLK or JinkoSolar JKM435N-54HL4R artwork.
- Adds dedicated verified product artwork for the Energy hardware catalog and keeps product images centered/contained in uniform library canvases.
- Removes dead helper code introduced by the earlier flat hardware implementation.
- Adds release-blocking regression coverage for Flow/Planning separation and Solar ownership.

## Compatibility

- Energy UX: 3.98.0
- Required/tested Energy backend: E0.15.32
- Energy contract: R1.89.44_CONTRACT
- Rollback release: v3.97.1
- Accepted technical debt: 0
- Accepted feature debt: 0

Target Home Assistant qualification remains mandatory before stable promotion.
