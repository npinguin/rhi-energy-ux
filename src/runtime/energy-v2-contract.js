// Canonical Energy V2 reader. This is the only UX adapter allowed to interpret
// sensor.rhi_energy_public_contract_v2. Screens consume projections derived here.
function readEnergyPublicV2(gateway) {
  const envelope = gateway.contract('publicV2');
  const attrs = envelope.attributes || {};
  const array = value => {
    const parsed = parseMaybeJson(value, value);
    if (Array.isArray(parsed)) return parsed.filter(row => row && typeof row === 'object');
    if (parsed && typeof parsed === 'object') return Object.values(parsed).filter(row => row && typeof row === 'object');
    return [];
  };
  const object = value => {
    const parsed = parseMaybeJson(value, value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  };
  const objects = array(attrs.objects);
  const profiles = array(attrs.profiles);
  const relationships = array(attrs.relationships).map(row => Object.freeze({
    ...row,
    from_asset_id:String(row.from_asset_id || row.source_asset_id || ''),
    to_asset_id:String(row.to_asset_id || row.target_asset_id || ''),
    source_asset_id:String(row.source_asset_id || row.from_asset_id || ''),
    target_asset_id:String(row.target_asset_id || row.to_asset_id || '')
  }));
  const commands = array(attrs.commands);
  const planning = object(attrs.planning);
  const intelligence = object(attrs.intelligence);
  const overview = object(attrs.overview);
  const summary = object(attrs.summary);
  const objectById = new Map(objects.map(row => [String(row.asset_id || ''), row]).filter(([id]) => id));
  const profileById = new Map(profiles.map(row => [String(row.profile_id || ''), row]).filter(([id]) => id));

  const propertyRows = [];
  const propertyByKey = new Map();
  const propertyByAssetAndKey = new Map();
  for (const asset of objects) {
    const assetId = String(asset.asset_id || '');
    const rows = array(asset.properties);
    for (const raw of rows) {
      const key = String(raw.property_key || raw.property_id || raw.key || '');
      if (!key) continue;
      const row = Object.freeze({ asset_id:assetId, ...raw, property_key:key, key });
      propertyRows.push(row);
      if (!propertyByKey.has(key)) propertyByKey.set(key, row);
      if (assetId) propertyByAssetAndKey.set(`${assetId}::${key}`, row);
    }
  }

  const field = row => {
    const source = row && typeof row === 'object' ? row : {};
    const resolution = source.resolution && typeof source.resolution === 'object' ? source.resolution : {};
    const status = String(resolution.status || source.availability || source.status || (source.value !== undefined && source.value !== null ? 'RESOLVED' : 'UNAVAILABLE')).toUpperCase();
    const resolved = ['RESOLVED','AVAILABLE','READY','OK'].includes(status) && source.value !== undefined && source.value !== null;
    return Object.freeze({
      resolved,
      value: source.value ?? null,
      display: String(source.display ?? source.display_value ?? (source.value ?? '—')),
      unit: String(source.unit || ''),
      state: status.toLowerCase(),
      reason: String(resolution.reason_code || source.reason_code || source.reason || source.reason_text || ''),
      source: 'RHI_ENERGY_PUBLIC_CONTRACT_V2',
      quality: String(source.quality || ''),
      editable: source.write_supported === true || source.editable === true,
      editor: source.editor || null,
      constraints: source.constraints && typeof source.constraints === 'object' ? source.constraints : {},
      write: source.write && typeof source.write === 'object' ? source.write : null,
      raw: source
    });
  };

  return Object.freeze({
    envelope,
    available: envelope.available && String(attrs.contract_id || '') === 'RHI_ENERGY_PUBLIC_CONTRACT_V2',
    contractVersion: String(attrs.contract_version || envelope.contractVersion || ''),
    release: String(attrs.release || ''),
    health: String(envelope.state || 'UNKNOWN'),
    summary,
    objects,
    profiles,
    relationships,
    planning,
    intelligence,
    overview,
    commands,
    objectById,
    profileById,
    propertyRows:Object.freeze(propertyRows),
    propertyByKey,
    propertyByAssetAndKey,
    object(assetId) { return objectById.get(String(assetId || '')) || null; },
    profile(profileId) { return profileById.get(String(profileId || '')) || null; },
    property(key, assetId = '') {
      const id = String(assetId || '');
      return id ? (propertyByAssetAndKey.get(`${id}::${String(key || '')}`) || null) : (propertyByKey.get(String(key || '')) || null);
    },
    field(key, assetId = '') { return field(this.property(key, assetId)); }
  });
}

function createEnergyAssetProjection(v2, assetId) {
  const asset = v2?.object?.(assetId) || null;
  if (!asset) return null;
  const profile = v2.profile(asset.profile_id) || null;
  const relationships = (v2.relationships || []).filter(row =>
    String(row.source_asset_id || '') === String(assetId)
    || String(row.target_asset_id || '') === String(assetId)
  );
  const properties = (asset.properties || []).map(row => ({
    ...row,
    projection:v2.field(row.property_key || row.property_id || row.key, assetId)
  }));
  const controls = Array.isArray(asset.controls) ? asset.controls : [];
  return Object.freeze({
    identity:Object.freeze({
      asset_id:String(asset.asset_id || ''),
      display_name:String(asset.display_name || asset.name || asset.asset_id || ''),
      asset_type:String(asset.asset_type || asset.object_class || ''),
      object_class:String(asset.object_class || ''),
      profile_id:String(asset.profile_id || ''),
      visual_ref:String(asset.visual_ref || ''),
      source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
    }),
    lifecycle:Object.freeze({
      state:String(asset.health || asset.status || 'UNKNOWN'),
      publication:asset.property_publication || {},
      source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
    }),
    properties:Object.freeze(properties),
    property(key) { return v2.field(key, assetId); },
    relationships:Object.freeze(relationships),
    controls:Object.freeze(controls),
    profile,
    raw:asset
  });
}
