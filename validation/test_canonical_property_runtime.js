import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync("src/runtime/canonical-property-index.js","utf8");
const card=fs.readFileSync("src/app/energy-card.js","utf8");
const context={Object,Array,String,Map,Set,console};
vm.createContext(context);
vm.runInContext(source+"\nglobalThis.createEnergyCanonicalPropertyIndex=createEnergyCanonicalPropertyIndex;",context);

const hass={states:{
  "sensor.battery_soc":{
    state:"57",
    attributes:{
      canonical_contract:"RHI_ENERGY_CANONICAL_PROPERTY_V2",
      asset_id:"battery_home",
      logical_object_class:"battery",
      property_key:"battery.soc_pct",
      availability:"AVAILABLE",
      unit:"%",
      presentation_family:"storage",
      presentation_role:"key",
      presentation_surface:"key_properties",
      presentation_primary:true,
      presentation_technical:false
    }
  },
  "sensor.battery_version":{
    state:"1.2.3",
    attributes:{
      canonical_contract:"RHI_ENERGY_CANONICAL_PROPERTY_V2",
      asset_id:"battery_home",
      logical_object_class:"battery",
      property_key:"battery.version",
      availability:"AVAILABLE",
      presentation_family:"engineering",
      presentation_role:"diagnostics",
      presentation_surface:"diagnostics",
      presentation_primary:false,
      presentation_technical:true
    }
  },
  "sensor.unrelated":{state:"1",attributes:{friendly_name:"Unrelated"}}
}};
const index=vm.runInContext("createEnergyCanonicalPropertyIndex",context)(hass);
if(index.size!==2) throw new Error("canonical property discovery must index only canonical Energy properties");
const soc=index.row("battery_home","battery.soc_pct");
if(!soc || soc.value!=="57" || soc.presentation_surface!=="key_properties") throw new Error("canonical key property mapping failed");
if(index.productRows().some(row=>row.property_key==="battery.version")) throw new Error("technical property leaked into product rows");
if(index.technicalRows().length!==1) throw new Error("diagnostics classification must use backend metadata");
if(index.entityIdsForSurfaces(["key_properties"]).join("|")!=="sensor.battery_soc") throw new Error("surface subscription must be metadata-driven");
if(!index.hasProductTruthForSurfaces(["key_properties"])) throw new Error("key surface authority must be explicit");
if(index.hasProductTruthForSurfaces(["configuration"])) throw new Error("missing configuration surface must not become canonical authority");
if(index.uniqueProductRows().length!==1 || index.uniqueProductRows()[0].property_key!=="battery.soc_pct") throw new Error("unique canonical property projection drifted");

// Same semantic property on two different physical assets must remain visible.
const secondBattery={states:{...hass.states,
  "sensor.second_battery_soc":{
    state:"42",attributes:{...hass.states["sensor.battery_soc"].attributes,asset_id:"battery_guest"}
  }
}};
const multiAsset=vm.runInContext("createEnergyCanonicalPropertyIndex",context)(secondBattery);
if(multiAsset.uniqueProductRows().length!==2 || multiAsset.contractGaps().length!==0)
  throw new Error("distinct batteries with the same property key must both be visible");
const duplicateAsset={states:{...secondBattery.states,
  "sensor.duplicate_battery_soc":{
    state:"99",attributes:{...hass.states["sensor.battery_soc"].attributes}
  }
}};
const ambiguous=vm.runInContext("createEnergyCanonicalPropertyIndex",context)(duplicateAsset);
if(ambiguous.uniqueProductRows().some(row=>row.asset_id==="battery_home" && row.property_key==="battery.soc_pct") ||
   !ambiguous.contractGaps().some(row=>row.reason==="duplicate_canonical_property"))
  throw new Error("duplicate canonical property on the same asset must fail closed");

const next={states:{...hass.states,"sensor.battery_soc":{...hass.states["sensor.battery_soc"],state:"58"}}};
const changed=index.refresh(next);
if(!changed.has("sensor.battery_soc") || index.row("battery_home","battery.soc_pct").value!=="58") throw new Error("incremental canonical property refresh failed");
const affected=index.affectedComponents(changed);
if(affected.length!==1 || affected[0].component_key!=="battery_home::battery.soc_pct" || affected[0].surface!=="key_properties") throw new Error("asset/property dirty component index failed");


const swapped={states:{
  "sensor.new_soc":{...next.states["sensor.battery_soc"],state:"61"},
  "sensor.battery_version":next.states["sensor.battery_version"],
  "sensor.unrelated":next.states["sensor.unrelated"]
}};
const membershipChanged=index.refresh(swapped);
if(!membershipChanged.has("sensor.new_soc") || !membershipChanged.has("sensor.battery_soc")) throw new Error("same-count HA entity replacement must invalidate canonical index");
if(index.byEntity.has("sensor.battery_soc") || index.row("battery_home","battery.soc_pct")?.entity_id!=="sensor.new_soc") throw new Error("stale canonical state retained after HA entity replacement");
const presentationChanged={states:{...swapped.states,
  "sensor.new_soc":{...swapped.states["sensor.new_soc"],attributes:{
    ...swapped.states["sensor.new_soc"].attributes,
    presentation_role:"secondary",
    presentation_primary:false,
    presentation_technical:true
  }}
}};
const presentationDirty=index.refresh(presentationChanged);
if(!presentationDirty.has("sensor.new_soc") || index.row("battery_home","battery.soc_pct")?.presentation_technical!==true) throw new Error("backend-owned presentation change not reflected");
if(index.productRows().some(row=>row.entity_id==="sensor.new_soc")) throw new Error("technical reclassification leaked into product surface");

