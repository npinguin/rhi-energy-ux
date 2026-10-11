// Power Flow Card Plus adapter. Only canonical Energy property entities are permitted.
// The external card reads HA entity states; this adapter does not read HA states.
function buildRhiPowerFlowCardConfig(rt) {
  const index = rt?.canonicalIndex;
  const sensor = (key, kind) => {
    const rows = (index?.rowsForProperty?.(key) || []).filter(r => r.logical_object_class === kind);
    if (rows.length !== 1) return '';
    const r = rows[0];
    const id = String(r?.entity_id || '');
    const unit = String(r?.unit || r?.unit_of_measurement || r?.native_unit_of_measurement || '').toLowerCase();
    if (r.availability !== 'AVAILABLE' || !/^sensor\.[a-z0-9_]+$/.test(id)) return '';
    // Native card accepts W or kW; never pass percent, kWh or other measures.
    if (unit && unit !== 'w' && unit !== 'kw') return '';
    return id;
  };
  const entities = {};
  const importId = sensor('grid_import.power_kw', 'grid_connection');
  const exportId = sensor('grid_export.power_kw', 'grid_connection');
  if (importId || exportId) {
    const split = {};
    if (importId) split.consumption = importId;
    if (exportId) split.production = exportId;
    entities.grid = { entity:split, display_state:'one_way' };
  }
  const solarId = sensor('solar.power_kw', 'solar_production');
  if (solarId) entities.solar = {entity:solarId};
  // battery.power_kw sign is not contractually the direction convention
  // required by Power Flow Card Plus. Do not map it without separate signed evidence.
  const homeId = sensor('site_consumption.power_kw', 'site_consumption');
  // Power Flow Card Plus otherwise computes Home by adding the input sources.
  // The RHI site balance may be incomplete; never invent household demand.
  if (!homeId) return null;
  entities.home = {entity:homeId, override_state:true, name:'Site consumption'};
  if (!entities.grid && !entities.solar) return null;
  return {
    type:'custom:power-flow-card-plus',
    entities,
    clickable_entities:true,
    title:'Live energy flow'
  };
}
