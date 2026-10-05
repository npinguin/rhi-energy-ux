// Canonical Energy asset presentation projection.
// Backend owns semantic facts and presentation depth. This model only normalizes
// the already-published V2 roles into one stable screen-facing shape.

function createEnergyAssetPresentationModel(projection = null) {
  if (!projection || typeof projection !== "object") return null;
  const identity = projection.identity && typeof projection.identity === "object" ? projection.identity : {};
  const lifecycle = projection.lifecycle && typeof projection.lifecycle === "object" ? projection.lifecycle : {};
  const rows = Array.isArray(projection.properties) ? projection.properties : [];

  const normalized = rows.map((row) => {
    const field = row?.projection && typeof row.projection === "object" ? row.projection : {};
    const presentation = row?.presentation && typeof row.presentation === "object" ? row.presentation : {};
    const role = String(presentation.role || "").trim().toLowerCase();
    const key = String(row?.property_key || row?.property_id || row?.key || "").trim();
    const label = String(row?.display_name || row?.label || "").trim();
    const unit = String(field.unit || row?.unit || "").trim();
    const rawDisplay = field.display !== undefined && field.display !== null && String(field.display) !== "—"
      ? String(field.display)
      : (field.value !== undefined && field.value !== null ? String(field.value) : "—");
    const display = rawDisplay !== "—" && unit && !rawDisplay.toLowerCase().includes(unit.toLowerCase())
      ? `${rawDisplay} ${unit}`
      : rawDisplay;
    return Object.freeze({
      key,
      role,
      family:String(presentation.family || ""),
      label,
      display,
      resolved:field.resolved === true,
      value:field.value ?? null,
      unit,
      reason:String(field.reason || row?.reason || row?.reason_code || ""),
      editable:field.editable === true || row?.editable === true || row?.write_supported === true,
      raw:row
    });
  });

  const byRole = (role, { resolvedOnly = false } = {}) => Object.freeze(
    normalized.filter((row) => row.role === role && (!resolvedOnly || row.resolved))
  );

  return Object.freeze({
    identity:Object.freeze({
      asset_id:String(identity.asset_id || ""),
      display_name:String(identity.display_name || ""),
      asset_type:String(identity.asset_type || identity.object_class || ""),
      profile_id:String(identity.profile_id || ""),
      visual_ref:String(identity.visual_ref || "")
    }),
    lifecycle:Object.freeze({
      state:String(lifecycle.state || "UNKNOWN"),
      publication:lifecycle.publication && typeof lifecycle.publication === "object" ? lifecycle.publication : {}
    }),
    keyFacts:byRole("key",{resolvedOnly:true}),
    configuration:byRole("configuration"),
    details:byRole("detail",{resolvedOnly:true}),
    diagnostics:byRole("diagnostics"),
    relationships:Object.freeze(Array.isArray(projection.relationships) ? projection.relationships : []),
    controls:Object.freeze(Array.isArray(projection.controls) ? projection.controls : []),
    profile:projection.profile || null,
    unmapped:Object.freeze(normalized.filter((row)=>!["key","configuration","detail","diagnostics"].includes(row.role))),
    source:"RHI_ENERGY_PUBLIC_CONTRACT_V2"
  });
}
