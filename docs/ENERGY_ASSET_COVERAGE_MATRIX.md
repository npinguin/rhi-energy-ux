# Energy Physical Visual Coverage

Status: **product visual library released on Energy UX 4.3.19; generic fallback completion in progress**

This matrix mirrors `governance/energy-visual-manifest.json`.

## Scope rule

A visual entry exists only for a physical/tangible user-world object or physical
installation composition. Dashboard heroes are page storytelling assets and are not
asset defaults. Logical, derived, service and structural backend concepts do not get
asset images.

## Physical coverage

| asset_type | Current default | Product choices |
| --- | --- | --- |
| `battery_system` | `energy/battery_system_4_towers.webp` | generic physical composition |
| `battery` | first battery catalog entry: BYD LVS 20.0 | BYD, SolarEdge, Huawei, sonnen |
| `solar_zone` | `energy/solar_zone_generic.webp` | generic physical PV zone |
| `solar_panel` | first panel entry: SunPower X21 | SunPower, JinkoSolar |
| `solar_inverter` | first inverter entry: SolarEdge Home Hub 10 kW | SolarEdge, Huawei, SMA |
| `solar_optimizer` | first optimizer entry: SolarEdge S500B | SolarEdge |
| `backup_interface` | SolarEdge 3-phase Backup Interface | SolarEdge |
| `gas_meter` | FLONIDAN UniFlo G4 | FLONIDAN |
| `grid_meter` | Sagemcom T211-D3 | Sagemcom |

Current runtime rule: exact configured/profile match first, otherwise the first selectable entry of the same `asset_type`, otherwise no image.

Target closure rule: exact configured/profile match first, otherwise the dedicated generic fallback of the same physical `asset_type`, otherwise no image. Product artwork must never impersonate a generic fallback.

## Explicitly outside the asset image catalog

`energy_site`, `grid_connection`, `grid_phase`, `generation_meter_phase`,
`solar_production`, `solar_optimizer_site`, `solar_inverter_phase`,
`solar_source`, `home_consumption`, `solar_forecast`, `price_source`,
`flexible_loads`, `flexible_load` and presentation aliases such as
`consumer`, `flexible_asset`, `site_consumption`, `energy_system`,
`inverter` and `solar_array`.

Producer-domain physical assets keep their producer-owned `visual_ref` and resolve
through Foundation; Energy does not copy their product imagery.

## Hero boundary

Hero assets remain valid for dashboards such as Overview, Solar, Battery, Metering,
Planning and Outlook. No `heroes/` path is allowed in the physical asset catalog or
physical backend visual registry.

## Generic fallback closure

Published generic fallbacks: `battery_system`, `solar_zone`.

Still required as dedicated generic artwork: `battery`, `solar_panel`, `solar_inverter`, `solar_optimizer`, `backup_interface`, `gas_meter`, `grid_meter`.

The manifest contains exactly one generic fallback record for every supported physical type. CI keeps `migration_complete=false` until all nine are `published_approved` and present byte-identically in `src/assets` and `dist/assets`.

## Completion criteria

1. every supported physical `asset_type` has one dedicated generic fallback;
2. all published physical catalog paths exist in both `src/assets` and `dist/assets`;
3. source/dist bytes are identical;
4. no dashboard hero is used as an asset fallback;
5. no cross-concept or product-as-generic fallback is possible;
6. backend product profiles contain only verified reusable data;
7. full UX validation is green.
