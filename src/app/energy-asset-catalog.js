// Energy logical-device visual catalog.
// Backend profiles remain semantic and non-visual. This UX module owns representative
// artwork, same-type defaults, picker options and local presentation preference.
const RHI_ENERGY_VISUAL_PREFERENCE_KEY = "homebrain.energy.visual_preferences.v1";

const RHI_ENERGY_LOGICAL_VISUALS = Object.freeze([
  { id:"battery_system.home", asset_type:"battery_system", label:"Home battery system", brand:"Generic", model:"Home battery system", variant:"System", profile_patterns:["energy.battery_system."], package_path:"heroes/battery-hero.webp", quality:"representative", selectable:true },
  { id:"battery.byd_lvs_20", asset_type:"battery", label:"BYD Battery-Box Premium LVS 20.0", brand:"BYD", model:"Battery-Box Premium LVS 20.0", variant:"20.0 kWh · 5 × LVS 4.0", profile_patterns:[], package_path:"energy/byd_lvs_20.webp", quality:"verified_model_choice", selectable:true },
  { id:"battery.solaredge_home_48v_9_6", asset_type:"battery", label:"SolarEdge Home Battery 48V 9.6 kWh", brand:"SolarEdge", model:"Home Battery 48V", variant:"9.6 kWh", profile_patterns:[], package_path:"energy/solaredge_home_battery_48v_9_6.webp", quality:"verified_model_choice", selectable:true },
  { id:"battery.home", asset_type:"battery", label:"Home battery", brand:"Generic", model:"Home battery", variant:"Battery module", profile_patterns:["energy.battery."], package_path:"heroes/battery-hero.webp", quality:"representative", selectable:true },

  { id:"grid_connection.homewizard_p1", asset_type:"grid_connection", label:"HomeWizard P1 Meter", brand:"HomeWizard", model:"P1 Meter", variant:"HWE-P1 / HWE-P1-AU", profile_patterns:[], package_path:"energy/homewizard_p1.webp", quality:"verified_model_choice", selectable:true },
  { id:"grid_connection.smart_meter", asset_type:"grid_connection", label:"Smart meter / grid connection", brand:"Generic", model:"Smart meter", variant:"Grid connection", profile_patterns:["energy.grid_connection."], package_path:"heroes/metering-hero.webp", quality:"representative", selectable:true },
  { id:"grid_phase.generic", asset_type:"grid_phase", label:"Grid phase", brand:"Generic", model:"Grid phase", variant:"Phase", profile_patterns:["energy.grid_phase."], package_path:"heroes/flow-hero.webp", quality:"representative", selectable:true },

  { id:"solar_production.array", asset_type:"solar_production", label:"Solar production", brand:"Generic", model:"PV array", variant:"System", profile_patterns:["energy.solar_production."], package_path:"heroes/solar-hero.webp", quality:"representative", selectable:true },
  { id:"solar_production.sunpower_x21_335_blk", asset_type:"solar_production", label:"SunPower SPR-X21-335-BLK array", brand:"SunPower", model:"SPR-X21-335-BLK", variant:"X21 Black · 335 W", profile_patterns:[], package_path:"energy/sunpower_spr_x21_335_blk.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_production.jinkosolar_jkm435n_54hl4r", asset_type:"solar_production", label:"JinkoSolar JKM435N-54HL4R array", brand:"JinkoSolar", model:"JKM435N-54HL4R", variant:"Tiger Neo N-Type · 435 W", profile_patterns:[], package_path:"energy/jinkosolar_jkm435n_54hl4r.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_panel.sunpower_x21_335_blk", asset_type:"solar_panel", label:"SunPower SPR-X21-335-BLK", brand:"SunPower", model:"SPR-X21-335-BLK", variant:"X21 Black · 335 W", profile_patterns:[], package_path:"energy/sunpower_spr_x21_335_blk.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_panel.jinkosolar_jkm435n_54hl4r", asset_type:"solar_panel", label:"JinkoSolar JKM435N-54HL4R", brand:"JinkoSolar", model:"JKM435N-54HL4R", variant:"Tiger Neo N-Type · 435 W", profile_patterns:[], package_path:"energy/jinkosolar_jkm435n_54hl4r.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_inverter.solaredge_rwb_10k", asset_type:"solar_inverter", label:"SolarEdge Home Hub 10 kW", brand:"SolarEdge", model:"SE10K-RWB48BFN4", variant:"RWB 10K Home", profile_patterns:[], package_path:"energy/solaredge_rwb_10k.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_inverter.solaredge_rws_8k", asset_type:"solar_inverter", label:"SolarEdge StorEdge 8 kW", brand:"SolarEdge", model:"SE8K-RWS48BEN4", variant:"RWS 8K", profile_patterns:[], package_path:"energy/solaredge_rws_8k.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_inverter.solaredge", asset_type:"solar_inverter", label:"SolarEdge inverter", brand:"SolarEdge", model:"Solar inverter", variant:"Inverter", integration_domains:["solaredge","solaredge_modbus_multi"], package_path:"heroes/solar-hero.webp", quality:"representative_brand", selectable:true },
  { id:"solar_inverter.generic", asset_type:"solar_inverter", label:"Solar inverter", brand:"Generic", model:"Solar inverter", variant:"Inverter", profile_patterns:["energy.solar_inverter."], package_path:"heroes/solar-hero.webp", quality:"representative", selectable:true },
  { id:"solar_inverter_phase.generic", asset_type:"solar_inverter_phase", label:"Solar inverter phase", brand:"Generic", model:"Inverter phase", variant:"Phase", profile_patterns:["energy.solar_inverter_phase."], package_path:"heroes/flow-hero.webp", quality:"representative", selectable:true },
  { id:"solar_optimizer.solaredge_s500b", asset_type:"solar_optimizer", label:"SolarEdge Power Optimizer S500B", brand:"SolarEdge", model:"S500B-1GM4MRM-NA02", variant:"Power Optimizer", profile_patterns:[], package_path:"energy/solaredge_s500b_optimizer.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_optimizer.solaredge", asset_type:"solar_optimizer", label:"Solar optimizer", brand:"SolarEdge", model:"Power Optimizer", variant:"Optimizer", integration_domains:["solaredge_optimizers"], package_path:"heroes/solar-hero.webp", quality:"representative_brand", selectable:true },
  { id:"backup_interface.solaredge_3phase", asset_type:"backup_interface", label:"SolarEdge Home Backup Interface 3 Phase", brand:"SolarEdge", model:"BI-NEUNU-3P-01", variant:"BI-EU3P", profile_patterns:[], package_path:"energy/solaredge_backup_interface_3phase.webp", quality:"verified_model_choice", selectable:true },
  { id:"solar_optimizer.generic", asset_type:"solar_optimizer", label:"Solar optimizer", brand:"Generic", model:"PV optimizer", variant:"Optimizer", profile_patterns:["energy.solar_optimizer."], package_path:"heroes/solar-hero.webp", quality:"representative", selectable:true },
  { id:"solar_forecast.provider", asset_type:"solar_forecast", label:"Solar forecast", brand:"Generic", model:"Forecast provider", variant:"Forecast", profile_patterns:["energy.solar_forecast."], package_path:"heroes/outlook-hero.webp", quality:"representative", selectable:true },

  { id:"gas_meter.smart_meter", asset_type:"gas_meter", label:"Gas meter", brand:"Generic", model:"Smart gas meter", variant:"Meter", profile_patterns:["energy.gas_meter."], package_path:"heroes/metering-hero.webp", quality:"representative", selectable:true },
  { id:"price_source.market", asset_type:"price_source", label:"Energy price source", brand:"Generic", model:"Energy market", variant:"Price source", profile_patterns:["energy.price_source."], package_path:"heroes/pricing-hero.webp", quality:"representative", selectable:true },
  { id:"home_consumption.home", asset_type:"home_consumption", label:"Home consumption", brand:"Generic", model:"Home", variant:"Consumption", profile_patterns:["energy.home_consumption."], package_path:"heroes/consumers-hero.webp", quality:"representative", selectable:true },

  // Producer-domain flexible loads keep producer visual_ref when available. This
  // same-type fallback is only used when no producer visual identity is published.
  { id:"flexible_load.generic", asset_type:"flexible_load", label:"Flexible load", brand:"Generic", model:"Controllable load", variant:"Flexible load", profile_patterns:["energy.flexible_load."], package_path:"heroes/consumers-hero.webp", quality:"generic_fallback", selectable:true }
]);

