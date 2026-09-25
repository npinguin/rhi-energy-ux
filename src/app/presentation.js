// Energy presentation grammar.
// Owns navigation metadata, tab hero assets, shared visual hierarchy and card primitives.
// Domain semantics, calculations, actions and runtime truth remain backend/domain owned.

const HB_ENERGY_NAVIGATION = Object.freeze([
  {
    id: "energy",
    label: "Energy",
    items: [
      { id:"overview", label:"Overview", view:"overview", title:"Energy Overview", description:"Your home energy system at a glance." },
      { id:"flow", label:"Flow", view:"flow", title:"Energy Flow", description:"See where energy is flowing right now." },
      { id:"solar", label:"Solar", view:"solar", title:"Solar", description:"Solar generation, arrays, inverters and the relationship with storage." },
      { id:"battery", label:"Home Battery", view:"battery", title:"Home Battery", description:"Storage state, capacity and contribution to the home." },
      { id:"consumers", label:"Consumers", view:"consumers", title:"Consumers", description:"Where energy is used and which loads are controllable." },
      { id:"gas", label:"Gas", view:"gas", title:"Gas", description:"Gas consumption, history and meter health." }
    ]
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { id:"strategy", label:"Strategy", view:"strategies", title:"Strategy", description:"Strategy overview, effective policy and current runtime state." },
      { id:"operational-planning", label:"Operational Planning", view:"operational-planning", title:"Operational Planning", description:"What should happen now and in the next hours." },
      { id:"tactical-planning", label:"Tactical Planning", view:"planning", title:"Tactical Planning", description:"How energy is allocated across today and tomorrow." },
      { id:"strategic-planning", label:"Strategic Planning", view:"strategic-planning", title:"Strategic Planning", description:"Longer-term energy goals, constraints and optimisation." }
    ]
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      { id:"metering", label:"Metering", view:"metering", title:"Metering", description:"Measured energy for the selected period." },
      { id:"value", label:"Value", view:"value", title:"Value", description:"Financial impact of your energy system." },
      { id:"retrospective", label:"Retrospective", view:"retrospective", title:"Retrospective", description:"How Home Intelligence performed and what can improve." }
    ]
  }
]);

const HB_ENERGY_HERO_ASSETS = Object.freeze({
  overview: "heroes/overview-hero.webp",
  flow: "heroes/flow-hero.webp",
  solar: "heroes/solar-hero.webp",
  "solar-generation": "heroes/solar-hero.webp",
  battery: "heroes/battery-hero.webp",
  consumers: "heroes/consumers-hero.webp",
  gas: "heroes/gas-hero.svg",
  strategy: "heroes/strategies-hero.webp",
  strategies: "heroes/strategies-hero.webp",
  intelligence: "heroes/intelligence-hero.webp",
  "operational-planning": "heroes/planning-hero.webp",
  outlook: "heroes/outlook-hero.webp",
  "tactical-planning": "heroes/planning-hero.webp",
  planning: "heroes/planning-hero.webp",
  "strategic-planning": "heroes/strategies-hero.webp",
  metering: "heroes/metering-hero.webp",
  value: "heroes/value-hero.webp",
  retrospective: "heroes/diagnostics-hero.webp"
});

const HB_ENERGY_PROFILE_ALIASES = Object.freeze({
  "solar-generation": "solar",
  planning: "outlook",
  "strategic-planning": "strategies"
});

function hbEnergyAssetUrl(relativePath = "") {
  const normalized = String(relativePath || "").replace(/^\/+/, "");
  return `/hacsfiles/rhi-energy-ux/assets/${normalized}?v=${encodeURIComponent(UX_VERSION)}`;
}

function hbEnergyHeroAsset(tab = "overview") {
  return hbEnergyAssetUrl(HB_ENERGY_HERO_ASSETS[tab] || HB_ENERGY_HERO_ASSETS.overview);
}

function hbEnergyProfileKey(tab = "overview") {
  return HB_ENERGY_PROFILE_ALIASES[tab] || tab;
}

