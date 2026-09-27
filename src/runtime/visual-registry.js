// Shared Foundation visual registry reader.
// Producer domains register visual_ref + safe package-relative presentation locators.
// Consumers treat visual_ref as opaque identity and never recreate producer product mappings.
const RHI_VISUAL_REGISTRY_ENTITY = 'sensor.rhi_foundation_visual_asset_registry';

function readRhiVisualRegistry(hass = {}) {
  const state = hass?.states?.[RHI_VISUAL_REGISTRY_ENTITY] || null;
  const attrs = state?.attributes || {};
  const entries = asArray(attrs.entries).filter(row => row && typeof row === 'object');
  const available = !!state
    && String(attrs.contract_id || '') === 'RHI_VISUAL_ASSET_REGISTRY_V1'
    && String(attrs.status || state.state || '').toLowerCase() !== 'degraded';
  return Object.freeze({
    available,
    entityId:RHI_VISUAL_REGISTRY_ENTITY,
    contractVersion:String(attrs.contract_version || ''),
    entries:Object.freeze(entries),
    byRef:new Map(entries.map(row => [String(row.visual_ref || ''), row]).filter(([ref]) => ref))
  });
}

function rhiVisualRegistryEntry(hass = {}, visualRef = '') {
  const ref = String(visualRef || '').trim();
  if (!ref) return null;
  const registry = readRhiVisualRegistry(hass);
  return registry.available ? (registry.byRef.get(ref) || null) : null;
}

function rhiRegisteredVisualUrl(hass = {}, visualRef = '', variant = 'card') {
  const entry = rhiVisualRegistryEntry(hass, visualRef);
  if (!entry) return null;
  const presentation = entry.presentation && typeof entry.presentation === 'object' ? entry.presentation : {};
  const packageId = String(presentation.package_id || '').trim();
  const variants = presentation.variants && typeof presentation.variants === 'object' ? presentation.variants : {};
  const preferred = String(variant || 'card');
  const packagePath = String(
    variants[preferred]
    || variants.card
    || variants.detail
    || variants.thumbnail
    || variants.hero
    || ''
  ).trim();
  if (!/^[a-z0-9_-]+$/.test(packageId)) return null;
  if (!packagePath || packagePath.startsWith('/') || packagePath.includes('..') || packagePath.includes('://')) return null;
  const revision = Number(entry.revision || 1);
  return Object.freeze({
    visual_ref:String(entry.visual_ref || visualRef),
    owner_domain:String(entry.owner_domain || ''),
    asset_type:String(entry.asset_type || ''),
    revision:Number.isFinite(revision) ? revision : 1,
    variant:preferred,
    package_id:packageId,
    package_path:packagePath,
    url:`/hacsfiles/${packageId}/${packagePath}?v=${encodeURIComponent(String(revision || 1))}`
  });
}
