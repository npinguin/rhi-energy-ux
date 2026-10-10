import fs from "node:fs";

const source=fs.readFileSync("src/app/energy-card.js","utf8");

const required=[
  "typeof rhiUxVisualPickerStyles === 'function' ? rhiUxVisualPickerStyles() : ''",
  "type === 'energy_system' || target === 'energy' || target === 'energy_system'",
  "profileSettingsTopic(profile = {})",
  "What do you want to adjust?",
  "What your current Energy settings mean for longer-term behavior.",
  "energyAssetConfigurationDisclosure(rt, asset = {})",
  "energyAssetDiagnosticsDisclosure(rt, asset = {})",
  "energyAssetFoldStack",
  "energyAssetChildren",
  "userRelationshipLabel(value, fallback = 'Assigned charger')",
  "fmtKw(currentPower,'—')",
  "presentation?.role",
  "behavior_topics",
  "userSafeProductText(value, fallback = '')",
  "rhiUxAssetIdentity({",
  "rhiUxAssetFactGrid(",
  "rt.value('energy_intelligence.recommendation', null)"
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
  "rt.assetName(charger) || human(charger)",
  "Charger unavailable",
  "Published properties",
  "backend ETA",
  "backend ready time",
  "public write route",
  "frontend defect guard",
  "No charging topology published",
  "Canonical Tactical plan projected without frontend recalculation",
  "Strategy configuration is the authority for longer-term intent",
  "rt.value('energy_intelligence.recommendation', 'No action needed')"
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

const presentation=fs.readFileSync("src/app/presentation.js","utf8");
const intelligence=presentation.slice(presentation.indexOf('id:"intelligence"'),presentation.indexOf('id:"insights"'));
if(!intelligence.includes('id:"plan"') || !intelligence.includes('id:"settings"')) throw new Error("Intelligence navigation must expose Plan and Settings");
for(const legacyTopLevel of ['id:"operational-planning"','id:"tactical-planning"','id:"strategic-planning"']){
  if(intelligence.includes(legacyTopLevel)) throw new Error("planning subview leaked back into top-level navigation: "+legacyTopLevel);
}

const strategicStart=source.indexOf("strategicPlanning(rt) {");
const strategicEnd=source.indexOf("navigationPlaceholder(",strategicStart);
const strategic=source.slice(strategicStart,strategicEnd);
if(strategic.includes("Goals & policy") || strategic.includes("Constraints & resilience")){
  throw new Error("Strategic Planning must not mirror raw Settings policy tables");
}


if(source.includes("(solar||0)>0.05")) throw new Error("unknown solar must not be coerced to zero");
if(source.includes(" : 'Balanced locally'")) throw new Error("unknown grid direction must not become a balanced conclusion");
for(const requiredTruthGuard of [
  "solar===null?rhiEnergyT(this._hass,'hero.solar_unavailable',{},'Solar production unavailable')",
  "flowValue === null",
  "'Grid flow unavailable'"
]) if(!source.includes(requiredTruthGuard)) throw new Error("current-truth fail-closed guard missing: "+requiredTruthGuard);

console.log("PASS literal product UX contract");