function hbEnergyPresentationStyles() {
  return `
    :host{
      --rhi-page-max:1640px;
      --rhi-page-pad-x:28px;
      --rhi-page-pad-y:18px;
      --rhi-space-1:4px;
      --rhi-space-2:8px;
      --rhi-space-3:12px;
      --rhi-space-4:16px;
      --rhi-radius-sm:10px;
      --rhi-radius-md:14px;
      --rhi-radius-lg:18px;
      --rhi-line:#E4EAF2;
      --rhi-ink:#0F172A;
      --rhi-muted:#64748B;
      --rhi-blue:#1467F5;
      --rhi-surface:#FFFFFF;
      --rhi-soft:#F8FAFC;
      --rhi-shadow:0 12px 30px rgba(15,35,80,.055);
      --rhi-card-gap:8px;
    }

    /* Mobility-parity page hero: copy left, product image right, compact status row below. */
    .hiTabExperienceHeader{display:block!important;margin:0 0 10px!important}
    .hiTabHero{
      position:relative!important;
      min-height:136px!important;
      height:auto!important;
      display:grid!important;
      grid-template-columns:minmax(0,1.28fr) minmax(280px,.72fr)!important;
      align-items:stretch!important;
      gap:14px!important;
      padding:0!important;
      overflow:hidden!important;
      border:1px solid #DDE6F0!important;
      border-radius:var(--rhi-radius-lg) var(--rhi-radius-lg) 0 0!important;
      background:linear-gradient(135deg,#F8FBFF 0%,#FFFFFF 52%,#EEF5FF 100%)!important;
      box-shadow:var(--rhi-shadow)!important;
    }
    .hiTabHeroCopy{
      position:relative!important;
      z-index:2!important;
      min-width:0!important;
      max-width:820px!important;
      padding:18px 0 18px 22px!important;
      align-self:center!important;
    }
    .hiTabHeroCopy>small{display:block!important;margin:0 0 4px!important;font-size:9px!important;font-weight:760!important;letter-spacing:.13em!important;text-transform:uppercase!important;color:#5E6E84!important}
    .hiTabHeroCopy h2{margin:0 0 5px!important;font-size:clamp(24px,2.2vw,34px)!important;line-height:1.02!important;letter-spacing:-.035em!important;color:var(--rhi-ink)!important;font-weight:680!important;text-shadow:none!important}
    .hiTabPurpose{margin:0!important;max-width:720px!important;color:var(--rhi-muted)!important;font-size:11.5px!important;line-height:1.38!important;font-weight:520!important}
    .hiTabLiveLine{margin-top:9px!important;display:flex!important;align-items:baseline!important;gap:7px!important;flex-wrap:wrap!important;color:#334155!important}
    .hiTabLiveLine strong{font-size:10px!important;font-weight:650!important;color:#64748B!important}
    .hiTabHeroValue{margin:0!important;font-size:18px!important;line-height:1!important;font-weight:720!important;letter-spacing:-.025em!important;color:#0F172A!important}
    .hiTabLiveLine>span{font-size:10px!important;color:#64748B!important}
    .hiTabHeroArt{position:relative!important;min-height:136px!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;overflow:hidden!important;pointer-events:none!important}
    .hiTabHeroArt:before{content:""!important;position:absolute!important;inset:0!important;z-index:2!important;background:linear-gradient(90deg,rgba(255,255,255,.18),rgba(255,255,255,.02) 34%,rgba(238,245,255,.04))!important;pointer-events:none!important}
    .hiTabHeroArt img{position:relative!important;z-index:1!important;width:100%!important;height:100%!important;min-height:136px!important;max-height:148px!important;object-fit:cover!important;object-position:center 56%!important;transform:scale(1.01)!important}
    .hiTabHeroBadge{position:absolute!important;right:12px!important;bottom:10px!important;z-index:3!important;width:auto!important;max-width:220px!important;padding:0!important;background:transparent!important}
    .hiTabSimpleBadge{display:inline-flex!important;align-items:center!important;gap:6px!important;width:max-content!important;max-width:220px!important;border-radius:999px!important;padding:5px 8px!important;background:rgba(255,255,255,.88)!important;border:1px solid rgba(255,255,255,.75)!important;box-shadow:0 7px 18px rgba(15,35,80,.08)!important;backdrop-filter:blur(8px)!important;font-size:9.5px!important;font-weight:700!important;white-space:nowrap!important}
    .hiTabSimpleBadge:before{content:""!important;width:7px!important;height:7px!important;border-radius:50%!important;background:#94a3b8!important;flex:0 0 auto!important}
    .hiTabSimpleBadge.ok:before{background:#22c55e!important}
    .hiTabSimpleBadge.attention:before{background:#f59e0b!important}

    /* One card grammar for compact facts across all Energy tabs. */
    .hiTabStatusGrid,.rhi-fact-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:var(--rhi-card-gap)!important;padding:8px!important;border:1px solid var(--rhi-line)!important;border-top:0!important;border-radius:0 0 var(--rhi-radius-lg) var(--rhi-radius-lg)!important;background:#fff!important;box-shadow:var(--rhi-shadow)!important}
    .hiTabStatusItem,.rhi-fact{min-width:0!important;min-height:58px!important;display:grid!important;grid-template-columns:30px minmax(0,1fr)!important;gap:8px!important;align-items:center!important;padding:9px 11px!important;border:1px solid #EDF1F6!important;border-radius:var(--rhi-radius-md)!important;background:var(--rhi-soft)!important;box-shadow:none!important}
    .hiTabStatusIcon{width:30px!important;height:30px!important;border-radius:9px!important;display:grid!important;place-items:center!important;background:#fff!important;border:1px solid #E6EDF7!important;font-size:15px!important}
    .hiTabStatusCopy{min-width:0!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;column-gap:6px!important;align-items:baseline!important}
    .hiTabStatusCopy small{font-size:9.5px!important;line-height:1.1!important;color:#718096!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .hiTabStatusCopy b{font-size:13px!important;line-height:1.1!important;font-weight:680!important;color:var(--rhi-ink)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .hiTabStatusCopy em{grid-column:1/-1!important;margin-top:2px!important;font-size:9px!important;line-height:1.15!important;font-style:normal!important;color:var(--rhi-muted)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}

    .rhi-context-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:var(--rhi-card-gap)!important}
    .rhi-context-card{min-width:0!important;border:1px solid var(--rhi-line)!important;border-radius:var(--rhi-radius-lg)!important;background:#fff!important;box-shadow:0 8px 22px rgba(15,35,80,.04)!important;padding:14px 16px!important}
    .rhi-data-list{display:grid!important;gap:6px!important}
    .rhi-data-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:12px!important;align-items:center!important;padding:9px 10px!important;border:1px solid #EDF1F6!important;border-radius:var(--rhi-radius-sm)!important;background:var(--rhi-soft)!important}

    @media(max-width:1024px){
      :host{--rhi-page-pad-x:18px;--rhi-page-pad-y:14px}
      .hiTabHero{grid-template-columns:minmax(0,1fr) minmax(240px,.62fr)!important;min-height:142px!important}
      .hiTabHeroCopy{padding:16px 0 16px 18px!important}
      .hiTabHeroArt,.hiTabHeroArt img{min-height:142px!important}
    }
    @media(max-width:760px){
      :host{--rhi-page-pad-x:10px;--rhi-page-pad-y:10px}
      .hiTabHero{min-height:126px!important;grid-template-columns:minmax(0,1fr) minmax(118px,.42fr)!important;gap:2px!important;border-radius:16px 16px 0 0!important}
      .hiTabHeroCopy{padding:13px 0 13px 13px!important}
      .hiTabHeroCopy>small{font-size:8px!important;margin-bottom:3px!important}
      .hiTabHeroCopy h2{font-size:23px!important;margin-bottom:4px!important}
      .hiTabPurpose{font-size:10px!important;line-height:1.28!important;display:-webkit-box!important;-webkit-line-clamp:3!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
      .hiTabLiveLine{margin-top:7px!important}
      .hiTabHeroArt,.hiTabHeroArt img{min-height:126px!important;max-height:126px!important}
      .hiTabHeroArt img{object-position:62% center!important}
      .hiTabHeroBadge{display:none!important}
      .hiTabStatusGrid,.rhi-fact-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;border-radius:0 0 16px 16px!important}
      .rhi-context-grid{grid-template-columns:1fr!important}
    }
    @media(max-width:430px){
      :host{--rhi-page-pad-x:8px;--rhi-page-pad-y:8px}
      .hiTabHero{min-height:118px!important;grid-template-columns:minmax(0,1fr) 110px!important}
      .hiTabHeroCopy{padding:11px 0 11px 11px!important}
      .hiTabHeroCopy h2{font-size:21px!important}
      .hiTabPurpose{-webkit-line-clamp:2!important;font-size:9.5px!important}
      .hiTabHeroArt,.hiTabHeroArt img{min-height:118px!important;max-height:118px!important}
      .hiTabLiveLine strong{display:none!important}
    }
    @media(min-width:1440px){
      .hiTabHero{grid-template-columns:minmax(0,1.36fr) minmax(360px,.64fr)!important}
      .hiTabHeroArt img{object-position:55% center!important}
    }
  `;
}
