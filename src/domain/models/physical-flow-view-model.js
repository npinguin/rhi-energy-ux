// Canonical physical-flow projection. Current aggregates come from the shared
// current-energy projection; per-consumer facts use canonical asset projection;
// connection facts use Public V2 connections only.
function buildPhysicalFlowViewModel(runtime, gateway, consumers = [], connections = [], connectionSnapshot = {}) {
  const consumption=readLiveConsumptionContract(gateway);
  const consumerRows=consumers.map(row=>{
    const assetId=String(firstDefined(row.asset_id,row.flexible_asset_id,row.target_asset_id,'')||'');
    const field=assetId ? runtime.assetField(assetId,'flexible_load.power_kw') : null;
    return Object.freeze({...row,asset_id:assetId,physical_power_kw:asNumber(firstDefined(row?.physical_power_kw,field?.resolved===true?field.value:null))});
  });
  const connectionRows=connections.map(row=>{
    const assetId=String(firstDefined(row.connection_asset_id,row.asset_id,row.charger_id,'')||'');
    return Object.freeze({...row,asset_id:assetId,connection_asset_id:assetId,physical_power_kw:asNumber(firstDefined(row.physical_power_kw,row.power_kw))});
  });
  return Object.freeze({
    consumption,
    siteConsumptionKw:consumption.siteConsumptionKw,
    homeConsumptionKw:consumption.homeConsumptionKw,
    flexibleLoadsKw:consumption.flexibleLoadsKw,
    consumers:Object.freeze(consumerRows),
    connections:Object.freeze(connectionRows),
    connectionPowerKw:asNumber(connectionSnapshot.totalPowerKw),
    snapshotRevision:String(connectionSnapshot.snapshotRevision||''),
    observedAt:String(connectionSnapshot.observedAt||''),
    connectionHealth:connectionSnapshot.available?'OK':'UNAVAILABLE',
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.current+connections'
  });
}
