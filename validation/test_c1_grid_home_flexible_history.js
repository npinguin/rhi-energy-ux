const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('src/app/energy-card.js','utf8');
const l10n=fs.readFileSync('src/app/localization.js','utf8');
const take=(name,next)=>{
  const begin=src.indexOf('\n    '+name+'(');
  const asyncBegin=src.indexOf('\n    async '+name+'(');
  const a=begin<0?asyncBegin:asyncBegin<0?begin:Math.min(begin,asyncBegin);
  const end=src.indexOf('\n    '+next+'(',a+1);
  const asyncEnd=src.indexOf('\n    async '+next+'(',a+1);
  const b=end<0?asyncEnd:asyncEnd<0?end:Math.min(end,asyncEnd);
  assert.ok(a>=0&&b>a,name+' method bounds');
  return src.slice(a,b);
};
const context={
  escapeHtml:x=>String(x??'').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  rhiEnergyT:(_h,k,_p,v)=>v,
  window:{}
};
vm.createContext(context);
const methods=[take('canonicalEnergyHistorySensor','energyHistorySection'),
take('energyHistorySection','mountEnergyHistoryGraphs'),
take('mountEnergyHistoryGraphs','mountGasStatisticsGraph')].join(',');
const sut=vm.runInContext('({'+methods+'})',context);
const mkRow=(property,cls,entity)=>({
  property_key:property,logical_object_class:cls,availability:'AVAILABLE',entity_id:entity
});
const cases=[
['grid_import','grid_import.power_kw','grid_connection'],
['grid_export','grid_export.power_kw','grid_connection'],
['home','home_consumption.power_kw','home_consumption'],
['flexible','flexible_loads.power_kw','flexible_loads']
];
const rt=rows=>({canonicalIndex:{rowsForProperty:k=>rows.filter(x=>x.property_key===k)}});
for(const [kind,key,cls] of cases){
  const entity='sensor.rhi_energy_'+kind+'_power';
  const host={
    _hass:{},selectedEnergyHistoryPeriodId:'week',
    canonicalEnergyHistorySensor:sut.canonicalEnergyHistorySensor
  };
  const markup=sut.energyHistorySection.call(host,rt([mkRow(key,cls,entity)]),kind);
  assert.match(markup,new RegExp('data-history-kind="'+kind+'"'));
  assert.match(markup,/data-hours-to-show="168"/);
  assert.ok(markup.includes(entity),kind+' must use backend-published sensor');
  const missing=sut.energyHistorySection.call(host,rt([]),kind);
  assert.match(missing,/Measured history unavailable/);
  assert.doesNotMatch(missing,/data-energy-history-host/);
  const duplicate=sut.energyHistorySection.call(host,rt([
    mkRow(key,cls,entity), mkRow(key,cls,entity+'2')
  ]),kind);
  assert.doesNotMatch(duplicate,/data-energy-history-host/,'ambiguous source must fail closed');
}
assert.match(src,/this\.energyHistorySection\(rt,kind\)/);
assert.match(src,/\['grid_import','grid_export','home','flexible'\]/);
const issued=[];
context.window.loadCardHelpers=async()=>({createCardElement:async config=>{
  issued.push(config);
  return {hass:null};
}});
const hosts=cases.map(([kind])=>({
  dataset:{entityId:'sensor.rhi_energy_'+kind+'_power',hoursToShow:'24',historyKind:kind},
  firstElementChild:null,isConnected:true,replaceChildren(card){this.mounted=card}
}));
(async()=>{
  await sut.mountEnergyHistoryGraphs.call({
    view:'flow',_hass:{},shadowRoot:{querySelectorAll:()=>hosts}
  });
  assert.equal(issued.length,4);
  for(const [i,config] of issued.entries()){
    assert.equal(config.type,'history-graph');
    assert.deepEqual([...config.entities],[hosts[i].dataset.entityId]);
    assert.equal(config.hours_to_show,24);
    assert.ok(hosts[i].mounted);
  }
  for(const key of ['history.grid_import','history.grid_export','history.home',
    'history.flexible','history.measured_power','history.unavailable','history.unavailable_desc']){
    assert.equal((l10n.match(new RegExp('"'+key.replaceAll('.','\\.')+'"','g'))||[]).length,3);
  }
  console.log('PASS C1 Flow Solar/Grid/Home/Flexible source-backed history, missing/duplicate guards and EN/NL/FR');
})().catch(err=>{console.error(err);process.exitCode=1;});
