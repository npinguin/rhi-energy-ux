# Energy Product Profile ↔ Physical Visual Matrix

Status: **implementation candidate**

Backend profiles and UX visuals are separate but aligned concerns:

- backend profile = reusable physical product identity, verified technical data and capabilities;
- backend `visual_ref` = semantic visual identity only;
- UX catalog = package-local artwork;
- Foundation = cross-domain visual registry.

Artwork paths never belong in backend product profiles.

## Implemented backend profile stream

The matching backend PR is `npinguin/rhi-energy#155`.

Profiles included there are evidence-backed and contain no customer/site/runtime data:

- BYD Battery-Box Premium LVS 20.0;
- SolarEdge Home Battery 48V / BAT-05K48;
- Huawei LUNA2000-15-S0;
- sonnenBatterie 10 — 10 kWh;
- sonnenBatterie 10 — 20 kWh;
- SolarEdge StorEdge 8 kW;
- SolarEdge Home Hub 10 kW;
- SolarEdge Three Phase 7 kW;
- Huawei SUN2000-4.6KTL-L1;
- SMA Sunny Boy 5.0 / SB5.0-1AV-41;
- SMA Sunny Tripower 7000TL / STP 7000TL-20;
- SolarEdge P370;
- FLONIDAN UniFlo G4.

## Deliberately withheld profiles

No technical stub is created when reusable product data is not sufficiently verified.
The following visuals may exist while the backend profile remains unresolved:

- Sagemcom T211-D3;
- SolarEdge Home Backup Interface 3 Phase;
- SolarEdge S500B;
- SunPower SPR-X21-335-BLK;
- JinkoSolar JKM435N-54HL4R.

## Physical compositions without product profile

`battery_system` and `solar_zone` are physical user-world installation concepts,
not manufacturer products. They may have a generic physical visual but do not receive
a fake brand/model product profile.

## Resolution invariant

```text
runtime physical asset
  -> exact profile_id when reusable product identity is proven
  -> semantic backend visual_ref when available
  -> Foundation visual registry
  -> UX package-local artwork

otherwise
  -> first selectable UX catalog entry of the exact same physical asset_type
  -> no image when that type has no catalog
```

Integration domain, display name, site/customer context and fuzzy matching never
create product identity.
