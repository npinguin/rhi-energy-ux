# Energy UX product vision and backlog

## Product position

RHI Energy must evolve from a technically complete energy dashboard into a dependable Home Intelligence product.

The primary user questions are:

- What is happening in my home energy system?
- Why is it happening?
- What is Home Intelligence planning to do?
- Do I need to intervene?
- What did the decision cost or save, and what did we learn?

The long-term experience follows:

```text
Observe → Understand → Decide → Act → Learn
```

Energy keeps backend/domain ownership intact. UX selects, composes, formats and explains published truth; it does not reconstruct missing Energy semantics.

## Current product maturity statement

The product is **not yet mature**.

In particular, Planning and Intelligence must be treated as **P0 unqualified product capability** until the complete V2 journey works on the target Home Assistant. Static V2 coverage, green CI and structurally present contracts are not enough.

Observed product acceptance status: Planning/Intelligence has not demonstrated a dependable end-to-end working user journey since the V2 transition. Until target-runtime proof closes this, documentation and release decisions must not describe it as product-complete.

## P0 — make Planning and Intelligence work end-to-end

This is the first product priority before broadening the feature set.

Acceptance requires, on the exact immutable candidate:

- Energy public V2 planning contract available with real household data;
- current operational intent rendered correctly;
- planned totals for today rendered correctly;
- still-to-plan totals rendered correctly;
- tomorrow horizon rendered correctly;
- per-asset planning rows map to the correct canonical physical/logical assets;
- Strategy shows configured intent and effective state correctly;
- price settings are editable where the backend publishes an editable contract;
- strategy settings are editable where the backend publishes an editable contract;
- every write is proven through canonical readback;
- refresh/reload/restart does not lose or falsify state;
- null/zero/unavailable remain semantically distinct;
- planning/intelligence survives upgrade from the previous candidate;
- rollback is proven;
- desktop and iPad flows are usable;
- product-level qualification evidence is recorded in `release/QUALIFICATION.json`.

If a required backend contract is missing, that remains an explicit backend dependency. UX must fail closed rather than invent the missing truth.

## P0 — no orphan pilot features

Before the first mature Energy release, every visible feature must be either:

- part of a coherent supported user journey;
- deliberately feature-gated/hidden while incomplete; or
- removed.

A pilot page that renders but is not connected to a working journey does not count as product completeness.

## P1 — rationalize information architecture

The current architecture exposes many technically meaningful destinations. The product direction is to reduce the mental model.

Target direction:

### Energy
- Overview
- Solar
- Battery
- Consumption

Live Flow should primarily become a strong Overview capability with drill-down rather than automatically requiring equal top-level weight.

Gas should be positioned according to the broader household-resource model rather than because it is a separate technical interface.

### Intelligence
- Plan
- Strategy

Operational, tactical and strategic horizons remain valid domain concepts, but the normal user should not have to learn three planning taxonomies merely to understand what will happen now, today, tomorrow and later.

### Insights
- Performance
- Value

Metering becomes evidence under user questions. Retrospective evolves into outcome review and learning instead of a separate technical destination.

## P1 — Intelligence decision experience

Converge the UI on:

- Status — what is happening;
- Attention — what requires action;
- Opportunity — what could be improved;
- Recommendation — what Home Intelligence proposes;
- Why? — published reasons/evidence;
- Expected outcome — consequence before action;
- Action/override — permitted user intervention;
- Actual outcome — measured result;
- Learning — backend-published retrospective conclusion.

The normal healthy state should be calm: **No action needed**.

## P1 — Home Intelligence Overview

Overview should become a decision cockpit rather than a dashboard index.

It should answer within seconds:

- Is the home on track?
- What is changing?
- Is anything requiring attention?
- What will happen automatically?
- What is the expected/realized value?

Technical evidence remains available through progressive disclosure.

## P2 — engineering structure supporting product iteration

The current architecture boundaries are sound, but `src/app/energy-card.js` remains too large a change surface.

Move toward screen-owned modules such as:

- overview;
- flow;
- solar;
- battery;
- consumption;
- planning;
- strategy;
- insights.

The root custom element should increasingly own lifecycle, routing and composition rather than the implementation of every product screen.

This refactor is valuable only when it reduces change risk and supports the P0/P1 product work; it is not a goal on its own.

## Release maturity rule

Do not promote Energy as mature/stable on feature count or static completeness.

A mature release requires:

- no P0 broken core journey;
- Planning/Intelligence target-runtime proof;
- no visible orphan pilot capability;
- required write/readback journeys proven;
- coherent Overview/Intelligence/Insights navigation;
- immutable candidate upgrade and rollback proof.
