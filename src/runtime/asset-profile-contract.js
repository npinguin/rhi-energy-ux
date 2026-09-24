// Canonical Energy Public Contract V2 asset/profile reader.
// The backend owns semantic asset type, profile context and publication completeness.
// UX may select and present this context but never infer it from labels or artwork.
function readEnergyAssetContext(gateway, assetId = "") {
  const contract = gateway.contract("publicV2");
  const attrs = contract.attributes || {};
  if (!contract.available || String(attrs.contract_id || "") !== "RHI_ENERGY_PUBLIC_CONTRACT_V2") {
    return { available:false, asset:null, profile:null, publication:null };
  }
  const objects = Array.isArray(attrs.objects) ? attrs.objects : parseMaybeJson(attrs.objects, []);
  const profiles = Array.isArray(attrs.profiles) ? attrs.profiles : parseMaybeJson(attrs.profiles, []);
  const id = String(assetId || "");
  const asset = (Array.isArray(objects) ? objects : []).find(row => String(row?.asset_id || "") === id) || null;
  if (!asset) return { available:true, asset:null, profile:null, publication:null };
  const profileId = String(asset.profile_id || "");
  const profile = (Array.isArray(profiles) ? profiles : []).find(row => String(row?.profile_id || "") === profileId) || null;
  const publication = asset.property_publication && typeof asset.property_publication === "object"
    ? asset.property_publication
    : null;
  return { available:true, asset, profile, publication };
}

function energyAssetPublicationGap(gateway, assetId = "") {
  const context = readEnergyAssetContext(gateway, assetId);
  const publication = context.publication;
  if (!publication) return { status:"unavailable", missing:[] };
  const missing = Array.isArray(publication.unresolved_required_property_keys)
    ? publication.unresolved_required_property_keys.map(String).filter(Boolean)
    : [];
  return {
    status: publication.complete === true && missing.length === 0 ? "complete" : "incomplete",
    missing,
    authority: String(publication.authority || "RHI_ENERGY_PUBLIC_CONTRACT_V2"),
    v1_fallback_allowed: publication.v1_fallback_allowed === true
  };
}
