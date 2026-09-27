# RHI Energy UX v4.3.7 — TEST CANDIDATE

## Physical charging topology closure

- consumes the new canonical `RHI_ENERGY_PUBLIC_CONTRACT_V2.connections` projection from Energy E0.15.73;
- keeps Mobility-owned charger and vehicle identity visible when charging power is exactly 0 kW;
- recognizes Mobility's canonical `asset_connected`, `effective_connection_id`, `assigned_connection_id` and `physical_connection_id` semantics;
- renders Charging connections and Physical consumers from producer-owned topology without name/device inference;
- preserves cross-domain `visual_ref` rendering through the Foundation registry;
- includes the pending Solar-zone visible-name ordering cleanup already staged for 4.3.7;
- adds regression coverage for the exact idle charger/vehicle shape that previously disappeared from Flow.

## Required package set

- RHI UX Core **1.5.1** at `bb275767d9e9672713c00b9e8bd9fde13b9b5962`;
- Foundation **F1.8.25+**;
- Energy backend **E0.15.73+**, tested with **E0.15.73**;
- Mobility backend **M0.10.19+**.

Rollback: **v4.3.6**.

Target Home Assistant qualification remains mandatory. The Flow screen must show the idle charger/vehicle topology from the screenshot scenario before stable promotion.
