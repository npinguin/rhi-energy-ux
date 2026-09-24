# Energy logical-device visual library governance

Energy UX adopts the Mobility visual-library pattern per logical Energy device type.

## Ownership

The Energy backend owns semantic identity, `asset_type`, `profile_id`, runtime truth and property publication. Energy backend profiles remain non-visual.

Energy UX owns representative artwork, the image catalog, profile-to-representative-image defaults, explicit presentation preference, same-type fallbacks and picker rendering.

A visual never changes Energy semantics.

## Resolution order

1. Producer-owned `visual_ref` for producer-domain assets such as Mobility consumers.
2. User-selected Energy UX visual preference for the exact logical asset.
3. Best matching representative visual from the Energy profile/integration context.
4. Generic fallback from the same logical `asset_type`.
5. Existing icon fallback when no catalog exists for that type.

A real logical type must never silently resolve to artwork registered for another type.

## Logical device types

The catalog is partitioned for:

- battery_system
- battery
- grid_connection
- grid_phase
- solar_production
- solar_inverter
- solar_inverter_phase
- solar_optimizer
- solar_forecast
- gas_meter
- price_source
- home_consumption
- flexible_load

## Picker

The picker always starts from the current logical asset and only receives entries returned by `rhiEnergyVisualCatalogForType(asset_type)`.

Presentation choices are stored as UX-local preferences because the current Energy Public Contract intentionally keeps profiles non-visual. A future backend-owned writable presentation property may replace only the preference adapter; the catalog and resolver remain UX-owned.

## Drift prevention

CI must prove:

- catalogs are type partitioned;
- a battery cannot select an inverter visual;
- profile defaults stay inside the logical type;
- unknown profiles fall back inside the logical type;
- producer-domain `visual_ref` remains authoritative;
- all screens use the common `resolveEnergyAssetVisual` path.
