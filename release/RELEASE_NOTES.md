# RHI Energy UX v3.99.0 — Gas insights TEST CANDIDATE

## Scope

3.99.0 adds Gas as a first-class Energy domain while keeping electricity the primary Energy experience.

- Energy navigation order is now: Overview · Flow · Solar · Home Battery · Consumers · Gas.
- Gas is deliberately the final Energy tab.
- Adds a dedicated Gas hero in the existing Energy/Mobility presentation grammar.
- Uses the canonical `gas_meter` logical asset and its published `gas.total_m3`, optional `gas.flow_m3_h`, health and source identity.
- Does not invent gas-period totals in the frontend.
- Embeds Home Assistant's native Statistics Graph for 30-day gas consumption history using the canonical total-increasing gas meter entity.
- Shows the physical/canonical gas meter card beneath the history.
- Uses a dedicated Gas visual fallback instead of reusing the generic Metering hero.
- Preserves the current electricity-focused Flow, Solar, Battery, Consumers and planning information architecture.

## Compatibility

- Energy UX: 3.99.0
- Required/tested Energy backend: E0.15.32
- Energy contract: R1.89.44_CONTRACT
- Rollback release: v3.98.1
- Accepted technical debt: 0
- Accepted feature debt: 0

Target Home Assistant qualification remains mandatory before stable promotion.
