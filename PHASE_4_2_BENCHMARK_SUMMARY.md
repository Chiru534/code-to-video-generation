# Blender-S1 Phase 4.2 Benchmark Summary

All tasks of Phase 4.2 have completed successfully with verified ground-truth metrics.

## Key Benchmark Findings (500 Independent Hard Tasks)
- Total Tasks: 500
- Overlap with Training Data: 0.00%
- Safety Mask Valid Actions: 9.83 actions average (no single-choice bottlenecks)
- Random Baseline: 0.0% task completion, 8.86% action accuracy (cheat eliminated)
- Deterministic Expert: 90.0% task completion (450/500)
- Blender-S1 v2 Leakage-Free (Frozen Neural Network Checkpoint):
  - Clean Scenes (100 tasks): 100/100 completed (100.0%)
  - Cluttered Scenes (100 tasks): 91/100 completed (91.0%)
  - Variable Density Scenes (100 tasks): 36/100 completed (36.0%)
  - Compositional Multistep (100 tasks): 0/100 completed (64.12% action acc)
  - Novel Unseen Families (100 tasks): 0/100 completed (42.17% action acc)
  - Overall Task Success: 227 / 500 (45.40%)
  - Overall Action Accuracy: 68.06%
  - Target Grounding Accuracy: 100.00%
  - CPU Inference Latency: p50 = 4.49 ms, p95 = 6.76 ms
  - Invalid Action Rate: 0.00%

Refer to the complete artifact report:
`C:\Users\chiranjeevi madem\.gemini\antigravity\brain\d27d5d8f-159d-4e70-965a-22493fc0e29a\PHASE_4_2_GENERALIZATION_BENCHMARK_REPORT.md`

