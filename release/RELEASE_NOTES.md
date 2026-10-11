# v4.3.36-rc.7 — Actual Solar and Battery history graphs (HACS TEST CANDIDATE)

- Implement real Home Assistant history-graph cards in Solar (canonical measured solar power, kW) and Home Battery (canonical system state of charge, %).
- Use exactly one authoritative published RHI_ENERGY_CANONICAL_PROPERTY_V2 sensor per view; reject ambiguous sources, unsupported entity domains and missing sensors. No derived energy totals, synthetic curves or invented cost.
- Working Today/Week/Month controls, HA-native card mounting and explicit unavailable/load-failure states.
- Retain Gas native statistics bar graph, all hero art, tabs, navigation, asset cards and Core 1.6.4 styling.
- Regression coverage for mounting, authority, controls and original Gas graph.

This is a HACS TEST CANDIDATE, not stable. Target Home Assistant mobile/tablet, historic sources and rollback require actual qualification.
Rollback: v4.3.36-rc.6.
