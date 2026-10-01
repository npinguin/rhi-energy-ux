import fs from "node:fs";

const source=fs.readFileSync("src/app/energy-card.js","utf8");

const required=[
  "typeof rhiUxVisualPickerStyles === 'function' ? rhiUxVisualPickerStyles() : ''",
  "const assetScopedOnly = new Set(['flow','consumers','strategies','operational-planning','planning','strategic-planning'])",
  "profileSettingsTopic(profile = {})",
  "What do you want to adjust?",
  "What your current Energy settings mean for longer-term behavior.",
  "energyAssetConfigurationDisclosure(rt, asset = {})",
  "energyAssetDiagnosticsDisclosure(rt, asset = {})",
  "energyAssetFoldStack",
  "energyAssetChildren",
  "Charger unavailable",
  "fmtKw(currentPower,'—')",
  "presentation?.role",
  "behavior_topics",
  "Published properties"
];
for(const token of required){
  if(!source.includes(token)) throw new Error("literal UX contract missing: "+token);
}

for(const forbidden of [
  "Available Properties",
  "Available properties",
  "No explanation published.",
  "No explanation Available.",
  "fmtKw(currentPower,'0.0 kW')",
  "rt.assetName(charger) || human(charger)"
]){
  if(source.includes(forbidden)) throw new Error("forbidden UX drift returned: "+forbidden);
}

const deviceStart=source.indexOf("energyDeviceStatusCard(rt");
const deviceEnd=source.indexOf("energyAssetType(asset",deviceStart);
const device=source.slice(deviceStart,deviceEnd);
const ordered=[
  "energyAssetConfigurationDisclosure",
  "energyAssetDetailDisclosure",
  "energyAssetDiagnosticsDisclosure",
  "energyAssetChildren"
].map(token=>device.indexOf(token));
if(ordered.some(index=>index<0) || ordered.some((value,index)=>index>0 && value<=ordered[index-1])){
  throw new Error("object fold order must be Configuration -> Details -> Diagnostics -> Children");
}

const settingsStart=source.indexOf("strategies(rt) {");
const settingsEnd=source.indexOf("meteringPeriodRow(",settingsStart);
const settings=source.slice(settingsStart,settingsEnd);
if(settings.includes("Settings profile")) throw new Error("Settings must be topic-first, not profile-first");
if(!settings.includes("settingsTopicGrid")) throw new Error("Settings topic navigation missing");

const strategicStart=source.indexOf("strategicPlanning(rt) {");
const strategicEnd=source.indexOf("navigationPlaceholder(",strategicStart);
const strategic=source.slice(strategicStart,strategicEnd);
if(strategic.includes("Goals & policy") || strategic.includes("Constraints & resilience")){
  throw new Error("Strategic Planning must not mirror raw Settings policy tables");
}

console.log("PASS literal product UX contract");
