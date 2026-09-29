# Energy visual binary staging inventory

Status: **approved local masters — publication integrity record**

All files below were inspected after alpha cleanup. Every file has real alpha transparency with alpha extrema 0..255. The SHA-256 is the publication checksum that must match both `src/assets/energy/` and `dist/assets/energy/` once committed.

| File | Dimensions | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `battery_system_4_towers.webp` | 1600×950 | 77864 | `01635776387c45312d38c6d8e50797747b020fb8ea0dcfdff5072a7957922d58` |
| `flonidan_uniflo_g4srtv.webp` | 1400×1400 | 92152 | `8af77775e041f28e5f4f4db0c5e16605db42ac3a097445257092666cc27cbd1b` |
| `homewizard_p1.webp` | 1400×1400 | 38078 | `1af19ba05e919466c854e406e65df89ce0b1a5fbc88706db15d1accd8af5bf58` |
| `huawei_luna2000_15_s0.webp` | 1400×1400 | 34920 | `092f97b74bb0e14dd10c011a04425409de48b9d6c22ff31975b42f939c156b48` |
| `huawei_sun2000_4_6ktl_l1.webp` | 1400×1400 | 62366 | `abf992dc7786568ee1923150b3ade447eb280c01ab41acd440e31234c772c7c6` |
| `sagemcom_t211_d3.webp` | 1400×1400 | 83892 | `a921e8d502c83416f1654f9b6479d674ecfe40273f14412241f9bc184aeb18d3` |
| `sma_sunny_boy_5_0_sb5_0_1av_41.webp` | 1400×1400 | 59644 | `09dce7f7a577eb8667f227e990a398a694cdb9fd144054fcfdbfc52d8c9a22dc` |
| `sma_sunny_tripower_7000tl_20.webp` | 1400×1400 | 74926 | `8dd437525110935c58427dda6ca175c0f9d7b74a7fe5d2ccdff46285197c589e` |
| `solaredge_backup_interface_3phase.webp` | 1400×1400 | 51628 | `85bc4c63cb99780eaeef4d8fe98e661d9313cdc019162c5d7f7419d1e1b3f83a` |
| `solaredge_rwb_10k.webp` | 1400×1400 | 32484 | `f730b8d7713adc1df7878f9e07613492afbd47bccb8aef05fada2d1e3cbfebe1` |
| `solaredge_rws_8k.webp` | 1400×1400 | 43074 | `d5774e2e927522bee393881a5dd0ceb8f92e67d276771cc48ec72462ded5614f` |
| `solaredge_se7k_rw0tebnn4.webp` | 1400×1400 | 49416 | `2d79d9a2ff0df987786114d338d40afbfae5fcfec6e60421e1c7fd6b79238a4d` |
| `sonnen_batterie_10_10kwh.webp` | 1400×1400 | 24612 | `842993920719bb8f9bc4d142f35861ce2300309e7174a0f7aa4bc67b6bf42833` |
| `sonnen_batterie_10_20kwh.webp` | 1600×950 | 28262 | `97d25f3f2d001dc6dbe8676e6b13526c4bb1007b7937b3638d1af501e3ad9311` |

## Acceptance

- 12 product/device masters use the canonical 1400×1400 transparent product-square canvas.
- `battery_system_4_towers.webp` and `sonnen_batterie_10_20kwh.webp` use the canonical 1600×950 transparent product-wide canvas.
- isolated-alpha speckles smaller than the real product components were removed before checksum capture;
- no customer, project, site, serial-number or deployment metadata is encoded in this inventory;
- binary publication is complete only after the Git repository contains matching bytes in source and dist and CI confirms parity.
