# Energy Physical Visual Coverage

Status: **physical visual library candidate on Energy UX 4.3.18**

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

The temporary default rule is deterministic: exact configured/profile match first,
otherwise the first selectable entry of the same `asset_type`, otherwise no image.

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

## Completion criteria

1. all physical catalog paths exist in both `src/assets` and `dist/assets`;
2. source/dist bytes are identical;
3. `solar_zone_generic.webp` is present at 1600×1200 with transparency;
4. no dashboard hero is used as an asset fallback;
5. no cross-concept fallback is possible;
6. backend product profiles contain only verified reusable data;
7. full UX validation is green.
