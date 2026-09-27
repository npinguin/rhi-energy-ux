# v4.3.2 — complete primary operational truth across Energy objects TEST CANDIDATE

Energy 4.3.2 completes the explicit Primary vs Details contract across the Energy object model after runtime review of 4.3.1.

## User-facing changes

- primary cards now prefer published operational truth over technical metadata for every supported Energy object class;
- Solar inverter cards surface current inverter/solar power and efficiency when published instead of collapsing to only “Status OK”;
- physical battery cards and Solar-embedded battery cards surface SoC, power, available energy and capacity when the public asset record publishes them;
- Solar panels and optimizers expose published production/electrical facts while keeping canonical panel→optimizer relationships intact;
- grid, gas, consumption, backup/support, vehicle and charger objects have explicit primary fact grammars;
- parent/system relationships appear on the primary surface only when a user-facing parent name is published/resolvable;
- managed Consumers/vehicles surface current power, energy needed, planned today and still-to-plan values when published, plus the canonical charger relationship;
- Home Battery aggregate adds current power and reserve to SoC, available energy, capacity and health;
- missing telemetry remains “Telemetry not published/limited” rather than becoming false device unavailability;
- technical identity, source, profile, lifecycle, publication completeness and diagnostics remain under **Details**.

## Engineering / drift control

- expands the object-by-object contract in issue #92 into executable regression coverage;
- uses only explicit public fields and canonical asset types/relationships; no name-based semantic inference;
- keeps Mobility as the visual authority for vehicles and chargers;
- adds no tabs, no backend semantics and no new presentation framework;
- preserves RHI UX Core **1.5.0** and deterministic tagged HACS delivery.

Rollback: **v4.3.1**.

This is an installable HACS test candidate. Target Home Assistant desktop/iPad runtime proof, live property verification, upgrade and rollback remain mandatory before qualification.
