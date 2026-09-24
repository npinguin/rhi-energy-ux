// Type-safe Energy logical-device image picker.
// The picker may only select visuals from the current logical asset_type.
class HomeBrainEnergyVisualPicker {
  constructor() {}

  catalogFor(asset = {}) {
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    return typeof rhiEnergyVisualCatalogForType === "function" ? rhiEnergyVisualCatalogForType(type) : [];
  }

  render(asset = {}, selectedRef = "") {
    const assetId = String(asset.asset_id || asset.id || "").trim();
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    const choices = this.catalogFor(asset);
    if (!assetId || !type || !choices.length) return "";
    const current = String(selectedRef || "").trim();
    const cards = choices.map(entry => {
      const ref = rhiEnergyVisualRef(entry);
      const visual = typeof resolveEnergyVisualRef === "function" ? resolveEnergyVisualRef(ref) : null;
      const selected = ref === current;
      return `<button class="energyVisualChoice ${selected ? "selected" : ""}" type="button" data-energy-visual-select="${escapeHtml(ref)}" data-energy-visual-asset="${escapeHtml(assetId)}">
        <span class="energyVisualChoiceImage">${visual?.url ? `<img src="${escapeHtml(visual.url)}" alt="" style="filter:${escapeHtml(visual.filter || "none")}">` : ""}</span>
        <span class="energyVisualChoiceCopy"><small>${escapeHtml(entry.brand || "Representative")}</small><b>${escapeHtml(entry.model || entry.label)}</b><em>${escapeHtml(entry.variant || human(type))}</em></span>
        <span class="energyVisualQuality">${escapeHtml(human(entry.quality || "representative"))}</span>
      </button>`;
    }).join("");
    return `<div class="energyVisualPickerBackdrop" data-energy-visual-backdrop="1">
      <section class="energyVisualPickerPanel" role="dialog" aria-modal="true" aria-label="Choose representative image" data-energy-visual-panel="1">
        <header><div><small>APPEARANCE · ${escapeHtml(human(type))}</small><h2>Choose representative image</h2><p>Only visuals for this logical Energy device type are available. This choice changes presentation only; runtime semantics remain backend-owned.</p></div><button type="button" class="energyVisualClose" data-energy-visual-close-button="1" aria-label="Close">×</button></header>
        <div class="energyVisualChoices">${cards}</div>
        <footer><button type="button" class="energyVisualReset" data-energy-visual-reset="${escapeHtml(assetId)}">Use profile default</button></footer>
      </section>
    </div>`;
  }
}

function rhiEnergyVisualPickerStyles() {
  return `
    .assetVisual[data-energy-visual-open]{cursor:pointer;outline:0}
    .assetVisual[data-energy-visual-open]:hover{box-shadow:0 0 0 2px rgba(37,99,235,.16)}
    .energyVisualPickerBackdrop{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.44);display:grid;place-items:center;padding:20px}
    .energyVisualPickerPanel{width:min(760px,94vw);max-height:86vh;overflow:auto;background:#fff;border-radius:22px;border:1px solid #e2e8f0;box-shadow:0 30px 80px rgba(15,23,42,.28);padding:20px}
    .energyVisualPickerPanel header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
    .energyVisualPickerPanel header small{font-size:10px;font-weight:800;letter-spacing:.12em;color:#64748b}
    .energyVisualPickerPanel header h2{margin:5px 0 6px;font-size:22px}
    .energyVisualPickerPanel header p{margin:0;color:#64748b;font-size:12px;line-height:1.45;max-width:62ch}
    .energyVisualClose{border:0;background:#f1f5f9;border-radius:10px;width:36px;height:36px;font-size:22px;cursor:pointer}
    .energyVisualChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px}
    .energyVisualChoice{display:grid;grid-template-columns:110px minmax(0,1fr);gap:12px;align-items:center;text-align:left;border:1px solid #e2e8f0;background:#fff;border-radius:14px;padding:10px;cursor:pointer;position:relative}
    .energyVisualChoice:hover{border-color:#93c5fd;background:#f8fbff}.energyVisualChoice.selected{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.12)}
    .energyVisualChoiceImage{width:110px;height:78px;border-radius:10px;background:#f8fafc;display:grid;place-items:center;overflow:hidden}
    .energyVisualChoiceImage img{max-width:100%;max-height:100%;object-fit:contain}
    .energyVisualChoiceCopy{min-width:0}.energyVisualChoiceCopy small,.energyVisualChoiceCopy b,.energyVisualChoiceCopy em{display:block}
    .energyVisualChoiceCopy small{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em}.energyVisualChoiceCopy b{font-size:13px;margin-top:3px}.energyVisualChoiceCopy em{font-size:10px;color:#64748b;font-style:normal;margin-top:3px}
    .energyVisualQuality{grid-column:2;font-size:9px;color:#64748b}
    .energyVisualPickerPanel footer{display:flex;justify-content:flex-end;margin-top:14px}.energyVisualReset{border:1px solid #dbe3ee;background:#fff;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer}
    @media(max-width:700px){.energyVisualChoices{grid-template-columns:1fr}.energyVisualPickerPanel{padding:14px}.energyVisualChoice{grid-template-columns:88px minmax(0,1fr)}.energyVisualChoiceImage{width:88px;height:66px}}
  `;
}
