// Package-local resolver for Foundation/Mobility visual_ref identities.
// The backend publishes only package-neutral keys. Energy UX owns these image files.
const RHI_ENERGY_MOBILITY_VISUALS = Object.freeze({
  "audi.q8.4m.2024-2026.tfsi-e": {
    file:"mobility/vehicle_audi_q8.png",
    appearances:{
      "daytona-grey":"none",
      "mythos-black":"brightness(.42) contrast(1.14) saturate(.7)",
      "glacier-white":"brightness(1.35) saturate(.45) contrast(.88)",
      "navarra-blue":"sepia(.32) saturate(2.4) hue-rotate(170deg) brightness(.78)",
      "tango-red":"sepia(.45) saturate(3.2) hue-rotate(305deg) brightness(.82)"
    }
  },
  "bmw.x1.u11.2025-2026.phev": {
    file:"mobility/vehicle_bmw_x1_phev.png",
    appearances:{
      "mineral-white":"none",
      "black-sapphire":"brightness(.40) contrast(1.18) saturate(.7)",
      "skyscraper-grey":"grayscale(.55) brightness(.86)",
      "phytonic-blue":"sepia(.28) saturate(2.5) hue-rotate(170deg) brightness(.82)",
      "fire-red":"sepia(.45) saturate(3.1) hue-rotate(305deg) brightness(.85)"
    }
  },
  "mercedes.gla.h247.2023-2026.phev": {
    file:"mobility/vehicle_mercedes_gla.png",
    appearances:{
      "mountain-grey":"none",
      "night-black":"brightness(.42) contrast(1.15) saturate(.7)",
      "polar-white":"brightness(1.35) saturate(.45) contrast(.88)",
      "spectral-blue":"sepia(.30) saturate(2.5) hue-rotate(170deg) brightness(.80)",
      "patagonia-red":"sepia(.45) saturate(3.1) hue-rotate(305deg) brightness(.82)"
    }
  },
  "renault.scenic.e-tech.2024-2026.techno": {
    file:"mobility/vehicle_renault_scenic_techno_ev.webp",
    appearances:{
      "pearl-white":"none",
      "starry-black":"brightness(.42) contrast(1.16) saturate(.65)",
      "schiste-grey":"grayscale(.55) brightness(.82)",
      "midnight-blue":"sepia(.28) saturate(2.2) hue-rotate(170deg) brightness(.72)",
      "flame-red":"sepia(.45) saturate(3.0) hue-rotate(305deg) brightness(.84)"
    }
  },
  "volkswagen.id4.2024-2026.ev": {
    file:"mobility/vehicle_vw_id4.webp",
    appearances:{
      "costa-azul":"none",
      "moonstone-grey":"grayscale(.65) brightness(.78)",
      "mythos-black":"brightness(.40) contrast(1.18) saturate(.65)",
      "glacier-white":"brightness(1.35) saturate(.42) contrast(.88)",
      "scale-silver":"grayscale(.85) brightness(1.05)"
    }
  },
  "generic.guest.current.phev-1phase": { file:"mobility/vehicle_fallback.png", appearances:{} },
  "generic.guest.current.ev-3phase": { file:"mobility/vehicle_fallback.png", appearances:{} }
});

const RHI_ENERGY_MOBILITY_CHARGER_VISUALS = Object.freeze({
  "wallbox.commander2.white":"mobility/charger_wallbox_white.svg",
  "wallbox.commander2.black":"mobility/charger_wallbox_black.svg",
  "peblar.business.socket.factory":"mobility/charger_peblar.svg",
  "fibaro.wall-plug-2.zwave-plus.be-fr.white":"mobility/charger_utility_plug.svg"
});

function rhiEnergyVisualAssetUrl(relativePath = "") {
  const normalized = String(relativePath || "").replace(/^\/+/, "");
  return `/hacsfiles/rhi-energy-ux/assets/${normalized}?v=${encodeURIComponent(UX_VERSION)}`;
}

