/* C1 Value: five producer-owned financial periods, not UI money recomputation. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ctx={console,Object,Array,String,Number,Boolean,Map,Set,JSON};
vm.createContext(ctx);
for(const file of [
  'src/runtime/canonical-property-index.js',
  'src/runtime/command-contract.js',
  'src/runtime/energy-v2-contract.js',
  'src/domain/selectors/energy-selectors.js'
])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});

const period=(id,net,ok=true,sourceState='OK')=>({
  state:sourceState,
  attributes:{
    contract_id:'RHI_ENERGY_METERING_PERIOD_V1',
    canonical_source:'rhi_energy.runtime',
    publisher:'rhi_energy',
    period_id:id,
    availability:'AVAILABLE',quality:ok?'OK':'PARTIAL',
    summary:{
      measured:{grid_import_kwh:12,grid_export_kwh:2},
      quality:{period:ok?'OK':'PARTIAL'},
      cost:{
        import_cost_eur:8,export_revenue_eur:2,
        net_financial_result_eur:net,
        available:ok,actual_complete:ok,
        site_period_complete:ok,
        financial_coverage_complete:ok,
        quality:ok?'OK':'PARTIAL',
        reason_code:ok?'period_and_financial_evidence_complete':'financial_grid_priced_interval_coverage_incomplete',
        evidence_method:'interval_integrated_timestamp_matched_actuals'
      }
    }
  }
});
const metric=(amount,id)=>({
  state:String(amount),
  attributes:{canonical_source:'rhi_energy.runtime',
    metric_key:'net_financial_result_eur',
    availability:'AVAILABLE',
    period:id,actual_complete:true}
});
const states={
  'sensor.net_financial':metric(-1.1,'today'),
  'sensor.value_hour':period('hour',0.0),
  'sensor.value_today':period('today',-1.1),
  'sensor.value_week':period('week',-4.5),
  'sensor.value_month':period('month',-20.25),
  'sensor.value_year':period('year',-112.4)
};
const product=stateMap=>{const hass={states:stateMap};
  return ctx.readEnergyCanonicalProduct({host:{hass,
    canonicalIndex:ctx.createEnergyCanonicalPropertyIndex(hass)}})};
const p=product(states);
for(const [id,money] of Object.entries({
  hour:0,today:-1.1,week:-4.5,month:-20.25,year:-112.4
})) {
  assert.equal(p.valueAccounting.periods[id].net_financial_result_eur,money);
  assert.equal(ctx.selectEnergyValue({...p,available:true},id).net_financial_result_eur,money);
  assert.equal(ctx.selectEnergyValue({...p,available:true},id).available,true);
}
assert.equal(ctx.selectEnergyValue({...p,available:true},'year').actual_complete,true);

// An explicit incomplete native period overrides even a favorable selected
// metric; old attributes cannot be used to repaint a financial HOLD.
const incomplete=product({...states,'sensor.value_today':period('today',-1.1,false)});
assert.equal(incomplete.valueAccounting.periods.today.available,false);
assert.equal(incomplete.valueAccounting.periods.today.net_financial_result_eur,null);
assert.equal(ctx.selectEnergyValue({...incomplete,available:true},'today').available,false);

// Duplicate physical period publishers may not win by iteration order.
const duplicate=product({...states,'sensor.duplicate_week':period('week',99)});
assert.equal(duplicate.metering.periods.week,undefined);
assert.equal(duplicate.valueAccounting.periods.week,undefined);
assert.equal(ctx.selectEnergyValue({...duplicate,available:true},'week').net_financial_result_eur,null);

// Never calculate EUR from import_cost_eur / export_revenue_eur in the UI.
// The old selected native metric remains a source-owned fallback only when
// the new per-period net EUR proof is not present.
const legacy={...states,
  'sensor.value_today':{
    ...states['sensor.value_today'],
    attributes:{...states['sensor.value_today'].attributes,
      summary:{measured:{grid_import_kwh:12},
        quality:{period:'OK'},cost:{import_cost_eur:8,export_revenue_eur:2}}}
  }};
const legacyProduct=product(legacy);
assert.equal(legacyProduct.valueAccounting.periods.today.net_financial_result_eur,-1.1);
assert.equal(legacyProduct.valueAccounting.periods.week.net_financial_result_eur,-4.5);

assert.equal(ctx.selectEnergyValue({available:true,valueAccounting:{periods:{week:{
  available:false,net_financial_result_eur:123,reason:'bad_coverage'
}}}},'week').net_financial_result_eur,null);
console.log('PASS C1 financial all native periods, real zero, HOLD, duplicate and legacy fallback');
