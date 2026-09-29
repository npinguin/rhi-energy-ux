# Energy logical-device visual library governance

Energy UX adopts the Mobility visual-library pattern per logical Energy device type.

## Ownership

The Energy backend owns semantic identity, `asset_type`, `profile_id`, runtime truth and property publication. Energy backend profiles remain non-visual. Energy and every producer domain register their own visual catalog with the Foundation Visual Asset Registry at boot.

Energy UX owns Energy-domain representative artwork, Energy-only presentation preferences, same-type Energy fallbacks and picker rendering. It does not own or copy another domain's product catalog or artwork.

A visual never changes Energy semantics.

## Resolution order

1. Foundation-registered producer-owned `visual_ref` for producer-domain assets such as Mobility consumers. Resolution is generic through registry presentation metadata.
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


## Cross-domain hard invariant

For producer-domain flexible assets the only supported path is:

```text
producer semantic asset
→ producer-owned visual_ref
→ producer registers presentation at boot
→ Foundation validates/publishes registry entry
→ Energy preserves visual_ref losslessly
→ Energy UX renders the registered presentation generically
```

Energy must not contain producer-specific brand/model switches, image-key aliases, copied producer artwork, asset-id/display-name inference or hand-maintained `visual_ref → file` maps.

Adding a new producer vehicle/charger visual must require zero product-specific Energy source changes. Unknown or invalid registry entries render neutrally; they never resolve to another real product or the Energy flexible-load hero.

This invariant is machine-enforced by `validation/test_visual_ref_contract.js` and `validation/validate_shared_visual_ownership.py`.


## Shared visual-library contract

Energy keeps all Energy artwork package-local. Shared Core defines visual grammar, dimensions and quality taxonomy; it does not own Energy product binaries.

Canonical visual classes:
- `hero_scene`: 2400×800, 3:1, with focal point and safe area;
- `product_wide`: 1600×950, transparent;
- `product_square`: 1400×1400, transparent;
- `product_landscape`: 1600×1200, transparent.

Hero, product and generic fallback families are separate. A hero asset must never become the final implementation of a generic same-type fallback.

Reusable product discovery follows exact identity from SKU → brand/model → brand/type → official manufacturer → authorised distributor → generated/derived appearance.

## Reusable-context boundary

The visual manifest, catalog, documentation and package assets may contain reusable brand, model, variant, SKU, provenance and quality metadata only.

They must not contain customer names, project names, site names, addresses, serial numbers, deployment counts or installation-specific ownership/context.

## Physical versus logical concepts

Physical Energy assets may have exact product artwork and, when semantically justified, exact backend profiles. Logical aggregations and structural property groups do not become product identities merely because they have a visual.

Current physical visual inventory includes batteries, inverters, optimizers, panels, backup interface, HomeWizard P1 meter, FLONIDAN gas meter and Sagemcom grid meter/source device.

Logical or structural concepts such as `grid_connection`, `grid_phase`, `solar_production`, `solar_array`, `home_consumption`, `price_source`, `solar_forecast`, `flexible_load`, `flexible_asset`, `consumer` and `energy_system` remain non-product concepts.

## Publication rule

A new or replaced visual is published only when:
1. canonical source and packaged dist copies exist;
2. source and dist bytes are identical;
3. declared dimensions/background policy are met;
4. the catalog points only to existing package assets;
5. product identity is reusable and non-deployment-specific;
6. CI validates catalog, manifest and package parity.

The visual migration stays explicitly incomplete until these conditions are closed for every required visual family.
