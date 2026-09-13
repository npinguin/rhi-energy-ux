// BEGIN GENERATED MODULE: planning/planning-view-model.js
// Stable UX model builder for Planning. Renderers receive meaning, never backend paths.
  function createPlanningViewModel({ gateway, horizonId, flexibleAssets = [], storage = null }) {
    const contract = readPlanningContract(gateway, horizonId);
    const laneTotals = normalizePlanningLaneTotals(contract.laneTotals);
    const rows = contract.buckets.map(bucket => adaptPlanningBucket(bucket, contract.contractVersion));
    const quality = planningObject(contract.horizon.quality);
    const contractSupported = rows.length
      ? rows.every(row => row.contractSupported)
      : /R1\.(79\.[34]|89\.)/.test(contract.contractVersion);
    const stateText = String(firstDefined(contract.horizon.state, contract.horizon.status, quality.health, contract.horizon.quality, '')).toLowerCase();
    return Object.freeze({
      horizonId: contract.horizonId,
      horizon: contract.horizon,
      buckets: contract.buckets,
      assets: flexibleAssets,
      planningAssets: contract.planningAssets,
      planningAssetsById: contract.planningAssetsById,
      todayTotals: contract.planningTodayTotals,
      combinedTotals: contract.planningCombinedTotals,
      storage,
      rows,
      summary: contract.summary,
      laneTotals,
      quality,
      currentActionIntent: contract.currentActionIntent,
      contractVersion: contract.contractVersion,
      contractSupported,
      currentBucketId: String(contract.currentPlanningBucket.bucket_id || ''),
      totalsSource: contract.totalsSource,
      complete: contractSupported && !/incomplete|partial|unavailable/.test(stateText)
    });
  }
// END GENERATED MODULE: planning/planning-view-model.js
