const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('src/app/energy-card.js','utf8');
const begin=src.indexOf('\n    reconcileWriteFeedback() {');
const end=src.indexOf('\n    reconcilePendingAppearances() {',begin);
assert.ok(begin>=0&&end>begin);
const ns={
  objectFrom:row=>(row&&typeof row==='object'?row:{}),
  firstDefined:(...rows)=>rows.find(x=>x!==undefined&&x!==null&&x!==''),
  rowValue:row=>row?.value,
  Date
};
vm.createContext(ns);
const fn=vm.runInContext('({'+src.slice(begin,end)+'})',ns).reconcileWriteFeedback;
function scenario(op,value=0.2,feedback={}){
  const row={availability:'AVAILABLE',value,operation:op};
  const client={
    _hass:{},editDrafts:{'pricing.spot_eur_kwh':0.2},
    writeFeedback:{'pricing.spot_eur_kwh':{
      state:'pending',value:0.2,previousOperationId:'old',transportComplete:true,
      issuedAt:Date.now(),updated:Date.now(),...feedback
    }},
    runtime(){return {row:()=>row}},
    valuesEqual(a,b){return a!==undefined&&b!==undefined&&
      (typeof a==='number'&&typeof b==='number' ? Math.abs(a-b)<1e-9 : a===b)}
  };
  fn.call(client);
  return client;
}
const old={operation_id:'old',status:'CONFIRMED',requested_value:0.2,readback_value:0.2};
const unchanged=scenario(old);
assert.equal(unchanged.writeFeedback['pricing.spot_eur_kwh'].state,'verifying');
assert.equal(unchanged.editDrafts['pricing.spot_eur_kwh'],0.2);
const fresh=scenario({...old,operation_id:'new'});
assert.equal(fresh.writeFeedback['pricing.spot_eur_kwh'].state,'accepted');
assert.equal(fresh.writeFeedback['pricing.spot_eur_kwh'].confirmedOperationId,'new');
assert.ok(!('pricing.spot_eur_kwh' in fresh.editDrafts));
assert.equal(scenario({...old,operation_id:'new',readback_value:0.3}).writeFeedback['pricing.spot_eur_kwh'].state,'verifying');
assert.equal(scenario({...old,operation_id:'new'},0.3).writeFeedback['pricing.spot_eur_kwh'].state,'verifying');
assert.equal(scenario({...old,operation_id:'new',status:'PENDING'}).writeFeedback['pricing.spot_eur_kwh'].state,'verifying');
assert.equal(scenario({...old,operation_id:'new',status:'REJECTED',reason:'not_editable'}).writeFeedback['pricing.spot_eur_kwh'].state,'rejected');
assert.equal(scenario(old,0.2,{issuedAt:Date.now()-31000}).writeFeedback['pricing.spot_eur_kwh'].state,'timed_out');
assert.equal(scenario({...old,operation_id:'new'},0.2,{transportComplete:false}).writeFeedback['pricing.spot_eur_kwh'].state,'pending');
assert.match(src,/previousOperationId: String\(objectFrom\(row\?\.operation/);
assert.match(src,/issuedAt: Date\.now\(\)/);
console.log('PASS Energy pricing/strategy Save requires NEW confirmed producer operation, matching requested/readback/native values');
