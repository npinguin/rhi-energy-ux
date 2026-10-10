// Canonical Energy asset context; the backend owns class, properties and profile
// evidence. Never infer a profile or completeness from a legacy object registry.
function readEnergyAssetContext(gateway, assetId = "") {
  const id=String(assetId || '').trim();
  const index=gateway?.host?.canonicalIndex;
  const rows=id && index?.byEntity ? [...index.byEntity.values()].filter(row=>
    row.asset_id === id && row.canonical_contract === 'RHI_ENERGY_CANONICAL_PROPERTY_V2') : [];
  if(rows.length===0) return Object.freeze({available:false,asset:null,profile:null,publication:null});
  const classes=new Set(rows.map(row=>row.logical_object_class).filter(Boolean));
  if(classes.size!==1) return Object.freeze({available:false,asset:null,profile:null,publication:null,reason:'ambiguous_asset_class'});
  const first=rows[0];
  const asset=Object.freeze({
    asset_id:id,
    object_class:first.logical_object_class,
    asset_type:first.logical_object_class,
    display_name:String(first.asset_display_name || id),
    parent_asset_id:first.parent_asset_id || null,
    integration_domain:first.integration_domain || null,
    properties:Object.freeze(rows.map(row=>Object.freeze({...row})))
  });
  // Neither profile nor completeness may be synthesized from property-name matches.
  return Object.freeze({available:true,asset,profile:null,publication:null});
}
function energyAssetPublicationGap(gateway, assetId = "") {
  const context=readEnergyAssetContext(gateway,assetId);
  return Object.freeze({
    status:context.available ? 'not_published' : 'unavailable',
    missing:[],unresolved:[],resolution_complete:false,
    authority:'RHI_ENERGY_CANONICAL_PROPERTY_V2',
    reason:context.reason || 'backend_publication_completeness_not_published'
  });
}
