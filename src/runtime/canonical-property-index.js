// Canonical Energy property index.
//
// RHI_ENERGY_CANONICAL_PROPERTY_V1 property entities are the preferred product
// truth. Aggregate Public V2 remains a bounded compatibility fallback only.
//
// This index deliberately uses backend-published presentation metadata literally.
// It never derives family/role/surface from property_key or object_class.
const RHI_ENERGY_CANONICAL_PROPERTY_V1 = 'RHI_ENERGY_CANONICAL_PROPERTY_V1';

function normalizeCanonicalEnergyAvailability(state = null, attributes = {}) {
  const explicit = String(attributes.availability ?? attributes.status ?? attributes.quality ?? '').trim().toUpperCase();
  if (explicit) return explicit;
  const raw = String(state?.state ?? '').trim().toLowerCase();
  return ['unknown','unavailable','none','null',''].includes(raw) ? 'UNAVAILABLE' : 'AVAILABLE';
}

function canonicalEnergyPropertyRow(entityId, state) {
  const attributes = state?.attributes || {};
  if (String(attributes.canonical_contract || '') !== RHI_ENERGY_CANONICAL_PROPERTY_V1) return null;

  const assetId = String(attributes.asset_id || '').trim();
  const objectClass = String(attributes.logical_object_class || attributes.object_class || '').trim();
  const propertyKey = String(attributes.property_key || '').trim();
  if (!assetId || !objectClass || !propertyKey) return null;

  const family = String(attributes.presentation_family || '').trim();
  const role = String(attributes.presentation_role || '').trim();
  const surface = String(attributes.presentation_surface || '').trim();
  const primary = attributes.presentation_primary === true;
  const technical = attributes.presentation_technical === true;
  const presentationComplete = !!family && !!role && !!surface;

  const availability = normalizeCanonicalEnergyAvailability(state, attributes);
  const rawState = state?.state;
  const unavailable = availability === 'UNAVAILABLE' || ['unknown','unavailable'].includes(String(rawState ?? '').toLowerCase());
  const value = unavailable
    ? null
    : (Object.prototype.hasOwnProperty.call(attributes,'value') ? attributes.value : rawState);

  return Object.freeze({
    entity_id:String(entityId || ''),
    canonical_contract:RHI_ENERGY_CANONICAL_PROPERTY_V1,
    asset_id:assetId,
    logical_object_class:objectClass,
    object_class:objectClass,
    property_key:propertyKey,
    property_id:propertyKey,
    key:propertyKey,
    value,
    unit:String(attributes.unit ?? attributes.unit_of_measurement ?? ''),
    availability,
    status:String(attributes.status ?? availability),
    quality:String(attributes.quality ?? ''),
    reason:String(attributes.reason ?? attributes.reason_code ?? ''),
    editable:attributes.editable === true,
    write_supported:attributes.write_supported === true,
    write:attributes.write || null,
    source:attributes.source || attributes.provenance || null,
    presentation_family:family,
    presentation_role:role,
    presentation_surface:surface,
    presentation_primary:primary,
    presentation_technical:technical,
    presentation_complete:presentationComplete,
    display_name:String(attributes.friendly_name || attributes.display_name || state?.attributes?.friendly_name || propertyKey)
  });
}

class EnergyCanonicalPropertyIndex {
  constructor(hass = {}) {
    this.byEntity = new Map();
    this.byAssetAndKey = new Map();
    this.byPropertyKey = new Map();
    this.bySurface = new Map();
    this.byFamily = new Map();
    this.stateRefs = new Map();
    this._stateCount = 0;
    this.discover(hass);
  }

  _index(row, stateRef) {
    if (!row) return;
    this.byEntity.set(row.entity_id,row);
    this.byAssetAndKey.set(`${row.asset_id}::${row.property_key}`,row);
    if (!this.byPropertyKey.has(row.property_key)) this.byPropertyKey.set(row.property_key,[]);
    this.byPropertyKey.get(row.property_key).push(row);
    if (!this.bySurface.has(row.presentation_surface)) this.bySurface.set(row.presentation_surface,[]);
    this.bySurface.get(row.presentation_surface).push(row);
    if (!this.byFamily.has(row.presentation_family)) this.byFamily.set(row.presentation_family,[]);
    this.byFamily.get(row.presentation_family).push(row);
    this.stateRefs.set(row.entity_id,stateRef);
  }

