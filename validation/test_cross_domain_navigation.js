const fs=require('fs');
const vm=require('vm');

const core=fs.readFileSync('src/vendor/rhi-ux-core.js','utf8');
const card=fs.readFileSync('src/app/energy-card.js','utf8');

if(!core.includes('function rhiUxResolveDomainAssetNavigation(')) throw new Error('Core generic domain navigation resolver missing');
if(!card.includes('sourceAssetNavigation(asset = {})')) throw new Error('Energy generic source navigation helper missing');
if(!card.includes('rhiUxResolveDomainAssetNavigation(ownerDomain, assetId)')) throw new Error('Energy must resolve producer navigation generically');
if(!card.includes('data-source-asset-nav')) throw new Error('optional source asset action missing');
for(const forbidden of ['/robotix-mobility','/mobility-supervisor','mobility_view=detail']) {
  if(card.includes(forbidden)) throw new Error('Energy hardcodes producer routing: '+forbidden);
}

const storage=(()=>{const data={};return {getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)}}})();
const context={globalThis:{localStorage:storage},String,Object,Array,JSON,encodeURIComponent};
vm.createContext(context);
vm.runInContext(core,context);
if(!context.rhiUxRegisterDomainNavigation({domain:'rhi_future_domain',assetDetailTemplate:'/future-root/asset?asset={asset_id}'},storage)) throw new Error('producer route registration failed');
const route=context.rhiUxResolveDomainAssetNavigation('rhi_future_domain','asset 42',storage);
if(route!=='/future-root/asset?asset=asset%2042') throw new Error('generic producer route resolution failed');
if(context.rhiUxResolveDomainAssetNavigation('rhi_unknown','asset 42',storage)!=='') throw new Error('missing producer route must remain optional');
console.log('PASS generic optional cross-domain source navigation');
