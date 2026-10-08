import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync("src/runtime/canonical-property-index.js","utf8");
const context={Object,Array,String,Map,Set,console};
vm.createContext(context);
vm.runInContext(source+"\nglobalThis.createEnergyCanonicalPropertyIndex=createEnergyCanonicalPropertyIndex;",context);

const hass={states:{
  "sensor.battery_soc":{
    state:"57",
    attributes:{
      canonical_contract:"RHI_ENERGY_CANONICAL_PROPERTY_V1",
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
      canonical_contract:"RHI_ENERGY_CANONICAL_PROPERTY_V1",
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

const next={states:{...hass.states,"sensor.battery_soc":{...hass.states["sensor.battery_soc"],state:"58"}}};
const changed=index.refresh(next);
if(!changed.has("sensor.battery_soc") || index.row("battery_home","battery.soc_pct").value!=="58") throw new Error("incremental canonical property refresh failed");
const affected=index.affectedComponents(changed);
if(affected.length!==1 || affected[0].component_key!=="battery_home::battery.soc_pct" || affected[0].surface!=="key_properties") throw new Error("asset/property dirty component index failed");

for(const forbidden of ["includes(\"soc\")","includes('soc')","guessSection","familyFromPropertyName","fallbackUxFamily"]){
  if(source.includes(forbidden)) throw new Error("property-name placement heuristic present: "+forbidden);
}
console.log("PASS canonical Energy property metadata and incremental indexing");
