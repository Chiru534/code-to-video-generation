# Blender-S1 Master Skill

This package contains the portable `SKILL.md` that communicates Blender-S1's project intent, protected architecture decisions, current known baseline, training strategy, production vision, compute allocation, evaluation rules, and future roadmap.

## Use

1. Copy the `blender-s1` folder into the skill directory supported by your agent platform.
2. Ensure the skill is enabled or discoverable by the agent.
3. In the first task, ask the agent to perform the **Initial Repository Audit** in §17 of `SKILL.md` before modifying code or starting training.
4. Provide the canonical Phase 8 document `BLENDER-S1-P8-ARCH-001` alongside the repository. This skill records its known intent but does not recreate its exact Pydantic schemas or full execution contract.

## Portability

The skill is intentionally provider-agnostic. It can guide Antigravity, Claude Code, Codex-style coding agents, or another agent that supports Markdown skill instructions. Tool names, skill discovery paths, and runtime APIs differ by host; adapt only the integration wrapper, not the protected Blender-S1 project constraints.