function rhiEnergyVisualCatalog() {
  return RHI_ENERGY_LOGICAL_VISUALS.map(row => ({ ...row }));
}

function rhiEnergyVisualCatalogForType(assetType = "") {
  const type = String(assetType || "").trim().toLowerCase();
  return rhiEnergyVisualCatalog().filter(row => row.asset_type === type && row.selectable !== false);
}

function rhiEnergyVisualRef(entryOrId = "") {
  const id = typeof entryOrId === "object" ? String(entryOrId?.id || "") : String(entryOrId || "");
  return id ? `energy.logical.${id}` : "";
}

function rhiEnergyVisualEntryFromRef(visualRef = "") {
  const ref = String(visualRef || "").trim();
  if (!ref.startsWith("energy.logical.")) return null;
  const id = ref.slice("energy.logical.".length);
  return RHI_ENERGY_LOGICAL_VISUALS.find(row => row.id === id) || null;
}

function rhiEnergyVisualEntryMatchesAsset(entry = {}, asset = {}) {
  const assetType = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
  if (!assetType || entry.asset_type !== assetType) return false;
  const profileId = String(asset.profile_id || asset.raw?.profile_id || "").trim();
  const integrationDomain = String(asset.integration_domain || asset.raw?.integration_domain || "").trim();
  const profileMatch = (entry.profile_patterns || []).some(prefix => profileId.startsWith(prefix));
  const integrationMatch = (entry.integration_domains || []).includes(integrationDomain);
  return profileMatch || integrationMatch;
}

