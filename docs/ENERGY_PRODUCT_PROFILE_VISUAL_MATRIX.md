# Energy Product Profile ↔ Visual Matrix

Status: **visual inventory on Energy UX 4.3.18 baseline — no release implied**

## Active concept lock

- completed inventory passes: `battery`, `solar_inverter`, `solar_optimizer`, `solar_panel`, `solar_production/solar_array`, `grid_connection`
- completed inventory pass: `gas_meter`
- `grid_phase` is presentation-only/optional generic illustration, not a standalone concept pass

The product rows below are the frozen inverter scope for the current pass. Additional inverter models may be appended, but existing identities must not be silently renamed or merged.

This matrix connects reusable product identity across two deliberately separate concerns:

- **Energy backend profile**: semantic product knowledge, technical specification and capabilities.
- **Energy UX visual entry**: product artwork and presentation metadata.

Artwork paths do not belong in backend profiles. Runtime/site/customer identity does not belong in either reusable catalog.

## Backend profile rules observed on current main

The Energy backend profile catalog currently enforces:

- identity key: manufacturer/brand + model + variant + model year;
- exact profile resolution only;
- integration domain is not product identity;
- packaged profiles are defaults;
- runtime truth, user policy and artwork paths are forbidden in profiles;
- command capability is forbidden in profiles.

The current packaged profile catalog contains 5 profiles total. For the battery/inverter product scope, only the following product profiles currently exist.

## Battery mapping

| Product | Visual target | Backend profile | Profile state | Action |
| --- | --- | --- | --- | --- |
| BYD Battery-Box Premium LVS 20.0 / 5 modules / 20 kWh | `energy/byd_lvs_20.webp` | `byd_battery_box_premium_lvs_5_module_20kwh` | exists | align identity + visual_ref, then QA artwork |
| SolarEdge Home Battery 48V / 9.6 kWh visual target | `energy/solaredge_home_battery_48v_9_6.webp` | `solaredge_48v_home_battery` | exists, backend variant is generic "Installed battery" | review whether technical capacity/variant should be made explicit |
| sonnenBatterie 10 / 10 kWh | planned | none | missing | add backend product profile once exact reusable identity/spec is confirmed |
| sonnenBatterie 10 / 20 kWh | planned | none | missing | add separate backend product profile/variant |
| Huawei LUNA2000 family | planned | none | missing | wait for exact S0/S1 + capacity; then create exact profile |

## Solar inverter mapping

| Product | Visual target | Backend profile | Profile state | Action |
| --- | --- | --- | --- | --- |
| SolarEdge StorEdge 8 kW / SE8K-RWS48BEN4 | existing RWS artwork | `solaredge_rws_8k` | exists | align full SKU identity and visual mapping |
| SolarEdge Home Hub 10 kW / SE10K-RWB48BFN4 | existing RWB artwork | none | missing | add exact backend profile |
| SolarEdge SE7K-RW0TEBNN4 | planned | none | missing | add exact backend profile |
| Huawei SUN2000-4.6KTL-L1 | planned | none | missing | add exact backend profile |
| SMA Sunny Boy 5.0 / SB5.0-1AV-41 | planned | none | missing | add exact backend profile |
| SMA Sunny Tripower 7000TL / STP 7000TL-20 | planned | none | missing | add exact backend profile |

## Other current backend profiles

The backend also currently contains:

- `solaredge_power_optimizer` — SolarEdge Power Optimizer;
- `installed_solar_panel` — generic installed solar panel.

These are outside the current battery/inverter pass but must later be included in the same product-profile/visual reconciliation.

## Required invariant

```text
runtime asset
  -> exact backend profile_id when known
  -> backend semantic visual_ref/default identity
  -> Foundation visual registry
  -> UX-owned package-local artwork
```

A missing exact profile may remain unresolved. The system must not infer a product profile from integration domain, display name, customer/site context or fuzzy matching.

## Current gaps

For the products collected in the current visual-library pass:

- existing relevant backend profiles: 3
- product profiles still missing: 7
- Huawei LUNA2000 remains intentionally unresolved at exact variant level

No missing profile should be added merely to satisfy artwork coverage. Backend profiles are created only when reusable product identity and technical semantics are sufficiently verified.


## Solar optimizer mapping

| Product | Visual target | Backend profile | Profile state | Action |
| --- | --- | --- | --- | --- |
| SolarEdge Power Optimizer P370 | `energy/solaredge_p370_optimizer.webp` | `solaredge_power_optimizer` | generic profile exists; exact model not separate | add exact visual/product identity; decide later whether exact backend profile is warranted |


## Solar panel mapping

| Product | Visual target | Backend profile | Profile state | Action |
| --- | --- | --- | --- | --- |
| LG NeON® 2 Black 340 W — exact regional SKU pending | `energy/lg_neon2_black_340w.webp` | `installed_solar_panel` | generic panel profile exists; family + power confirmed | retain exact product-family identity; regional SKU remains pending before exact backend profile |


