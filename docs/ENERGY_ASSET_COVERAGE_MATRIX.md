# Energy Asset Coverage Matrix

Status: **visual inventory restored on Energy UX 4.3.18 baseline — migration still incomplete**

This matrix is the canonical human-readable coverage view for the Energy visual-library migration. It mirrors the machine-readable inventory in `governance/energy-visual-manifest.json`.

## Decision vocabulary

- **keep** — current model-specific artwork remains valid pending visual QA.
- **review** — model/SKU identity is useful but artwork quality/provenance still needs review.
- **add** — coverage is missing and must be added.
- **replace** — current artwork is structurally wrong for the target visual family.
- **producer-owned** — exact cross-domain artwork must come from the producer visual registry.

## Coverage

| asset_type | Current visual entries | Brand / model coverage | Current fallback | Decision | Target class | Search / next action |
| --- | --- | --- | --- | --- | --- | --- |
| battery_system | Home battery system | Generic only | `heroes/battery-hero.webp` | replace | product_wide | Create Energy generic battery-system family asset |
| battery | BYD LVS 20.0; SolarEdge Home Battery 48V 9.6; sonnenBatterie 10 10/20 kWh; Huawei LUNA2000-15-S0; generic battery | BYD; SolarEdge; sonnen; Huawei | `heroes/battery-hero.webp` | review/add + replace fallback | product_square | Verify existing imagery; add sonnen + Huawei battery masters; create generic battery asset |
| grid_connection | HomeWizard P1; generic smart meter | HomeWizard | `heroes/metering-hero.webp` | review + replace fallback | product_square | Search HWE-P1 / HWE-P1-AU; create generic smart meter |
| grid_phase | Generic grid phase | Generic only | `heroes/flow-hero.webp` | replace | product_square | Create generic technical phase family asset |
| solar_production | SunPower array; JinkoSolar array; generic PV production | SunPower; JinkoSolar | `heroes/solar-hero.webp` | review + replace fallback | product_landscape | Verify exact panel SKU imagery; create generic PV production |
| solar_panel | SunPower SPR-X21-335-BLK; JinkoSolar JKM435N-54HL4R | SunPower; JinkoSolar | none | add fallback | product_landscape | Add generic panel family asset |
| solar_inverter | SolarEdge RWB 10K; RWS 8K; SE7K-RW0TEBNN4; Huawei SUN2000-4.6KTL-L1; SMA Sunny Boy 5.0 SB5.0-1AV-41; SMA Sunny Tripower 7000TL STP 7000TL-20; representative/generic entries | SolarEdge; Huawei; SMA | `heroes/solar-hero.webp` | review/add + replace fallbacks | product_square | Verify exact SolarEdge SKUs; add Huawei and SMA exact product masters; create generic inverter |
| solar_inverter_phase | Generic inverter phase | Generic only | `heroes/flow-hero.webp` | replace | product_square | Create generic technical phase family asset |
| solar_optimizer | SolarEdge S500B; SolarEdge representative; generic | SolarEdge | `heroes/solar-hero.webp` | review + replace fallbacks | product_square | Search S500B exact SKU; create generic optimizer |
| backup_interface | SolarEdge 3-phase backup interface | SolarEdge | none | review + add fallback | product_square | Search BI-NEUNU-3P-01; add generic backup interface |
| solar_forecast | Forecast provider | Generic only | `heroes/outlook-hero.webp` | replace | product_square | Create forecast-provider family asset |
| gas_meter | Smart gas meter | Generic only | `heroes/gas-hero.webp` | replace | product_square | Create generic gas meter |
| price_source | Energy market/source | Generic only | `heroes/pricing-hero.webp` | replace | product_square | Create generic price-source family asset |
| home_consumption | Home consumption | Generic only | `heroes/consumers-hero.webp` | replace | product_wide | Create generic home-consumption family asset |
| flexible_load | Generic fallback; producer visual_ref when present | Producer-owned where available | `heroes/consumers-hero.webp` | producer-owned + replace local fallback | product_wide | Preserve producer visual_ref; create neutral Energy fallback |
| flexible_asset | Generic flexible asset | Generic only | `heroes/consumers-hero.webp` | replace | product_wide | Create generic controllable-asset family asset |
| consumer | Generic energy consumer | Generic only | `heroes/consumers-hero.webp` | replace | product_wide | Create generic consumer family asset |
| solar_array | Generic solar array | Generic only | `heroes/solar-hero.webp` | replace | product_landscape | Create generic solar-array family asset |
| inverter | Generic inverter | Generic only | `heroes/solar-hero.webp` | replace | product_square | Create generic inverter family asset |
| site_consumption | Site consumption | Generic only | `heroes/consumers-hero.webp` | replace | product_wide | Create generic site-consumption family asset |
| energy_system | Home energy system | Generic only | `heroes/overview-hero.webp` | replace | product_wide | Create generic energy-system family asset |

