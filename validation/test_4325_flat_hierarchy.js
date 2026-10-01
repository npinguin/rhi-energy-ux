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

if(!hardware.includes('</article>${children}</div>')){
  throw new Error("Solar Production Children must render as sibling content after the aggregate article");
}
if(hardware.includes('energyAssetFoldStack">${this.energyAssetConfigurationDisclosure(rt,enriched)}${this.energyAssetDetailDisclosure(rt,enriched)}${this.energyAssetDiagnosticsDisclosure(rt,enriched)}${children}')){
  throw new Error("Solar Production Children must not be embedded in the aggregate fold stack");
}

console.log("PASS 4.3.25 flat solar hierarchy and section parity");
