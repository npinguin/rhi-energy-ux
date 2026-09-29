# Energy physical visual binary publication

Status: **14 published assets + solar-zone delta pending**

The first physical publication batch is committed in exact `src/dist` pairs:

- `battery_system_4_towers.webp`
- `flonidan_uniflo_g4srtv.webp`
- `homewizard_p1.webp` (binary retained; no longer mapped to logical grid_connection)
- `huawei_luna2000_15_s0.webp`
- `huawei_sun2000_4_6ktl_l1.webp`
- `sagemcom_t211_d3.webp`
- `sma_sunny_boy_5_0_sb5_0_1av_41.webp`
- `sma_sunny_tripower_7000tl_20.webp`
- `solaredge_backup_interface_3phase.webp`
- `solaredge_rwb_10k.webp`
- `solaredge_rws_8k.webp`
- `solaredge_se7k_rw0tebnn4.webp`
- `sonnen_batterie_10_10kwh.webp`
- `sonnen_batterie_10_20kwh.webp`

The final delta adds:

- `solar_zone_generic.webp` — 1600×1200, transparent, generic physical PV-zone artwork.

Publication invariants:

1. canonical source and dist copy both exist;
2. bytes are identical;
3. catalog paths point only to packaged files;
4. no dashboard hero path occurs in the physical catalog;
5. no deployment/customer/site metadata is embedded in reusable metadata;
6. CI validates the complete package.
