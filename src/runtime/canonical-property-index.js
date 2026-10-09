// Canonical Energy property index.
//
// RHI_ENERGY_CANONICAL_PROPERTY_V2 property entities are the product-property
// truth. Missing canonical properties are contract gaps and fail closed.
//
// This index deliberately uses backend-published presentation metadata literally.
// It never derives family/role/surface from property_key or object_class.
const RHI_ENERGY_CANONICAL_PROPERTY_V2 = 'RHI_ENERGY_CANONICAL_PROPERTY_V2';

function normalizeCanonicalEnergyAvailability(state = null, attributes = {}) {
  const explicit = String(attributes.availability ?? attributes.status ?? attributes.quality ?? '').trim().toUpperCase();
  if (explicit) return explicit;
  const raw = String(state?.state ?? '').trim().toLowerCase();
  return ['unknown','unavailable','none','null',''].includes(raw) ? 'UNAVAILABLE' : 'AVAILABLE';
}

function canonicalEnergyPropertyRow(entityId, state) {
  const attributes = state?.attributes || {};
  if (String(attributes.canonical_contract || '') !== RHI_ENERGY_CANONICAL_PROPERTY_V2) return null;

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
    canonical_contract:RHI_ENERGY_CANONICAL_PROPERTY_V2,
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
    statistics_entity_id:String(attributes.statistics_entity_id || ''),
    history_entity_id:String(attributes.history_entity_id || ''),
    source_entity_id:String(attributes.source_entity_id || attributes.source?.entity_id || ''),
    capability_ref:String(attributes.capability_ref || ''),
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
    this._hassRef = null;
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
    this._hassRef = hass;
    this._stateCount = Object.keys(states).length;
    for (const [entityId,state] of Object.entries(states)) this._index(canonicalEnergyPropertyRow(entityId,state),state);
    return this;
  }

  refresh(hass = {}) {
    if (hass === this._hassRef) return new Set();
    const states = hass?.states || {};
    // Entity replacement can preserve the total HA state count; membership must
    // be checked explicitly or stale canonical rows remain visible.
    const membershipChanged = [...this.stateRefs.keys()].some(id => !Object.prototype.hasOwnProperty.call(states,id)) ||
      Object.entries(states).some(([id,state]) =>
        !this.stateRefs.has(id) && canonicalEnergyPropertyRow(id,state) !== null);
    if (Object.keys(states).length !== this._stateCount || membershipChanged) {
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
          row.presentation_family !== this.byEntity.get(entityId)?.presentation_family ||
          row.presentation_role !== this.byEntity.get(entityId)?.presentation_role ||
          row.presentation_primary !== this.byEntity.get(entityId)?.presentation_primary ||
          row.presentation_technical !== this.byEntity.get(entityId)?.presentation_technical) {
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
    this._hassRef = hass;
    return changed;
  }

  changedRows(entityIds = []) {
    return [...entityIds].map(id=>this.byEntity.get(id)).filter(Boolean);
  }

  uniqueProductRows() {
    return [...this.byPropertyKey.values()]
      .filter(rows=>rows.length === 1)
      .map(rows=>rows[0])
      .filter(row=>row.presentation_complete === true && row.presentation_technical !== true);
  }

  hasProductTruthForSurfaces(surfaces = []) {
    const wanted = new Set((surfaces || []).map(String));
    if (!wanted.size) return false;
    return [...this.byEntity.values()].some(row=>
      row.presentation_complete === true &&
      row.presentation_technical !== true &&
      wanted.has(row.presentation_surface)
    );
  }

  affectedComponents(entityIds = []) {
    return this.changedRows(entityIds).map(row=>Object.freeze({
      entity_id:row.entity_id,
      asset_id:row.asset_id,
      property_key:row.property_key,
      surface:row.presentation_surface,
      role:row.presentation_role,
      family:row.presentation_family,
      component_key:`${row.asset_id}::${row.property_key}`
    }));
  }

  get size() { return this.byEntity.size; }
  hasCanonicalTruth() { return this.size > 0; }
  entityIds() { return [...this.byEntity.keys()]; }
  row(assetId, propertyKey) { return this.byAssetAndKey.get(`${String(assetId||'')}::${String(propertyKey||'')}`) || null; }
  rowsForProperty(propertyKey) { return [...(this.byPropertyKey.get(String(propertyKey||'')) || [])]; }
  rowsForSurface(surface) { return [...(this.bySurface.get(String(surface||'')) || [])]; }
  rowsForFamily(family) { return [...(this.byFamily.get(String(family||'')) || [])]; }
  productRows() { return [...this.byEntity.values()].filter(row=>row.presentation_complete === true && row.presentation_technical !== true); }
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

/**
 * Native Energy metric authority (domain-owned HA contract).
 * Select by backend-published metric_key, not an assumed HA entity_id.
 * Ambiguous/missing/unavailable publication fails closed; zero is preserved.
 */
function readNativeEnergyMetric(hass = {}, metricKey = '') {
  const key = String(metricKey || '').trim();
  const matches = Object.entries(hass?.states || {}).filter(([,state]) =>
    String(state?.attributes?.metric_key || '') === key &&
    String(state?.attributes?.canonical_source || '') === 'rhi_energy.runtime'
  );
  if (!key || matches.length !== 1) return Object.freeze({
    available:false, value:null, entity_id:null,
    reason:matches.length > 1 ? 'duplicate_native_energy_metric' : 'native_energy_metric_not_published'
  });
  const [entityId,state] = matches[0];
  const attrs = state.attributes || {};
  const availability = String(attrs.availability || '').toUpperCase();
  const invalid = ['unknown','unavailable','none','null',''].includes(String(state.state ?? '').toLowerCase());
  const available = availability === 'AVAILABLE' && !invalid;
  return Object.freeze({
    available,
    entity_id:entityId,
    value:available ? state.state : null,
    unit:String(attrs.unit_of_measurement || ''),
    quality:attrs.quality ?? null,
    provenance:attrs.provenance ?? null,
    reason:available ? null : String(attrs.reason_code || (availability || 'native_energy_metric_unavailable')),
    metric_key:key
  });
}

/** Published planning totals only. No frontend total arithmetic or Public V2 fallback. */
function readNativeEnergyPlanningTotals(hass = {}, horizonId = 'D0') {
  const horizon=String(horizonId || '').toUpperCase();
  if (!['D0','D1'].includes(horizon)) return Object.freeze({
    available:false,horizon,values:Object.freeze({}),missing:Object.freeze(['unsupported_planning_horizon'])
  });
  const prefix=horizon==='D0' ? 'planning_today_' : 'planning_tomorrow_';
  const fields=['required_kwh','planned_kwh','still_to_plan_kwh',
    'flexible_required_kwh','flexible_planned_kwh','flexible_still_to_plan_kwh'];
  const values={};
  const missing=[];
  for (const field of fields) {
    const metric=readNativeEnergyMetric(hass,prefix+field);
    values[field]=metric;
    if (!metric.available) missing.push(field);
  }
  return Object.freeze({
    available:missing.length===0,
    horizon,
    values:Object.freeze(values),
    missing:Object.freeze(missing)
  });
}
