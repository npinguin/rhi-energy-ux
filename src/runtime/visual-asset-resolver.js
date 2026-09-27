// Generic visual_ref resolver.
// Cross-domain product identity is registered by producer domains in Foundation.
// Energy UX must never contain producer-specific brand/model/image mappings.
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
    filter: "none",
    owner_domain: "rhi_energy",
    registry: false
  });
}

function resolveRegisteredVisualRef(hass = {}, visualRef = "", variant = "card") {
  const presentation = typeof rhiRegisteredVisualUrl === "function"
    ? rhiRegisteredVisualUrl(hass, visualRef, variant)
    : null;
  if (!presentation) return null;
  return Object.freeze({
    visual_ref:presentation.visual_ref,
    kind:presentation.asset_type,
    asset_type:presentation.asset_type,
    owner_domain:presentation.owner_domain,
    url:presentation.url,
    filter:"none",
    fallback:false,
    registry:true,
    revision:presentation.revision
  });
}

function resolveEnergyAssetVisual(asset = {}, hass = {}, variant = "card") {
  const sourceRef = String(asset.visual_ref || asset.visualRef || asset.raw?.visual_ref || "").trim();
  const registered = sourceRef ? resolveRegisteredVisualRef(hass, sourceRef, variant) : null;
  if (registered) return registered;

  // A producer-owned ref that is not currently registered fails closed. Do not
  // replace another domain's product identity with an Energy semantic fallback.
  const sourceDomain = String(asset.source_domain || asset.raw?.source_domain || "").trim();
  const localUxRef = sourceRef.startsWith("energy.logical.");
  if (sourceRef && !localUxRef) return null;
  if (sourceDomain && sourceDomain !== "rhi_energy" && sourceDomain !== "energy") return null;

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

function resolveEnergyVisualRef(visualRef = "", hass = {}, variant = "card") {
  const ref = String(visualRef || "").trim();
  if (!ref) return null;
  const registered = resolveRegisteredVisualRef(hass, ref, variant);
  if (registered) return registered;
  if (ref.startsWith("energy.logical.")) return resolveEnergyOwnedVisualRef(ref);
  return null;
}