  discover(hass = {}) {
    this.byEntity.clear();
    this.byAssetAndKey.clear();
    this.byPropertyKey.clear();
    this.bySurface.clear();
    this.byFamily.clear();
    this.stateRefs.clear();
    const states = hass?.states || {};
    this._stateCount = Object.keys(states).length;
    for (const [entityId,state] of Object.entries(states)) this._index(canonicalEnergyPropertyRow(entityId,state),state);
    return this;
  }

  refresh(hass = {}) {
    const states = hass?.states || {};
    if (Object.keys(states).length !== this._stateCount) {
      const before = new Map(this.stateRefs);
      this.discover(hass);
      const changed = new Set();
      for (const [id,ref] of this.stateRefs.entries()) if (before.get(id) !== ref) changed.add(id);
      for (const id of before.keys()) if (!this.stateRefs.has(id)) changed.add(id);
      return changed;
    }
    const changed = new Set();
    for (const [entityId,previous] of this.stateRefs.entries()) {
      const current = states[entityId];
      if (current === previous) continue;
      changed.add(entityId);
      const row = canonicalEnergyPropertyRow(entityId,current);
      // Metadata changes are rare and semantically significant; rebuild indexes
      // rather than trying to mutate secondary indexes in place.
      if (!row || row.asset_id !== this.byEntity.get(entityId)?.asset_id ||
          row.property_key !== this.byEntity.get(entityId)?.property_key ||
          row.presentation_surface !== this.byEntity.get(entityId)?.presentation_surface ||
          row.presentation_family !== this.byEntity.get(entityId)?.presentation_family) {
        this.discover(hass);
        return changed;
      }
      this.byEntity.set(entityId,row);
      this.byAssetAndKey.set(`${row.asset_id}::${row.property_key}`,row);
      this.byPropertyKey.set(row.property_key,(this.byPropertyKey.get(row.property_key)||[]).map(candidate=>candidate.entity_id===entityId?row:candidate));
      this.bySurface.set(row.presentation_surface,(this.bySurface.get(row.presentation_surface)||[]).map(candidate=>candidate.entity_id===entityId?row:candidate));
      this.byFamily.set(row.presentation_family,(this.byFamily.get(row.presentation_family)||[]).map(candidate=>candidate.entity_id===entityId?row:candidate));
      this.stateRefs.set(entityId,current);
    }
    return changed;
  }

  get size() { return this.byEntity.size; }
  hasCanonicalTruth() { return this.size > 0; }
  entityIds() { return [...this.byEntity.keys()]; }
  row(assetId, propertyKey) { return this.byAssetAndKey.get(`${String(assetId||'')}::${String(propertyKey||'')}`) || null; }
  rowsForProperty(propertyKey) { return [...(this.byPropertyKey.get(String(propertyKey||'')) || [])]; }
  rowsForSurface(surface) { return [...(this.bySurface.get(String(surface||'')) || [])]; }
  rowsForFamily(family) { return [...(this.byFamily.get(String(family||'')) || [])]; }
  productRows() { return [...this.byEntity.values()].filter(row=>row.presentation_complete && row.presentation_technical !== true); }
  technicalRows() { return [...this.byEntity.values()].filter(row=>row.presentation_technical === true || row.presentation_surface === 'diagnostics'); }
  contractGaps() { return [...this.byEntity.values()].filter(row=>!row.presentation_complete && row.presentation_technical !== true); }

  entityIdsForSurfaces(surfaces = []) {
    const ids = new Set();
    for (const surface of surfaces) for (const row of this.rowsForSurface(surface)) ids.add(row.entity_id);
    return [...ids];
  }
}

function createEnergyCanonicalPropertyIndex(hass = {}) {
  return new EnergyCanonicalPropertyIndex(hass);
}
