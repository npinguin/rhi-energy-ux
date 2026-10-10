import fs from "node:fs";

const source=fs.readFileSync("src/app/energy-card.js","utf8");

for(const token of [
  "solarRootObject",
  "energyAssetChildrenSibling",
  "energyAssetChildrenStack",
  "border:1px solid #e3eaf2",
  "padding:7px;width:100%;min-width:0;box-sizing:border-box"
]){
  if(!source.includes(token)) throw new Error("4.3.24 bordered hierarchy contract missing: "+token);
}

const hardwareStart=source.indexOf("solarHardwareExperience(rt)");
const hardwareEnd=source.indexOf("solarEnergyStory(rt)",hardwareStart);
const hardware=source.slice(hardwareStart,hardwareEnd);

if(hardware.includes("this.solarHardwareSection(\n        'Solar Production'")){
  throw new Error("Solar Production must not have an extra section wrapper around its root object");
}
if(!hardware.includes('<section class="solarRootObject" id="solar-production-detail">')){
  throw new Error("Solar Production must render as one root hierarchy object");
}

const cssStart=source.indexOf("/* 4.3.24: hierarchy is expressed by compact bordered groups");
const cssEnd=source.indexOf("</style>",cssStart);
const css=source.slice(cssStart,cssEnd);

for(const forbidden of [
  "margin-left:",
  "padding-left:16px",
  "padding-left:24px",
  "transform:translateX"
]){
  if(css.includes(forbidden)) throw new Error("Hierarchy must not use recursive horizontal indentation: "+forbidden);
}

if(!css.includes(".energyAssetChildrenStack{display:grid;gap:7px;padding:7px;width:100%")){
  throw new Error("Children must remain full-width inside one compact bordered group");
}

console.log("PASS 4.3.24 bordered hierarchy groups");