for(const forbidden of ["includes(\"soc\")","includes('soc')","guessSection","familyFromPropertyName","fallbackUxFamily"]){
  if(source.includes(forbidden)) throw new Error("property-name placement heuristic present: "+forbidden);
}

for(const forbidden of [
  "compatibility fallback",
  "Transitional aggregate fallback",
  "canonicalIds.length ? canonicalIds : [UX_INTERFACES.publicV2]",
  "return this.publicV2().field(",
  "const fallback = (this.publicV2().allPropertyRows"
]){
  if(card.includes(forbidden)) throw new Error("Energy semantic compatibility fallback remains: "+forbidden);
}
const assetFieldStart=card.indexOf("    assetField(assetId, propertyKey) {");
const assetFieldEnd=card.indexOf("    assetValue(assetId, propertyKey",assetFieldStart);
if(assetFieldStart<0 || assetFieldEnd<0) throw new Error("Energy assetField contract missing");
const assetFieldBody=card.slice(assetFieldStart,assetFieldEnd);
if(assetFieldBody.includes("publicV2")) throw new Error("Energy assetField still falls back to aggregate Public V2");
if(!assetFieldBody.includes("canonical_property_not_published")) throw new Error("missing Energy canonical property must fail closed");


vm.runInContext("globalThis.readNativeEnergyMetric=readNativeEnergyMetric;",context);
const readMetric=context.readNativeEnergyMetric;
const metric=(value,availability="AVAILABLE")=>({state:value,attributes:{
  canonical_source:"rhi_energy.runtime",metric_key:"planning_today_planned_kwh",
  availability,unit_of_measurement:"kWh",provenance:"planning.horizons.D0"
}});
const metricStates={states:{"sensor.planning_today_planned":metric("0")}};
const zeroMetric=readMetric(metricStates,"planning_today_planned_kwh");
if(zeroMetric.value!=="0" || !zeroMetric.available) throw new Error("zero native metric must remain available and must not become null");
if(readMetric(metricStates,"planning_tomorrow_planned_kwh").available) throw new Error("missing native metric must fail closed");
if(readMetric({states:{"sensor.planning_today_planned":metric("unknown")}},"planning_today_planned_kwh").available) throw new Error("unknown native metric must fail closed");
if(readMetric({states:{"sensor.planning_today_planned":metric("4","UNAVAILABLE")}},"planning_today_planned_kwh").available) throw new Error("backend unavailable must override numeric state");
if(readMetric({states:{"sensor.a":metric("4"),"sensor.b":metric("5")}},"planning_today_planned_kwh").reason!=="duplicate_native_energy_metric") throw new Error("duplicate native metric must fail closed");
if(readMetric({states:{"sensor.rogue":{state:"7",attributes:{metric_key:"planning_today_planned_kwh"}}}},"planning_today_planned_kwh").available) throw new Error("unowned metric must not be accepted");

vm.runInContext("globalThis.readNativeEnergyPlanningTotals=readNativeEnergyPlanningTotals;",context);
const nativeTotals=context.readNativeEnergyPlanningTotals;
const planningKeys=["required_kwh","planned_kwh","still_to_plan_kwh","flexible_required_kwh","flexible_planned_kwh","flexible_still_to_plan_kwh"];
const planningStates={states:Object.fromEntries(planningKeys.map((field,i)=>[
  "sensor.planning_"+field,{state:i===0?"0":String(i),attributes:{
    canonical_source:"rhi_energy.runtime",metric_key:"planning_today_"+field,
    availability:"AVAILABLE",unit_of_measurement:"kWh"
  }}
]))};
const complete=nativeTotals(planningStates,"D0");
if(!complete.available || complete.missing.length || complete.values.required_kwh.value!=="0") throw new Error("native D0 totals must preserve explicit zero and complete evidence");
const partial=nativeTotals({states:{"sensor.planning_required_kwh":planningStates.states["sensor.planning_required_kwh"]}},"D0");
if(partial.available || partial.missing.length!==5 || partial.values.planned_kwh.value!==null) throw new Error("partial native planning totals must fail closed without frontend reconstruction");
if(nativeTotals(planningStates,"D2").available) throw new Error("unsupported horizon must fail closed");

const subscriptionsStart=card.indexOf("    subscriptionEntityIds(surfaces = []) {");
const subscriptionsEnd=card.indexOf("    entitySignature(entityIds = [])",subscriptionsStart);
if(subscriptionsStart<0 || subscriptionsEnd<0) throw new Error("Energy runtime subscription boundary not found");
const subscriptions=card.slice(subscriptionsStart,subscriptionsEnd);
if(!subscriptions.includes("canonical_source") || !subscriptions.includes("metric_key") ||
   !subscriptions.includes("nativeMetrics") || !subscriptions.includes("...nativeMetrics"))
  throw new Error("native Energy Planning metrics are not included in HA state subscriptions");

const runtimeNativeStart=card.indexOf("    nativePlanningTotals(horizonId = 'D0') {");
const runtimeNativeEnd=card.indexOf("    rawState(entityId)",runtimeNativeStart);
if(runtimeNativeStart<0 || runtimeNativeEnd<0) throw new Error("native Energy Planning totals are not exposed through the runtime");
const runtimeNative=card.slice(runtimeNativeStart,runtimeNativeEnd);
if(!runtimeNative.includes("readNativeEnergyPlanningTotals(this.hass, horizonId)") ||
   !runtimeNative.includes("readNativeEnergyMetric(this.hass, metricKey)") ||
   runtimeNative.includes("publicV2")) throw new Error("native Energy runtime must consume canonical HA evidence only");

console.log("PASS canonical Energy property metadata, fail-closed lookup and incremental indexing");
