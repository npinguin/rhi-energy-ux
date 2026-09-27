# Energy logical-device visual library governance

Energy UX adopts the Mobility visual-library pattern per logical Energy device type.

## Ownership

The Energy backend owns semantic identity, `asset_type`, `profile_id`, runtime truth and property publication. Energy backend profiles remain non-visual.

Energy registers its own Energy visual identities with the Foundation visual registry at boot. Producer domains such as Mobility register their own visual identities independently.

Energy UX owns presentation of **Energy-owned** logical-device visuals, local Energy representative artwork, Energy-only picker presentation and Energy-only same-type fallbacks.

For producer-domain assets, Energy UX does **not** own a second catalog. It consumes the producer-owned `visual_ref` through the Foundation registry contract and treats that ref as opaque identity.

A visual never changes Energy semantics.

## Resolution order

1. Foundation-registered, producer-owned `visual_ref` for producer-domain assets such as Mobility consumers.
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

## Cross-domain invariant

For a flexible asset originating in another RHI domain:

```text
producer semantic asset
→ producer-owned visual_ref
→ Foundation visual registry
→ Energy preserves visual_ref losslessly
→ Energy UX resolves generically
```

Energy source must not contain another domain's product/brand/model switch statements, image-key aliases, asset-id/display-name inference, or hand-maintained `visual_ref → file` maps.

A new producer visual must require zero product-specific Energy source changes.

Invalid/unregistered/unrenderable producer refs fail to a neutral generic/unknown visual. They must never resolve to another real product and must never be silently replaced by the Energy flexible-load hero.

Shared governance: Foundation issue #49 / proposed ADR-013. Energy implementation closure: issue #102.

## Drift prevention

CI must prove:

- catalogs are type partitioned;
- a battery cannot select an inverter visual;
- profile defaults stay inside the logical type;
- unknown profiles fall back inside the logical type;
- producer-domain `visual_ref` remains authoritative and is validated through Foundation registry metadata;
- producer `visual_ref` survives flexible-asset materialization unchanged;
- Energy source contains no hardcoded producer product/image mapping;
- unknown/unregistered producer refs use only neutral fallback;
- a synthetic new registered producer ref traverses the Energy path without product-specific Energy code;
- all screens use the common registry-driven visual resolution path.
