#!/usr/bin/env node
/**
 * Inventory only: canonical-only cutover tracker.
 * Reads source bundle manifest and scans the actual bundled modules.
 * Does NOT create a runtime compatibility layer and does NOT assert readiness.
 * Usage: node tools/audit-canonical-dependencies.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const strict = process.argv.includes('--fail-on-legacy');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/manifest.json'), 'utf8'));
const modules = Array.isArray(manifest.modules)
  ? manifest.modules
  : (manifest.module_groups || []).flatMap(group => group.modules || []);
const patterns = [
  ['energy_public_v2', /RHI_ENERGY_PUBLIC_CONTRACT_V2|rhi_energy_public_contract_v2|readEnergyPublicV2|UX_INTERFACES\.publicV2/gi],
  ['mobility_runtime_v2', /MOBILITY_PUBLIC_RUNTIME_V2|rhi_mobility_runtime_v2|mobilityRuntimeV2\s*\(/gi],
  ['aggregate_snapshot', /snapshot_json|properties_by_key|assets_json|planning_horizons_json/gi],
  ['global_dom_replacement', /shadowRoot\.innerHTML\s*=|this\.shadowRoot\.innerHTML\s*=/gi]
];
const hits = [];
for (const relative of [...new Set(modules)]) {
  if (relative.startsWith('vendor/')) continue;
  const filename = path.join(root, 'src', relative);
  if (!fs.existsSync(filename)) throw new Error('manifest module missing: '+relative);
  const lines = fs.readFileSync(filename, 'utf8').split(/\r?\n/);
  for (let i=0; i<lines.length; i++) {
    for (const [category, re] of patterns) {
      re.lastIndex = 0;
      const matches = [...lines[i].matchAll(re)].map(m=>m[0]);
      if (matches.length) hits.push({module:relative,line:i+1,category,matches});
    }
  }
}
const counts = Object.fromEntries(patterns.map(([key])=>[key,hits.filter(hit=>hit.category===key).length]));
const result = {
  status:'INVENTORY_ONLY_NOT_A_MIGRATION_GATE',
  manifest:'src/manifest.json',
  scanned_modules: modules.filter(x=>!x.startsWith('vendor/')).length,
  counts,
  matches:hits
};
process.stdout.write(JSON.stringify({...result, strict_mode:strict},null,2)+'\n');
if (strict && (counts.energy_public_v2 || counts.mobility_runtime_v2 || counts.aggregate_snapshot)) {
  console.error('FAIL canonical-only dependency gate: retired aggregate references remain in bundled source');
  process.exitCode = 1;
}