function rhiEnergyDefaultVisualEntry(asset = {}) {
  const assetType = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
  const candidates = rhiEnergyVisualCatalogForType(assetType);
  if (!candidates.length) return null;
  return candidates.find(entry => rhiEnergyVisualEntryMatchesAsset(entry, asset))
    || candidates.find(entry => /generic|home|provider|market|array|smart_meter/.test(entry.id))
    || candidates[0]
    || null;
}

function rhiEnergyReadVisualPreferences() {
  try {
    const raw = globalThis?.localStorage?.getItem?.(RHI_ENERGY_VISUAL_PREFERENCE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function rhiEnergySelectedVisualRef(assetId = "") {
  const id = String(assetId || "").trim();
  if (!id) return "";
  return String(rhiEnergyReadVisualPreferences()[id] || "").trim();
}

function rhiEnergySetVisualPreference(asset = {}, visualRef = "") {
  const assetId = String(asset.asset_id || asset.id || "").trim();
  const ref = String(visualRef || "").trim();
  if (!assetId || !ref) return false;
  const entry = rhiEnergyVisualEntryFromRef(ref);
  const assetType = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
  if (!entry || entry.asset_type !== assetType) return false;
  try {
    const preferences = rhiEnergyReadVisualPreferences();
    preferences[assetId] = ref;
    globalThis?.localStorage?.setItem?.(RHI_ENERGY_VISUAL_PREFERENCE_KEY, JSON.stringify(preferences));
    return true;
  } catch (_) {
    return false;
  }
}

function rhiEnergyClearVisualPreference(assetId = "") {
  const id = String(assetId || "").trim();
  if (!id) return false;
  try {
    const preferences = rhiEnergyReadVisualPreferences();
    delete preferences[id];
    globalThis?.localStorage?.setItem?.(RHI_ENERGY_VISUAL_PREFERENCE_KEY, JSON.stringify(preferences));
    return true;
  } catch (_) {
    return false;
  }
}
