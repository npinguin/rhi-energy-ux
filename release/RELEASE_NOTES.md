# v4.3.36-rc.10 — Real Power Flow Card Plus integration (HACS TEST CANDIDATE)

- Replace the static three-column Flow mock layout with a real Home Assistant Power Flow Card Plus card configured from canonical published sensors, with proper HA resource detection and explicit missing-card warnings.
- Grid import/export and Solar are connected only when unambiguous canonical available power sensors are published, optionally with the published site consumption source.
- Fail closed if the external frontend card or source sensors are missing; never calculate or invent Solar/Grid/Home flows. Battery direction is not mapped to the external card until the signed-sensor convention can be verified from a published contract.
- Below the interactive flow, show the full canonical flexible-load inventory (not just presently participating flow), plus charger connection and physical-consumer details. Charger and consumer power are distinct views, never added together.
- Preserve all existing heroes, other screens, Gas, Solar and Home Battery history and Core UX styling.
- New contract test for plugin configuration, missing/ambiguous sensors, units and full inventory.

Requires independently installed Power Flow Card Plus from HACS Dashboard. This is a HACS TEST CANDIDATE; deployment/browser and rollback tests still require a real HA installation.
Rollback: v4.3.36-rc.9.