## Solar production / array policy

`solar_production` and `solar_array` are logical aggregation/topology concepts, not reusable product identities.

Rules:

- no brand/model/SKU product entries;
- no exact backend product profiles;
- no product photography;
- use generic same-type visual family assets;
- runtime topology and aggregation remain backend-owned;
- UX resolves only semantic generic visuals.

Target visual families:

- `energy.solar_production.generic`
- `energy.solar_array.generic`

Hero artwork must not be used as the final generic fallback implementation.


## Grid connection policy

`grid_connection` is a logical energy-boundary concept representing the site's connection to the electricity grid.

Rules:

- the logical grid connection is not a brand/model/SKU product;
- use a generic same-type visual for the logical connection;
- physical meters, gateways or power sensors may have their own reusable product identity/profile where appropriate;
- source-device identity must not redefine the logical `grid_connection`;
- backend owns import/export semantics and topology;
- UX owns only the generic visual representation of the logical connection.

Target semantic visual:

- `energy.grid_connection.generic`

Hero artwork must not be used as the final fallback implementation.


## Grid phase presentation policy

`grid_phase` is a structural child/property-group under `grid_connection`, not a reusable product identity.

Rules:

- no brand/model/SKU entries;
- no backend product profile;
- no mandatory visual asset;
- an optional generic illustration may exist for presentation contexts;
- such an illustration must never imply that L1/L2/L3 are separate physical devices;
- phase metrics remain properties/details of the grid connection structure.

Optional semantic visual:

- `energy.grid_phase.generic`

This visual is illustrative-only and must not be treated as a product or device image.


## Gas meter mapping

| Product | Visual target | Backend profile | Profile state | Action |
| --- | --- | --- | --- | --- |
| FLONIDAN UniFlo G4SRTV / S4 | `energy/flonidan_uniflo_g4srtv.webp` | none | exact profile missing | artwork approved at 1400×1400 transparent; binary staged for publication |
| Generic gas meter | dedicated generic family asset | none | not a product profile | create same-type generic fallback; do not reuse gas hero artwork |


## Active continuation

- completed inventory pass: `gas_meter`
- current active concept: `battery_system`


## Solar forecast status

- `solar_forecast` — skipped for now; visual direction pending.
- no product identity/profile expected.
- revisit later for a generic semantic visual aligned with the established Hero family.


## Price source status

- `price_source` — skipped for now.
- classification: logical/external pricing service, not a physical product.
- no reusable device profile required.
- revisit later for a generic semantic visual aligned with the Hero family.


## Home consumption status

- `home_consumption` — skipped for now.
- classification: logical/derived site consumption concept, not a physical product.
- no reusable product profile required.
- revisit later for a generic semantic visual aligned with the Hero family.


## Flexible load status

- `flexible_load` — skipped for now.
- classification: logical/capability-based energy asset concept, not a product identity.
- no reusable product profile required at this level.
- concrete underlying devices may have their own domain-owned product identities.
- revisit later for a generic semantic visual aligned with the Hero family.


## Flexible asset status

- `flexible_asset` — skipped for now.
- classification: logical/capability presentation concept, not a reusable product identity.
- no standalone backend product profile required.
- concrete underlying devices keep their own domain-owned identity/profile.
- revisit later only if a generic semantic visual is useful.


## Consumer status

- `consumer` — skipped for now.
- classification: generic/logical consumption concept, not a reusable product identity.
- no backend product profile at this abstraction level.
- concrete underlying devices may have their own domain-owned product profiles.
- revisit later only for a generic semantic visual if useful.


## Energy system status

- `energy_system` — skipped for now.
- classification: logical/root energy-system aggregation, not a reusable physical product identity.
- no standalone backend product profile required.
- revisit later only for a generic semantic visual if useful.


## Battery system status

- `battery_system` — captured as system-level composition, not as a standalone product identity.
- approved artwork concept: four modular battery towers.
- target visual ref: `energy.battery_system.generic`.
- target package path: `energy/battery_system_4_towers.webp`.
- background requirement: transparent.
- approved binary is staged; publication requires source/dist byte parity.
- individual batteries continue to resolve to their exact product visuals where known.


## Grid meter status

- `grid_meter` — **current active concept**.
- physical metering/source-device concept, kept separate from logical `grid_connection`.
- exact product identity/profile is applicable when manufacturer/model are known.


## Grid meter mapping

| Product | Visual target | Backend profile | Profile state | Artwork |
| --- | --- | --- | --- | --- |
| Sagemcom T211-D3 | `energy/sagemcom_t211_d3.webp` | none | exact profile missing | approved reference; binary staged for publication |
