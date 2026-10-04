import fs from "node:fs";
import vm from "node:vm";

const core=fs.readFileSync("src/vendor/rhi-ux-core.js","utf8");
const i18n=fs.readFileSync("src/app/localization.js","utf8");
const context={String,Object,Array,Set,Number,Date,Intl,globalThis:{},document:{documentElement:{lang:"en"}}};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(core,context);
vm.runInContext(i18n,context);

const resources=vm.runInContext("RHI_ENERGY_TRANSLATIONS",context);
for(const locale of ["en","nl","fr"]){
  if(!resources[locale]) throw new Error("missing locale: "+locale);
}
const english=Object.keys(resources.en).sort();
for(const locale of ["nl","fr"]){
  const keys=Object.keys(resources[locale]).sort();
  const missing=english.filter(key=>!keys.includes(key));
  const extra=keys.filter(key=>!english.includes(key));
  if(missing.length||extra.length) throw new Error(`${locale} translation key drift; missing=${missing.join(",")} extra=${extra.join(",")}`);
}
const t=(locale,key)=>vm.runInContext(`rhiUxTranslate(RHI_ENERGY_TRANSLATIONS,${JSON.stringify(key)},{locale:${JSON.stringify(locale)}})`,context);
if(t("nl-BE","nav.battery")!=="Thuisbatterij") throw new Error("nl-BE fallback failed");
if(t("fr-BE","nav.value")!=="Valeur") throw new Error("fr-BE fallback failed");
if(t("en","hero.overview.title")!=="Energy Overview") throw new Error("English baseline drifted");

const machineTokens=[/sensor\./i,/RHI_[A-Z0-9_]+/i,/property_key/i,/command_key/i,/asset_id/i,/contract_id/i];
for(const locale of ["en","nl","fr"]){
  for(const [key,value] of Object.entries(resources[locale])){
    for(const rx of machineTokens) if(rx.test(String(value))) throw new Error(`${locale}:${key} leaks machine terminology: ${value}`);
  }
}
console.log("PASS Energy localization: complete EN/NL/FR keys, HA locale fallback and user-safe copy");
