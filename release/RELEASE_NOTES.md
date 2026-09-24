# RHI Energy UX v3.98.1 — tab ownership and device visual coverage TEST CANDIDATE

## Scope

3.98.1 corrects the Energy information architecture and completes device-image coverage across the product tabs.

- Restores **Energy → Solar** as the actual Solar screen instead of a placeholder.
- Gives **Intelligence → Operational Planning** its own screen and removes solar hardware/configuration from it.
- Solar now owns production facts, panel/array topology, inverter system, battery relationship and solar support devices.
- Operational Planning now owns current flexible-load execution, next actions, requested power, reasons, and participation only.
- Audits all Energy tabs for Energy/Mobility device identity and adds canonical device artwork where an actual device/asset is being represented:
  - Overview active flexible-load contributors
  - Flow charging connections and physical consumers
  - Solar arrays/panels/inverters/batteries/support devices
  - Home Battery contributors
  - Consumers managed assets
  - Strategy participating assets and asset-targeted effective policy
  - Operational Planning flexible loads
  - Tactical Planning flexible-load headers and rows
  - Metering per-flexible-load rows
  - Value consumer allocation and flexible-load value rows
- Leaves semantic system lanes, totals, KPIs and retrospective evidence as icons/text rather than misleading product pictures.
- Replaces the blurred SolarEdge SE10K-RWB48 artwork with a crisp scalable vector product render and removes the old raster.
- Adds a release-blocking cross-tab information-architecture and device-visual regression gate.

## Compatibility

- Energy UX: 3.98.1
- Required/tested Energy backend: E0.15.32
- Energy contract: R1.89.44_CONTRACT
- Rollback release: v3.98.0
- Accepted technical debt: 0
- Accepted feature debt: 0

Target Home Assistant qualification remains mandatory before stable promotion.
