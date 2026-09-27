// Compact Energy logical-device image editor.
// Presentation-only: selection is drafted in the card and persisted only on explicit Save.
class HomeBrainEnergyVisualPicker {
  constructor() {}

  catalogFor(asset = {}) {
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    return typeof rhiEnergyVisualCatalogForType === "function" ? rhiEnergyVisualCatalogForType(type) : [];
  }

  render(asset = {}, selectedRef = "", { draftRef = "", brand = "all" } = {}) {
    const assetId = String(asset.asset_id || asset.id || "").trim();
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    const choices = this.catalogFor(asset);
    if (!assetId || !type || !choices.length) return "";

    const current = String(draftRef || selectedRef || "").trim();
    const brands = typeof rhiEnergyVisualBrandsForType === "function"
      ? rhiEnergyVisualBrandsForType(type)
      : [...new Set(choices.map(entry => String(entry.brand || "").trim()).filter(Boolean))].sort();
    const activeBrand = brand !== "all" && brands.includes(brand) ? brand : "all";
    const visible = activeBrand === "all" ? choices : choices.filter(entry => String(entry.brand || "") === activeBrand);

    const filters = brands.length > 1
      ? `<div class="energyVisualBrandFilter" aria-label="Filter images by brand">
          <button type="button" class="${activeBrand === "all" ? "selected" : ""}" data-energy-visual-brand="all">All</button>
          ${brands.map(item => `<button type="button" class="${activeBrand === item ? "selected" : ""}" data-energy-visual-brand="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        </div>`
      : "";

    const cards = visible.map(entry => {
      const ref = rhiEnergyVisualRef(entry);
      const visual = typeof resolveEnergyVisualRef === "function" ? resolveEnergyVisualRef(ref) : null;
      const selected = ref === current;
      return `<button class="energyVisualChoice ${selected ? "selected" : ""}" type="button" data-energy-visual-select="${escapeHtml(ref)}" data-energy-visual-asset="${escapeHtml(assetId)}" aria-pressed="${selected ? "true" : "false"}">
        <span class="energyVisualChoiceImage">${visual?.url ? `<img src="${escapeHtml(visual.url)}" alt="">` : ""}</span>
        <span class="energyVisualChoiceCopy"><small>${escapeHtml(entry.brand || "Representative")}</small><b>${escapeHtml(entry.model || entry.label)}</b><em>${escapeHtml(entry.variant || human(type))}</em></span>
      </button>`;
    }).join("");

    return `<div class="energyVisualPickerBackdrop" data-energy-visual-backdrop="1">
      <section class="energyVisualPickerPanel" role="dialog" aria-modal="true" aria-label="Choose image" data-energy-visual-panel="1">
        <header><div><small>APPEARANCE · ${escapeHtml(human(type))}</small><h2>Choose image</h2></div><button type="button" class="energyVisualClose" data-energy-visual-cancel="1" aria-label="Cancel">×</button></header>
        ${filters}
        <div class="energyVisualChoices">${cards}</div>
        <footer>
          <button type="button" class="energyVisualReset" data-energy-visual-reset="${escapeHtml(assetId)}">Use profile default</button>
          <span class="energyVisualFooterSpacer"></span>
          <button type="button" class="energyVisualCancel" data-energy-visual-cancel="1">Cancel</button>
          <button type="button" class="energyVisualSave" data-energy-visual-save="${escapeHtml(assetId)}" ${current ? "" : "disabled"}>Save image</button>
        </footer>
      </section>
    </div>`;
  }
}

function rhiEnergyVisualPickerStyles() {
  return `
    .assetVisual[data-energy-visual-open]{cursor:pointer;outline:0}
    .assetVisual[data-energy-visual-open]:hover{box-shadow:0 0 0 2px rgba(37,99,235,.16)}
    .energyVisualPickerBackdrop{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.44);display:grid;place-items:center;padding:20px}
    .energyVisualPickerPanel{width:min(720px,94vw);max-height:86vh;overflow:auto;background:#fff;border-radius:20px;border:1px solid #e2e8f0;box-shadow:0 30px 80px rgba(15,23,42,.28);padding:18px}
    .energyVisualPickerPanel header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
    .energyVisualPickerPanel header small{font-size:10px;font-weight:800;letter-spacing:.12em;color:#64748b}
    .energyVisualPickerPanel header h2{margin:4px 0 0;font-size:21px}
    .energyVisualClose{border:0;background:#f1f5f9;border-radius:10px;width:36px;height:36px;font-size:22px;cursor:pointer}
    .energyVisualBrandFilter{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px}
    .energyVisualBrandFilter button{border:1px solid #dbe3ee;background:#fff;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer}
    .energyVisualBrandFilter button.selected{border-color:#93c5fd;background:#eff6ff;color:#1d4ed8}
    .energyVisualChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
    .energyVisualChoice{display:grid;grid-template-columns:104px minmax(0,1fr);gap:12px;align-items:center;text-align:left;border:1px solid #e2e8f0;background:#fff;border-radius:14px;padding:10px;cursor:pointer}
    .energyVisualChoice:hover{border-color:#93c5fd;background:#f8fbff}.energyVisualChoice.selected{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.12);background:#f8fbff}
    .energyVisualChoiceImage{width:104px;height:72px;border-radius:10px;background:#f8fafc;display:grid;place-items:center;overflow:hidden}
    .energyVisualChoiceImage img{max-width:100%;max-height:100%;object-fit:contain}
    .energyVisualChoiceCopy{min-width:0}.energyVisualChoiceCopy small,.energyVisualChoiceCopy b,.energyVisualChoiceCopy em{display:block}
    .energyVisualChoiceCopy small{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em}.energyVisualChoiceCopy b{font-size:13px;margin-top:3px}.energyVisualChoiceCopy em{font-size:10px;color:#64748b;font-style:normal;margin-top:3px}
    .energyVisualPickerPanel footer{display:flex;align-items:center;gap:8px;margin-top:14px;border-top:1px solid #eef2f7;padding-top:14px}
    .energyVisualFooterSpacer{flex:1}
    .energyVisualReset,.energyVisualCancel,.energyVisualSave{border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer}
    .energyVisualReset,.energyVisualCancel{border:1px solid #dbe3ee;background:#fff}.energyVisualSave{border:1px solid #2563eb;background:#2563eb;color:#fff}.energyVisualSave:disabled{opacity:.45;cursor:default}
    @media(max-width:700px){.energyVisualChoices{grid-template-columns:1fr}.energyVisualPickerPanel{padding:14px}.energyVisualChoice{grid-template-columns:88px minmax(0,1fr)}.energyVisualChoiceImage{width:88px;height:66px}.energyVisualPickerPanel footer{flex-wrap:wrap}.energyVisualFooterSpacer{display:none}.energyVisualSave{margin-left:auto}}
  `;
}
