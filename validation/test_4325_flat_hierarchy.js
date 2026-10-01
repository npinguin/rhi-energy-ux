import fs from "node:fs";

const source=fs.readFileSync("src/app/energy-card.js","utf8");

for(const token of [
  "solarProductionNode",
  "solarProductionChildrenDisclosure",
  "energyAssetChildrenSibling",
  "energyAssetChildrenStack",
  "Generation system with its physical inverter → string → optimizer/panel hierarchy."
]){
  if(!source.includes(token)) throw new Error("4.3.25 flat hierarchy contract missing: "+token);
}

const hardwareStart=source.indexOf("solarHardwareExperience(rt)");
const hardwareEnd=source.indexOf("solarEnergyStory(rt)",hardwareStart);
const hardware=source.slice(hardwareStart,hardwareEnd);

if(!hardware.includes("this.solarHardwareSection(\n            'Solar Production'")){
  throw new Error("Solar Production must use the same top-level section shell as Home Battery");
}
if(hardware.includes('<section class="solarRootObject"')){
  throw new Error("Solar Production must not use a special root-level wrapper");
}

const cssStart=source.indexOf("/* 4.3.25: semantic hierarchy is vertical");
const cssEnd=source.indexOf("</style>",cssStart);
const css=source.slice(cssStart,cssEnd);

for(const forbidden of [
  "margin-left:",
  "padding-left:16px",
  "padding-left:24px",
  "transform:translateX",
  "border:1px solid #e3eaf2;border-radius:11px;background:#fbfdff"
]){
  if(css.includes(forbidden)) throw new Error("Recursive/nested visual hierarchy returned: "+forbidden);
}

for(const required of [
  ".energyAssetChildrenSibling{margin:0;width:100%",
  ".energyAssetChildrenStack{display:grid;gap:7px;padding:7px 0 0;width:100%",
  ".solarInverterGrid{display:grid;grid-template-columns:1fr",
  ".solarHardwareSection#solar-production-detail{margin:12px 0}"
]){
  if(!css.includes(required)) throw new Error("Flat full-width hierarchy CSS missing: "+required);
}

const aggregateChildren = hardware.indexOf('class="energyAssetChildrenSibling solarProductionChildrenDisclosure"');
const aggregateFold = hardware.indexOf('class="energyAssetFoldStack"');
if(aggregateChildren < 0 || aggregateFold < 0 || aggregateChildren < aggregateFold){
  throw new Error("Solar Production Children must render after the aggregate object's own fold stack");
}

console.log("PASS 4.3.25 flat solar hierarchy and section parity");
