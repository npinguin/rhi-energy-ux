# Energy physical visual library governance

## Principle

Energy UX provides images for physical/tangible concepts in the user's world that can
be related to the Energy domain. It does not attempt to illustrate every backend
concept.

Dashboard heroes are a separate page-level storytelling system. A hero is never an
asset default or product fallback.

## Ownership

The Energy backend owns semantic identity, canonical `asset_type`, exact
`profile_id`, runtime truth, capabilities and semantic `visual_ref`.

Energy UX owns Energy package-local artwork, the physical image picker and temporary
same-type defaults.

Foundation owns generic cross-domain visual registration/resolution.

A visual never changes Energy semantics.

## Physical catalog types

- `battery_system`
- `battery`
- `solar_zone`
- `solar_panel`
- `solar_inverter`
- `solar_optimizer`
- `backup_interface`
- `gas_meter`
- `grid_meter`

`battery_system` and `solar_zone` are physical installation compositions and may
have generic physical artwork without pretending to be manufacturer products.

## Excluded concepts

Logical, service, derived and structural concepts have no Energy asset image fallback.
Examples include `grid_connection`, `grid_phase`, `solar_production`,
`solar_optimizer_site`, `solar_inverter_phase`, `solar_source`,
`home_consumption`, `solar_forecast`, `price_source` and `flexible_load`.

Cross-domain physical loads preserve their producer-owned `visual_ref`.

## Resolution order

1. registered producer/domain `visual_ref` when present;
2. configured Energy UX visual for the same physical type;
3. exact backend product/profile visual when available;
4. dedicated generic fallback for the exact same physical `asset_type`;
5. no image / neutral icon.

Until the remaining generic binaries are published, the runtime may temporarily use the first selectable same-type product entry. That temporary behavior is not the target contract and may not be treated as completed generic coverage.

Cross-concept fallback is forbidden.

## Backend profile rule

Product profiles are created only for real physical products with verified reusable
identity and technical data. No generic product stubs are created to satisfy visual
coverage. Brand + model are required; variant, SKU, manufacturer part number and
model year are optional exact discriminators.

Runtime state, site/customer/deployment data and artwork paths are forbidden in
backend profiles.

## Visual classes

- `hero_scene`: 2400×800 — dashboards only;
- `product_wide`: 1600×950 transparent;
- `product_square`: 1400×1400 transparent;
- `product_landscape`: 1600×1200 transparent.

## Machine gates

CI proves:

- manifest and catalog expose only the physical catalog type set;
- no `heroes/` path occurs in the physical catalog;
- every supported physical type has exactly one generic fallback manifest row;
- `migration_complete` can become true only when every generic fallback is published;
- every published catalog path exists in source and dist;
- source/dist bytes match;
- logical concepts do not acquire asset fallbacks;
- producer-domain visual refs remain authoritative;
- customer/project/site context cannot leak into reusable metadata.
