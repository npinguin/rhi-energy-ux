// Canonical Energy product projection from direct HA object/property entities,
// domain-owned native metrics and published horizon decisions. No aggregate
// Public V2 snapshot is read here. Screens receive one coherent read-only view.
function readEnergyCanonicalProduct(gateway) {
  const index=gateway?.host?.canonicalIndex;
  const hass=gateway?.host?.hass || {};
  const propertyRows=index?.productRows?.() || [];
  const ids=new Set();
  const byId=new Map();
  const byKey=new Map();
  const byAssetAndKey=new Map();
  const conflicts=new Set();
  const objectRows=index?.objectRows?.() || [];
  for(const object of objectRows) {
    if(object.object_class === 'energy_configuration') continue;
    if(byId.has(object.asset_id)){conflicts.add(object.asset_id);continue;}
    byId.set(object.asset_id,{...object,properties:[]});
  }
  for(const property of propertyRows) {
    const id=String(property.asset_id || '');
    const key=String(property.property_key || '');
    if(!id || !key || index?.ambiguousObjects?.has(id)) continue;
    const objectClass=String(property.logical_object_class || '');
    if(objectClass === 'energy_configuration') continue;
    const object=byId.get(id);
    if(object && object.object_class !== objectClass) {conflicts.add(id);continue;}
    if(!object)byId.set(id,{
      asset_id:id,object_class:objectClass,asset_type:objectClass,
      display_name:String(property.asset_display_name || id),
      parent_asset_id:property.parent_asset_id || null,
      profile_id:'',visual_ref:'',properties:[]
    });
    byId.get(id).properties.push(property);
  }
  for(const id of conflicts)byId.delete(id);
  for(const [id,obj] of byId) {
    ids.add(id);
    Object.freeze(obj.properties);
    byId.set(id,Object.freeze(obj));
    for(const p of obj.properties) {
      const key=String(p.property_key);
      byAssetAndKey.set(id+'::'+key,p);
      if(!byKey.has(key))byKey.set(key,p);
      else {byKey.set(key,null);}
    }
  }
  const objects=Object.freeze([...byId.values()]);
  const semantic=raw=>{
    if(!raw || raw.availability !== 'AVAILABLE')return Object.freeze({
      resolved:false,value:null,display:'—',status:'UNAVAILABLE',state:'unavailable',
      reason:String(raw?.reason || 'canonical_property_not_published'),
      quality:String(raw?.quality || 'UNKNOWN'),unit:String(raw?.unit || ''),raw:raw || {}
    });
    return Object.freeze({
      resolved:true,value:raw.value,display:String(raw.value),status:'AVAILABLE',
      state:'available',reason:String(raw.reason || ''),quality:String(raw.quality || ''),
      unit:String(raw.unit || ''),editable:raw.editable === true,
      editor:raw.editor || null,write:raw.write || null,
      constraints:raw.constraints || {},raw
    });
  };
  const currentField=key=>semantic(byKey.get(String(key || '')) || null);
  const currentMap=[
    ['battery','battery_system',['power_kw','soc_pct','capacity_kwh','available_kwh','state','reserve_target_pct']],
    ['solar','solar_production',['power_kw']],
    ['grid','grid_connection',['net_power_kw','flow_direction']],
    ['home','home_consumption',['power_kw']],
    ['consumption','site_consumption',['power_kw']],
    ['flexible','flexible_loads',['power_kw','attributed_power_kw','available_power_kw']]
  ];
  const core={},coreByKey=new Map();
  for(const [section,cls,keys] of currentMap) {
    const sectionFields={};
    const matching=objects.filter(obj=>obj.object_class===cls);
    for(const field of keys) {
      const key=section==='grid' && field==='net_power_kw' ? 'grid.net_power_kw'
        : section==='grid' && field==='flow_direction' ? 'grid.flow_direction'
        : section==='grid' ? 'grid_'+field
        : section==='consumption' ? 'site_consumption.'+field
        : section==='home' ? 'home_consumption.'+field
        : section==='battery' ? 'battery.'+field
        : section==='solar' ? 'solar.'+field : 'flexible_loads.'+field;
      const rows=matching.flatMap(o=>o.properties.filter(p=>p.property_key===key));
      const one=rows.length===1?rows[0]:null;
      const value=semantic(one);
      coreByKey.set(key,value);
      sectionFields[field]=value;
    }
    core[section]={fields:sectionFields,...Object.fromEntries(Object.entries(sectionFields).map(([key,row])=>[key,row.resolved ? row.value : null]))};
  }
  const configRows=propertyRows.filter(row=>row.logical_object_class === 'energy_configuration');
  for(const p of configRows){
    const key=String(p.property_key || ''),id=String(p.asset_id || '');
    if(!key || !id)continue;
    byAssetAndKey.set(id+'::'+key,p);
    if(!byKey.has(key))byKey.set(key,p);
    else byKey.set(key,null);
  }
  const forFamily=kind=>configRows.filter(row=>row.presentation_family === kind);
  const pricingRows=forFamily('pricing'), strategyRows=forFamily('strategy'), meteringRows=forFamily('metering');
  const groupProfiles=new Map();
  for(const row of strategyRows) {
    const id=String(row.asset_id || '').replace(/^configuration:/,'');
    if(!id)continue;
    if(!groupProfiles.has(id))groupProfiles.set(id,{
      profile_id:id,display_name:id.replace(/_/g,' '),configured_properties:[],effective_properties:[]
    });
    groupProfiles.get(id).configured_properties.push(row);
  }
  const configuration={
    pricing:{properties:pricingRows},
    metering:{properties:meteringRows},
    strategy:{profiles:[...groupProfiles.values()],configured:{properties:strategyRows},
      configured_properties:strategyRows,effective:{properties:[],status:'UNAVAILABLE',reason:'effective_strategy_not_published'}}
  };
  const horizons={},planningObjects=[];
  for(const id of ['D0','D1']) {
    const native=typeof gateway.host?.nativePlanningTotals==='function'
      ? gateway.host.nativePlanningTotals(id) : readNativeEnergyPlanningTotals(hass,id);
    const detail=typeof gateway.host?.nativePlanningHorizon==='function'
      ? gateway.host.nativePlanningHorizon(id):null;
    const attrs=detail?.available === true ? detail.details || {} : {};
    const numeric=(field)=>{
      const cell=native?.values?.[field];
      return cell?.available === true ? Number(cell.value) : null;
    };
    const totalFields=['required_kwh','planned_kwh','still_to_plan_kwh',
      'flexible_required_kwh','flexible_planned_kwh','flexible_still_to_plan_kwh'];
    horizons[id]={
      horizon_id:id,
      // Numeric totals are evidence, not proof that an effective plan exists.
      status:detail?.available === true ? 'AVAILABLE' : (detail?.status || 'INCOMPLETE'),
      quality:{availability:detail?.available === true ? 'AVAILABLE' : (detail?.status || 'INCOMPLETE'),
        reason_code:detail?.reason || null,
        missing:native?.missing || totalFields},
      requested_provider:detail?.metadata?.requested_provider ?? null,
      effective_provider:detail?.available === true ? (detail?.metadata?.effective_provider ?? detail?.metadata?.provider_id ?? null) : null,
      ...Object.fromEntries(totalFields.map(k=>[k,numeric(k)])),
      buckets:Array.isArray(attrs.buckets) ? attrs.buckets:[],
      planning_assets:Array.isArray(attrs.planning_assets)?attrs.planning_assets:[],
      source_lanes:attrs.source_lanes || {},consumer_lanes:attrs.consumer_lanes || {},
      balance:attrs.balance || {},battery_ledger:attrs.battery_ledger || {},
      policy_evidence:attrs.policy_evidence || {},plan_id:attrs.plan_id || null,
      generated_at:attrs.generated_at || null,provider_id:attrs.provider_id || null,
      execution_policy:attrs.execution_policy || {}
    };
    for(const row of horizons[id].planning_assets) if(row?.asset_id)
      planningObjects.push({...row,horizon_id:id});
  }
  const nativeValue=readNativeEnergyMetric(hass,'net_financial_result_eur');
  const period=nativeValue?.period || null;
  const valueAccounting={selected_period_id:period,
    periods:period && nativeValue.available ? {
      [period]:{available:true,actual_complete:nativeValue.actual_complete === true,
        net_financial_result_eur:Number(nativeValue.value),
        quality:nativeValue.quality,reason:nativeValue.reason || ''}
    } : {},
    net_financial_result:period && nativeValue.available ?
      {value:Number(nativeValue.value),period_id:period,actual_complete:nativeValue.actual_complete} : {}
  };
  const flexibleAssets=objects.filter(obj=>obj.object_class==='flexible_load').map(obj=>{
    const rows=obj.properties;
    const facts=Object.fromEntries(rows.filter(p=>p.availability === 'AVAILABLE')
      .map(p=>[p.property_key,p.value]));
    const propertyValue=suffix=>rows.find(p=>p.property_key===suffix)?.value ?? null;
    return {...obj,...facts,power_kw:propertyValue('power_kw'),
      energy_to_target_kwh:propertyValue('energy_to_target_kwh'),
      flexible_role:propertyValue('flexible_role'),visible:true,show_in_primary_ux:true};
  });
  const nativeCommands=readEnergyCommandContract(gateway).rows;
  const envelope=Object.freeze({entityId:null,available:!!index?.hasCanonicalTruth?.(),
    contractVersion:'ENERGY_CANONICAL_NATIVE_V2'});
  // Navigation presence is published by the native object/configuration
  // inventory, not guessed from a momentary power measurement or old snapshot.
  // An unavailable battery remains visible so the user can diagnose it.
  const objectClasses=new Set(objects.map(obj=>String(obj.object_class || '')));
  const presence=Object.freeze({
    battery:objectClasses.has('battery_system') || objectClasses.has('battery'),
    gas:objectClasses.has('gas_meter'),
    flexible_loads:objectClasses.has('flexible_load') ||
      objectClasses.has('flexible_loads'),
    solar:objectClasses.has('solar_production'),
    pricing:pricingRows.length>0,
    strategy:strategyRows.length>0,
    metering:meteringRows.length>0,
    planning:Object.values(horizons).some(h=>h.status==='AVAILABLE')
  });
  const capabilities={
    core:propertyRows.length>0,assets:objects.length>0,
    planning:Object.values(horizons).some(h=>h.status==='AVAILABLE'),
    pricing:pricingRows.length>0,strategy:strategyRows.length>0,
    commands:nativeCommands.length>0,
    value_accounting:nativeValue.available === true
  };
  return Object.freeze({
    envelope,available:envelope.available,publicContractOk:envelope.available,
    corePresent:capabilities.core,capabilities,compatibilityReason:envelope.available?'':'canonical_energy_property_unavailable',
    contractVersion:envelope.contractVersion,release:'',
    health:envelope.available?'AVAILABLE':'UNAVAILABLE',
    core,summary:{},experience:{presence},presence,
    objects,profiles:[],relationships:[],connections:[],commands:nativeCommands,activity:[],
    planning:{horizons},metering:{periods:{}},retrospective:{},intelligence:{},overview:{},
    configuration,valueAccounting,layers:{planning_objects:planningObjects},
    flexibleAssets:Object.freeze(flexibleAssets),planningObjects:Object.freeze(planningObjects),
    objectById:byId,profileById:new Map(),
    propertyRows:Object.freeze(propertyRows),configurationRows:Object.freeze(configRows),
    allPropertyRows:Object.freeze(propertyRows),propertyByKey:byKey,
    propertyByAssetAndKey:byAssetAndKey,coreByKey,
    currentAggregateObject:()=>null,currentField,
    object:id=>byId.get(String(id||''))||null,
    profile:()=>null,
    property:(key,id='')=>id ? (byAssetAndKey.get(String(id)+'::'+String(key)) || null)
      : (byKey.get(String(key)) || null),
    field:(key,id='')=>semantic(id ? byAssetAndKey.get(String(id)+'::'+String(key))
      : byKey.get(String(key)))
  });
}

function createEnergyAssetProjection(product,assetId) {
  const asset=product?.object?.(assetId);
  if(!asset)return null;
  const properties=(asset.properties || []).map(row=>({...row,projection:product.field(row.property_key,assetId)}));
  return Object.freeze({
    identity:Object.freeze({asset_id:asset.asset_id,display_name:asset.display_name,
      asset_type:asset.object_class,object_class:asset.object_class,
      profile_id:asset.profile_id || '',visual_ref:asset.visual_ref || '',
      source:'RHI_ENERGY_CANONICAL_OBJECT_V2'}),
    lifecycle:Object.freeze({state:asset.health || 'UNKNOWN',source:'RHI_ENERGY_CANONICAL_OBJECT_V2'}),
    properties:Object.freeze(properties),
    property:key=>product.field(key,assetId),
    relationships:Object.freeze([]),controls:Object.freeze([]),
    profile:null,raw:asset
  });
}