## Product-specific search targets

| Brand | Model / SKU search target | Current package asset | Current status |
| --- | --- | --- | --- |
| BYD | Battery-Box Premium LVS 20.0 | `energy/byd_lvs_20.webp` | visual QA + provenance required |
| SolarEdge | Home Battery 48V 9.6 kWh | `energy/solaredge_home_battery_48v_9_6.webp` | visual QA + provenance required |
| sonnen | sonnenBatterie 10 — 10 kWh | target `energy/sonnen_batterie_10_10kwh.webp` | add — official source identified, approved artwork staged |
| sonnen | sonnenBatterie 10 — 20 kWh | target `energy/sonnen_batterie_10_20kwh.webp` | add — official 20 kWh variant confirmed; approved artwork staged |
| HomeWizard | P1 Meter HWE-P1 / HWE-P1-AU | `energy/homewizard_p1.webp` | visual QA + provenance required |
| SunPower | SPR-X21-335-BLK | `energy/sunpower_spr_x21_335_blk.webp` | visual QA + provenance required |
| JinkoSolar | JKM435N-54HL4R | `energy/jinkosolar_jkm435n_54hl4r.webp` | visual QA + provenance required |
| SolarEdge | SE10K-RWB48BFN4 | `energy/solaredge_rwb_10k.svg` | visual QA + provenance required |
| SolarEdge | SE8K-RWS48BEN4 | `energy/solaredge_rws_8k.webp` | visual QA + provenance required |
| SolarEdge | Three Phase Inverter 7.0 kW / SE7K-RW0TEBNN4 | target `energy/solaredge_se7k_rw0tebnn4.webp` | add — exact article number verified from SolarEdge catalogue |
| SolarEdge | S500B-1GM4MRM-NA02 | `energy/solaredge_s500b_optimizer.webp` | visual QA + provenance required |
| SolarEdge | BI-NEUNU-3P-01 | `energy/solaredge_backup_interface_3phase.webp` | visual QA + provenance required |
| Huawei | SUN2000-4.6KTL-L1 | target `energy/huawei_sun2000_4_6ktl_l1.webp` | add — exact model confirmed; approved artwork staged |
| Huawei | LUNA2000 battery family | target `energy/huawei_luna2000_15_s0.webp` | add — 15 kWh S0 variant confirmed; approved artwork staged |
| SMA | Sunny Boy 5.0 / SB5.0-1AV-41 | target `energy/sma_sunny_boy_5_0_sb5_0_1av_41.webp` | add — exact model confirmed; approved artwork staged |
| SMA | Sunny Tripower 7000TL / STP 7000TL-20 | target `energy/sma_sunny_tripower_7000tl_20.webp` | add — exact model confirmed; approved artwork staged |

## Hero family inventory

Current page hero masters:

- overview
- flow
- solar
- battery
- consumers
- gas
- strategies
- intelligence
- planning
- outlook
- metering
- value
- diagnostics / retrospective

The hero family remains separate from product and fallback artwork. Current hero files may be visually reviewed or regenerated, but they must never be the final implementation of a generic asset fallback.

## Completion criteria

The migration is complete only when:

1. all 21 Energy logical asset types are represented in this matrix and manifest;
2. each type has an explicit fallback policy;
3. all local generic fallbacks use dedicated generic-family artwork, never `heroes/`;
4. all model-specific assets have verified search/provenance metadata;
5. all assets meet their declared visual-class dimensions;
6. the hero family is coherent and has focal/safe-area metadata;
7. runtime catalog, manifest, files and documentation are machine-validated as one inventory;
8. HACS package layout and package-local asset delivery remain unchanged.
