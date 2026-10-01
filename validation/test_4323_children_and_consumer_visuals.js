import fs from "node:fs";

const source=fs.readFileSync("src/app/energy-card.js","utf8");

for(const token of [
  "energyAssetChildrenSibling",
  "energyAssetChildrenStack",
  "solarProductionChildren",
  "visual_ref:firstDefined(vm.visualRef, raw.visual_ref, published.visual_ref, '')",
  "const producerVisualRef = String(firstDefined(vm?.visualRef, raw.visual_ref, row.visual_ref, '')",
  "visual_ref:firstDefined(asset.visual_ref, asset.visualRef, context.asset?.visual_ref, '')"
]){
  if(!source.includes(token)) throw new Error("4.3.23 UX closure missing: "+token);
}

if(source.includes("energyAssetFoldStack${configuration}${details}${diagnostics}${children}")){
  throw new Error("Children must not be nested inside the parent fold stack");
}
if(source.includes("solarProductionHierarchyHead")){
  throw new Error("Solar children must not add a redundant INVERTERS hierarchy wrapper");
}

const deviceStart=source.indexOf("energyDeviceStatusCard(rt");
const deviceEnd=source.indexOf("energyAssetType(asset",deviceStart);
const device=source.slice(deviceStart,deviceEnd);
const cardClose=device.indexOf("</article>\${children}");
if(cardClose < 0) throw new Error("generic object children must render after the parent article");

const stringStart=source.indexOf("solarStringLink(rt");
const stringEnd=source.indexOf("solarInverterCard(rt",stringStart);
const string=source.slice(stringStart,stringEnd);
if(!string.includes("</article>\${children}</div>")) throw new Error("solar string children must render as sibling content");

console.log("PASS 4.3.23 child hierarchy and producer visual precedence");
