# Drift Prevention and Change Policy

## Objective

Prevent every backend or UX change from forcing scattered screen edits.

## One owner per meaning

| Meaning | UX owner |
|---|---|
| Concrete interface identity | Public Interface Registry / Energy Contract Gateway |
| Planning parsing and totals | Planning Contract Module |
| Commands and invoke validation | Command Contract Module |
| Live Home Consumption | Consumption Contract Module |
| Physical relation power | Physical Flow Relation Model |
| Metering state translation | Metering Status Model |
| Property write metadata | Property Contract Module / shared editor model |
| Presentation | Reusable component / renderer |

## Change method

1. Identify the authoritative backend owner and schema change.
2. Update ownership/model documentation first.
3. Change one contract-family module.
4. Change or extend one normalized view model.
5. Keep renderers free of backend paths and fallback logic.
6. Add complete, zero, null, degraded and recovering fixtures.
7. Run source, generated bundle and package verification.
8. Deploy and record runtime evidence.

## Release-blocking gates

Fail the release when:

- a page/component references `sensor.energy_*` directly;
- a renderer navigates raw nested contract paths;
- a command route, target or script is hardcoded;
- `command_key` is used as a service/entity identity;
- Flow reads requested/planned power or energy need;
- control mode is derived from action applicability;
- null becomes zero or Not applicable;
- Home Battery enters Flexible Load totals;
- Planning totals are summed or sourced from another owner;
- source and distribution differ;
- a product tab throws under any mandatory fixture;
- runtime proof is claimed without deployed evidence.

## Scope control

Use small domain-specific modules. Do not build an abstract universal metadata/reflection framework. Add a module only where ownership and repeated drift justify it.
