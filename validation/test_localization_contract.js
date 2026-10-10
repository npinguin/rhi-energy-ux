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
const pilotFiles=["src/app/energy-card.js","src/ui/components/energy-visual-picker.js"];
const forbiddenPilotLiterals=[
  "<h2>Production & supply</h2>","<h2>Physical Energy Flow</h2>","<h2>Charging connections</h2>",
  "<h2>Physical consumers</h2>","<h2>Gas meter</h2>","<h2>Connect your gas meter</h2>",
  "<h2>Home Battery state</h2>","<h2>Home Battery contributors</h2>","<h2>Flexible loads</h2>",
  "<h2>Automation</h2>","<h2>What do you want to adjust?</h2>","<h2>Measurement period</h2>",
  "<h2>Financial result</h2>","<h2>Pricing settings</h2>","<h2>Managed flexible assets</h2>",
  "title:\"Choose appearance\"","description:\"Choose the representative image.",
  "<small>Recommendation</small>",
  "<span>Pause mode</span>",
  "<b>⚙ Strategy settings</b>",
  "<span>Not managed by Home Intelligence</span>",
  "<small>SOLAR PANEL</small>",
  "<small>OPTIMIZER / PANEL</small>",
  "<small>SOLAR PRODUCTION</small>",
  "<span>Main Switchboard</span>",
  "<small>REVIEW PREREQUISITES</small>",
  "<b>Collecting evidence</b>"
];
for(const file of pilotFiles){
  const source=fs.readFileSync(file,"utf8");
  for(const token of forbiddenPilotLiterals){
    if(source.includes(token)) throw new Error(`pilot-visible literal bypasses localization in ${file}: ${token}`);
  }
}
for(const key of [
  "section.production_supply","flow.physical","flow.charging_connections","gas.meter","battery.state",
  "section.flexible_loads","settings.automation","settings.adjust","metering.period","value.financial_result",
  "planning.tactical","planning.strategic","appearance.description"
]){
  for(const locale of ["en","nl","fr"]) if(!resources[locale][key]) throw new Error(`missing pilot localization ${locale}:${key}`);
}
console.log("PASS Energy localization: complete EN/NL/FR keys, HA locale fallback, pilot-surface enforcement and user-safe copy");
