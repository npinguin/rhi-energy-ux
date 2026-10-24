const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const card=fs.readFileSync('src/app/energy-card.js','utf8');
const reader=fs.readFileSync('src/domain/planning/planning-contract.js','utf8');
const lex=fs.readFileSync('src/app/localization.js','utf8');
const a=card.indexOf('\n    nativePlanningHorizon(');
const b=card.indexOf('\n    nativeMetric(',a);
assert.ok(a>0&&b>a,'native Horizon source bounds');
const ctx={Object,Array,Map,Set,String,Number,Boolean,JSON,
  parseMaybeJson:v=>v,objectFrom:v=>(v&&typeof v==='object'?v:{}),
  firstDefined:(...a)=>a.find(x=>x!==null&&x!==undefined),
  asNumber:v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v)
};
vm.createContext(ctx);
const native=vm.runInContext('({'+card.slice(a,b)+'})',ctx).nativePlanningHorizon;
const details={horizon_id:'D2',buckets:[
  {start_time:'2026-10-17T06:00:00Z',solar_kwh:0,
   flexible_scheduled_kwh:0.25,execution_authorized:false}
],quality:{availability:'PARTIAL'},
  flexible_planned_kwh:0.25};
const attrs={canonical_contract:'RHI_ENERGY_PLANNING_HORIZON_V1',
  canonical_source:'rhi_energy.runtime',horizon_id:'D2',variant:'effective',
  availability:'INCOMPLETE',totals_complete:false,details,provider_id:'emhass'};
const host={hass:{states:{'sensor.rhi_energy_planning_d2':{attributes:attrs}}}};
const projection=native.call(host,'D2');
assert.equal(projection.published,true);
assert.equal(projection.available,false);
assert.equal(projection.status,'INCOMPLETE');
assert.equal(projection.details.buckets[0].solar_kwh,0);
assert.equal(native.call({hass:{states:{}}},'D2').published,false);
const doubled=native.call({hass:{states:{
 a:{attributes:attrs},b:{attributes:attrs}
}}},'D2');
assert.equal(doubled.published,false,'duplicate D2 source must fail closed');
vm.runInContext(reader+'\nthis.readPlanningContract=readPlanningContract;',ctx);
const metrics=()=>({available:false,missing:['unavailable'],values:{}});
const runtime={nativePlanningTotals:metrics,
  nativePlanningHorizon:(id,variant)=>native.call(host,id,variant)};
const consumer=ctx.readPlanningContract(runtime,'D2');
assert.equal(consumer.published,true);
assert.equal(consumer.available,false);
assert.equal(consumer.previewOnly,true);
assert.equal(consumer.executionAuthorized,false);
assert.equal(consumer.horizon.status,'INCOMPLETE');
assert.equal(consumer.buckets.length,1);
assert.equal(consumer.buckets[0].solar_kwh,0);
assert.equal(consumer.planningDayAfterTotals.planned_kwh,undefined);
assert.ok(consumer.horizon.quality.missing.includes('native_d2_scalar_totals_unavailable'));
assert.ok(card.includes("...(this.nativePlanningHorizon('D2').published === true ? ['D2'] : [])"));
assert.ok(card.includes("data-planning-horizon=\"D2\""));
for(const key of ['planning.day_after_tomorrow','planning.d2_need','planning.d2_planned','planning.d2_remaining']){
  const matches=lex.match(new RegExp('"'+key.replaceAll('.','\\.')+'"','g'))||[];
  assert.equal(matches.length,3,key+' EN NL FR');
}

/* Exercise the REAL Energy card mapping, not a copied lookup rule. A rolling
 * D2 preview must not relabel D1's remaining need as D2 truth; 0 is still 0.
 */
const mappingStart=card.indexOf('      const canonicalAssetsById = vm.planningAssetsById || {};');
const mappingEnd=card.indexOf('      const hourlyAssetEnergy',mappingStart);
assert.ok(mappingStart>0&&mappingEnd>mappingStart,'real per-asset horizon mapper found');
const mapAssets=new Function('vm','totals','objectFrom','asNumber','firstDefined','assetKey',
  card.slice(mappingStart,mappingEnd)+'\nreturn allAssetTotals;');
const asset={asset_id:'q8.audi',energy_to_target_kwh:12};
const standard={
  energy_need_kwh:12,
  planned_today_kwh:3,planned_tomorrow_kwh:4,
  still_after_today_kwh:9,still_to_plan_kwh:5,
};
const assetVm=(horizon,canonical)=>({
  horizonId:horizon, assets:[asset],planningAssetsById:{'q8.audi':canonical},
  planningAssets:[],
});
const totalsEmpty={flexibleAssetsById:{}};
const mapped=horizon=>mapAssets(assetVm(horizon,standard),totalsEmpty,
  ctx.objectFrom,ctx.asNumber,ctx.firstDefined,x=>String(x.asset_id))[0];
assert.equal(mapped('D0').plannedEnergy,3);
assert.equal(mapped('D0').remainingNeed,9);
assert.equal(mapped('D1').plannedEnergy,4);
assert.equal(mapped('D1').remainingNeed,5);
assert.equal(mapped('D2').plannedEnergy,null);
assert.equal(mapped('D2').remainingNeed,null,'D2 never inherits D1 residual');
const zeroD2=mapAssets(assetVm('D2',{
  ...standard,planned_day_after_tomorrow_kwh:0,still_after_day_after_tomorrow_kwh:0,
}),totalsEmpty,ctx.objectFrom,ctx.asNumber,ctx.firstDefined,x=>String(x.asset_id))[0];
assert.equal(zeroD2.plannedEnergy,0);
assert.equal(zeroD2.remainingNeed,0);

console.log('PASS HA D2 native producer consumer: source identity, preview only, true zero, unknown totals, EN/NL/FR');
