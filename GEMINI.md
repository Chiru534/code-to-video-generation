# Blender-S1 — Workspace Gemini Standards

See `AGENTS.md` for the complete workspace rules, architecture, and execution policies.

## Quick Summary
- **Zero-Local Compute**: Local machine is Agent Control Room only. All heavy 3D rendering and neural compute run on remote cloud GPUs.
- **The Karpathy Protocol**: Enforce "think before doing anything" across all tasks (defined in `AGENTS.md`). Overfit a 1-shot micro-batch before scaling to 15-minute productions.
- **Primary GPU Engine (Kaggle Dual-T4)**: Account `chiranjeevimadem` | Dual Tesla T4 GPUs (30 GB VRAM), 12-hour background execution, managed via `scripts/kaggle_manager.py`.
- **Secondary Engine (Google Colab)**: Tesla T4 via `colab-mcp` (Port: 53957).
- **The Zero-Waste Studio Protocol**:
  1. **Lookdev Gate**: Always verify 1 still frame per shot before batch rendering animation.
  2. **Dual-GPU Split**: Render odd/even frames across GPU 0 & GPU 1 in parallel (2x speed).
  3. **High-Speed Studio PBR**: 21,600 frames rendered in <30 min total compute.
- **Visual Mandate**: True humanoid Nova rig, real labeled silicon schematics, numbers flowing in systolic arrays, 4–7s camera cuts, HSV saturation $\ge 25\%$.
- **Audio Standard**: 1080p, -14 LUFS broadcast audio with sidechain ducking, clean `.srt` subtitles.
- **Storage**: Direct headless Google Drive streaming via Service Account or OAuth.