function resolveEnergyOwnedVisualRef(visualRef = "") {
  const ref = String(visualRef || "").trim();
  const entry = typeof rhiEnergyVisualEntryFromRef === "function" ? rhiEnergyVisualEntryFromRef(ref) : null;
  if (!entry) return null;
  const inlineAssets = {
    byd_lvs20: typeof HERO_IMAGE_BYD_LVS20 === "string" ? HERO_IMAGE_BYD_LVS20 : "",
    solaredge_48v_9_6: typeof HERO_IMAGE_SOLAREDGE_92 === "string" ? HERO_IMAGE_SOLAREDGE_92 : ""
  };
  const url = entry.inline_asset
    ? inlineAssets[String(entry.inline_asset || "")] || ""
    : rhiEnergyVisualAssetUrl(entry.package_path || "");
  if (!url) return null;
  return Object.freeze({
    visual_ref: ref,
    kind: "energy_logical_device",
    asset_type: entry.asset_type,
    catalog_id: entry.id,
    quality: entry.quality || "representative",
    url,
    filter: "none"
  });
}

function resolveEnergyAssetVisual(asset = {}) {
  const sourceRef = String(asset.visual_ref || asset.visualRef || asset.raw?.visual_ref || "").trim();
  // Producer visual identity stays authoritative across the domain boundary.
  if (sourceRef.startsWith("mobility.")) return resolveEnergyVisualRef(sourceRef);

  const assetId = String(asset.asset_id || asset.id || "").trim();
  const assetType = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
  const selectedRef = typeof rhiEnergySelectedVisualRef === "function"
    ? rhiEnergySelectedVisualRef(assetId)
    : "";
  const selectedEntry = typeof rhiEnergyVisualEntryFromRef === "function"
    ? rhiEnergyVisualEntryFromRef(selectedRef)
    : null;
  if (selectedEntry && selectedEntry.asset_type === assetType) {
    return resolveEnergyOwnedVisualRef(selectedRef);
  }

  const sourceEntry = typeof rhiEnergyVisualEntryFromRef === "function"
    ? rhiEnergyVisualEntryFromRef(sourceRef)
    : null;
  if (sourceEntry && sourceEntry.asset_type === assetType) {
    return resolveEnergyOwnedVisualRef(sourceRef);
  }

  const fallbackEntry = typeof rhiEnergyDefaultVisualEntry === "function"
    ? rhiEnergyDefaultVisualEntry(asset)
    : null;
  return fallbackEntry ? resolveEnergyOwnedVisualRef(rhiEnergyVisualRef(fallbackEntry)) : null;
}

function resolveEnergyVisualRef(visualRef = "") {
  const ref = String(visualRef || "").trim();
  if (!ref) return null;
  if (ref.startsWith("energy.logical.")) return resolveEnergyOwnedVisualRef(ref);
  if (ref === "mobility.vehicle.generic.fallback") {
    return Object.freeze({ visual_ref:ref, kind:"vehicle", url:rhiEnergyVisualAssetUrl("mobility/vehicle_fallback.png"), filter:"none" });
  }
  if (ref === "mobility.charger.generic.fallback") {
    return Object.freeze({ visual_ref:ref, kind:"charger", url:rhiEnergyVisualAssetUrl("mobility/charger_fallback.png"), filter:"none" });
  }
  if (ref.startsWith("mobility.vehicle.")) {
    const local = ref.slice("mobility.vehicle.".length);
    for (const [family, spec] of Object.entries(RHI_ENERGY_MOBILITY_VISUALS)) {
      if (local !== family && !local.startsWith(family + ".")) continue;
      const appearance = local === family ? "" : local.slice(family.length + 1);
      return Object.freeze({
        visual_ref:ref,
        kind:"vehicle",
        url:rhiEnergyVisualAssetUrl(spec.file),
        filter:spec.appearances[appearance] || "none"
      });
    }
    return Object.freeze({ visual_ref:ref, kind:"vehicle", url:rhiEnergyVisualAssetUrl("mobility/vehicle_fallback.png"), filter:"none", fallback:true });
  }
  if (ref.startsWith("mobility.charger.")) {
    const local = ref.slice("mobility.charger.".length);
    const file = RHI_ENERGY_MOBILITY_CHARGER_VISUALS[local] || "mobility/charger_fallback.png";
    return Object.freeze({ visual_ref:ref, kind:"charger", url:rhiEnergyVisualAssetUrl(file), filter:"none", fallback:!RHI_ENERGY_MOBILITY_CHARGER_VISUALS[local] });
  }
  return null;
}
