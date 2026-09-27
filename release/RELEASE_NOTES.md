# RHI Energy UX v4.3.10 — TEST CANDIDATE

## Managed consumer semantics closure

This release closes the cross-surface drift where Mobility charger infrastructure could appear as a managed consumer or planning target.

- introduces one central UX distinction between consumer-facing assets and infrastructure-only fallbacks;
- treats Mobility charger/connection fallback rows as infrastructure, never as vehicle/managed-consumer identity;
- preserves producer-owned Mobility `visual_ref` over Energy object enrichment;
- Operational Planning now renders only real consumer/planning targets;
- Consumers excludes charger fallbacks, including rows arriving through Consumer Mix;
- Strategy participation, Tactical Planning, Outlook, Intelligence and Value use the same central consumer/planning participant set;
- Tactical Planning consumes the canonical D0/D1 buckets and planner-owned lane totals that E0.15.76 now preserves through Public V2;
- Strategic Planning is no longer a placeholder: it is a read-only, contract-backed strategic posture built from configured/effective strategy goals, constraints and policies; Strategy remains the edit surface;
- Overview contributor identity excludes infrastructure while the Flexible Loads kW total remains backend-owned physical connection truth;
- Flow keeps physical chargers in Charging connections and vehicles/loads in Physical consumers.

## Required package set

- RHI UX Core **1.5.1** at `bb275767d9e9672713c00b9e8bd9fde13b9b5962`;
- Foundation **F1.8.25+**;
- Mobility backend **M0.10.19+**;
- Energy backend **E0.15.76+**, tested with **E0.15.76**.

Rollback: **v4.3.9**.

Target Home Assistant qualification must prove that charger infrastructure remains visible only where infrastructure belongs, while vehicle/consumer identity and Mobility visuals are consistent across Flow, Consumers, Operational Planning, Planning, Strategy, Intelligence and Value.
