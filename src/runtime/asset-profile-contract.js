// Canonical Energy Public Contract V2 asset/profile reader.
// The backend owns semantic asset type, profile context and publication completeness.
// UX may select and present this context but never infer it from labels or artwork.
function readEnergyAssetContext(gateway, assetId = "") {
  const v2 = readEnergyPublicV2(gateway);
  if (!v2.available) return { available:false, asset:null, profile:null, publication:null };
  const asset = v2.object(assetId);
  if (!asset) return { available:true, asset:null, profile:null, publication:null };
  const profile = v2.profile(asset.profile_id);
  const publication = asset.property_publication && typeof asset.property_publication === "object"
    ? asset.property_publication
    : null;
  return { available:true, asset, profile, publication };
}

function energyAssetPublicationGap(gateway, assetId = "") {
  const context = readEnergyAssetContext(gateway, assetId);
  const publication = context.publication;
  if (!publication) return { status:"unavailable", missing:[] };
  const missing = Array.isArray(publication.missing_required_property_keys)
    ? publication.missing_required_property_keys.map(String).filter(Boolean)
    : [];
  const unresolved = Array.isArray(publication.unresolved_required_property_keys)
    ? publication.unresolved_required_property_keys.map(String).filter(Boolean)
    : [];
  return {
    status: publication.complete === true && missing.length === 0 ? "complete" : "incomplete",
    missing,
    unresolved,
    resolution_complete: publication.resolution_complete === true,
    authority: String(publication.authority || "RHI_ENERGY_PUBLIC_CONTRACT_V2"),
    v1_fallback_allowed: publication.v1_fallback_allowed === true
  };
}
