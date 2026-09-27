// Package-local resolver for Foundation/Mobility visual_ref identities.
// The backend publishes only package-neutral keys. Energy UX owns these image files.
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
  if (ref.startsWith("mobility.vehicle.") || ref.startsWith("mobility.charger.")) {
    const entry = typeof rhiEnergyMobilityVisualEntry === "function" ? rhiEnergyMobilityVisualEntry(ref) : null;
    if (entry) {
      const file = RHI_ENERGY_MOBILITY_ASSET_TRANSPORT[entry.image_key] || "";
      if (file) return Object.freeze({ visual_ref:ref, kind:entry.kind, url:rhiEnergyVisualAssetUrl(file), filter:entry.filter || "none", fallback:false });
    }
    const vehicle = ref.startsWith("mobility.vehicle.");
    return Object.freeze({
      visual_ref:ref,
      kind:vehicle ? "vehicle" : "charger",
      url:rhiEnergyVisualAssetUrl(vehicle ? "mobility/vehicle_fallback.png" : "mobility/charger_fallback.png"),
      filter:"none",
      fallback:true
    });
  }
  return null;
}
