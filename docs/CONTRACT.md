# Backend-to-Frontend Contract — Current Boundary

## Principle

Backend publishes complete product truth. UX validates, normalizes and presents it. UX does not reconstruct business meaning, readiness, routing or write targets.

## Required per-asset semantics

Where applicable, backend publishes explicit:

- identity and taxonomy;
- participation state;
- physical/operational state;
- control mode;
- execution origin;
- planning eligibility/selection and reason;
- measured power/current and energy need with correct units;
- editable property metadata and readback;
- commands/actions with visibility, applicability and invoke;
- measurement state, trust and period values;
- relationship identity and measured relation power.

## Command action contract

UX-safe action shape:

```text
command_id / command_key
command_owner
action_kind
command_resolved
currently_applicable
visible
enabled
label
reason
invoke.service
invoke.target
invoke.data
readback
```

Rules:

- unresolved external actions are hidden;
- visible/inapplicable actions may be disabled with published user reason;
- backend must fail closed when invoke is incomplete;
- UX executes invoke literally and does not translate identity into a route;
- Start/Stop route through canonical Mobility resolution;
- Pause/Resume are Energy planning-participation actions;
- service success alone is insufficient; terminal readback is required.

## Editable property contract

A writable property publishes:

```text
property_id
value
unit
editor_type
min/max/step or choices
editable
write.supported
write.operation_id
write.service
write.target
write.data/value parameter
authoritative_owner
readback_property
```

UX may not invent a writer. A visible writable property with no complete route is a backend closure defect.

## Planning contract

Public owner: `sensor.energy_planning_index`.

Backend publishes D0/D1 horizons, buckets, Planning-owned totals, commitments and current operational intent. UX does not calculate totals or infer execution readiness.

## Physical Flow contract

Backend must provide one coherent measured physical truth per active relation. UX must not choose between requested/planned/need values.

## Metering contract

Backend owns lifetime-source lineage, baselines, deltas, periodization, attribution, aggregates, trust and health. UX presents exact measurement state and period values; no frontend delta calculation is permitted.

## Missing and degraded data

- zero = known zero;
- null/missing = unavailable;
- pending/incomplete/not-applicable remain separate;
- degraded truth remains visible with calm quality context;
- missing backend truth is not hidden by a frontend estimate.
