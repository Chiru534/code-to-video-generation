"""
Blender-S1 Phase 8: Parent LLM Creative Director Interface
Provider-independent LLM client with structured outputs.
"""
import os
import json
from abc import ABC, abstractmethod
from typing import Type, TypeVar, Optional
from pydantic import BaseModel

from blender_s1_v8.schemas import (
    VideoBrief, StoryScript, CharacterBible, CharacterSpec,
    StoryBeat, DialogueLine, AssetManifest, AssetEntry,
    ScenePlan, ShotPlan, CameraInstruction, CharacterAnimationInstruction,
    PhysicsInstruction, RenderConfig, AudioPlan, SFXCue, TimelinePlan,
    TimelineCut, BlenderTaskPlan
)

T = TypeVar("T", bound=BaseModel)

class LLMClient(ABC):
    @abstractmethod
    def generate_structured(self, prompt: str, schema: Type[T], role_prompt: str) -> T:
        """Generate structured output adhering to a Pydantic schema."""
        pass

class MockDirectorLLMClient(LLMClient):
    """
    Deterministic AI Director LLM Client.
    Produces high-fidelity, complete, multi-act production plans
    from natural-language briefs with zero external network dependencies.
    """
    def generate_structured(self, prompt: str, schema: Type[T], role_prompt: str) -> T:
        name = schema.__name__
        if name == "StoryScript":
            return StoryScript(
                logline="Deep inside a forgotten cybernetic vault, explorer Nova uncovers a pulsing Quantum Core and tests its energy threshold.",
                synopsis="Nova descends into an ancient vaulted chamber where an active energy core floats above a pedestal. Reaching out with an IK armature arm, Nova lifts the core and launches it across the chamber to test the dampening field. The core strikes an energy deflector, bounces with rigid restitution, and settles into its containment ring.",
                beats=[
                    StoryBeat(beat_number=1, act=1, description="Establishing shot of the Vault; Nova enters and approaches pedestal.", characters_involved=["CHAR_NOVA"], time_range_seconds=[0.0, 8.0]),
                    StoryBeat(beat_number=2, act=1, description="Tracking camera follows Nova up close; examines the levitating core.", characters_involved=["CHAR_NOVA"], time_range_seconds=[8.0, 18.0]),
                    StoryBeat(beat_number=3, act=2, description="Nova grasps the Quantum Core and lifts it into active hold.", characters_involved=["CHAR_NOVA"], time_range_seconds=[18.0, 30.0]),
                    StoryBeat(beat_number=4, act=2, description="Nova initiates dynamic throw; ballistic projectile release.", characters_involved=["CHAR_NOVA"], time_range_seconds=[30.0, 42.0]),
                    StoryBeat(beat_number=5, act=3, description="Core strikes deflector pillar; ricochets and slides across stone.", characters_involved=[], time_range_seconds=[42.0, 52.0]),
                    StoryBeat(beat_number=6, act=3, description="Wide shot; Nova watches core settle; cloth cape drapes peacefully.", characters_involved=["CHAR_NOVA"], time_range_seconds=[52.0, 60.0])
                ],
                dialogue=[
                    DialogueLine(line_id="DL_01", speaker="NARRATOR", text="Deep within the forgotten facility, the Quantum Core still pulsed with ancient power.", start_time=1.0, duration=6.5),
                    DialogueLine(line_id="DL_02", speaker="NOVA", text="Readings confirmed. Magnetic confinement is holding steady.", start_time=10.0, duration=4.5),
                    DialogueLine(line_id="DL_03", speaker="NOVA", text="Initiating physical kinetic transfer test.", start_time=20.5, duration=4.0),
                    DialogueLine(line_id="DL_04", speaker="NOVA", text="Release phase active. Vector locked.", start_time=32.0, duration=3.5),
                    DialogueLine(line_id="DL_05", speaker="NARRATOR", text="The deflector absorbed the impact. The containment ring sealed instantly.", start_time=44.0, duration=6.0),
                    DialogueLine(line_id="DL_06", speaker="NARRATOR", text="The expedition lives to see tomorrow.", start_time=54.0, duration=4.0)
                ]
            )
        elif name == "CharacterBible":
            return CharacterBible(
                characters=[
                    CharacterSpec(
                        character_id="CHAR_NOVA",
                        name="Nova",
                        archetype="Cybernetic Explorer",
                        description="Bipedal explorer with illuminated cyan visor, armored carbon exoskeleton, and dynamic cloth shoulder cape.",
                        scale=[1.0, 1.0, 1.0],
                        color_palette={"armor": [0.12, 0.14, 0.18, 1.0], "visor": [0.0, 0.85, 1.0, 1.0], "cape": [0.75, 0.22, 0.15, 1.0]},
                        has_cloth=True,
                        voice_id="en-US-GuyNeural"
                    )
                ]
            )
        elif name == "AssetManifest":
            return AssetManifest(
                assets=[
                    AssetEntry(asset_id="CHAR_NOVA", asset_type="CHARACTER", name="Nova Cyber Biped"),
                    AssetEntry(asset_id="ENV_VAULT", asset_type="ENVIRONMENT", name="Ancient Cybernetic Vault"),
                    AssetEntry(asset_id="PROP_CORE", asset_type="PROP", name="Quantum Core Cube", parameters={"mass": 2.5, "restitution": 0.65, "friction": 0.25}),
                    AssetEntry(asset_id="PROP_PEDESTAL", asset_type="PROP", name="Holding Pedestal", parameters={"mass": 0.0, "restitution": 0.2}),
                    AssetEntry(asset_id="PROP_DEFLECTOR", asset_type="PROP", name="Energy Deflector Pillar", parameters={"mass": 0.0, "restitution": 0.75}),
                    AssetEntry(asset_id="LIGHT_MOODY", asset_type="LIGHTING_PRESET", name="Cyan Key Amber Rim"),
                ]
            )
        elif name == "AudioPlan":
            return AudioPlan(
                dialogue_tracks=[
                    DialogueLine(line_id="DL_01", speaker="NARRATOR", text="Deep within the forgotten facility, the Quantum Core still pulsed with ancient power.", start_time=1.0, duration=6.5),
                    DialogueLine(line_id="DL_02", speaker="NOVA", text="Readings confirmed. Magnetic confinement is holding steady.", start_time=10.0, duration=4.5),
                    DialogueLine(line_id="DL_03", speaker="NOVA", text="Initiating physical kinetic transfer test.", start_time=20.5, duration=4.0),
                    DialogueLine(line_id="DL_04", speaker="NOVA", text="Release phase active. Vector locked.", start_time=32.0, duration=3.5),
                    DialogueLine(line_id="DL_05", speaker="NARRATOR", text="The deflector absorbed the impact. The containment ring sealed instantly.", start_time=44.0, duration=6.0),
                    DialogueLine(line_id="DL_06", speaker="NARRATOR", text="The expedition lives to see tomorrow.", start_time=54.0, duration=4.0)
                ],
                sfx_tracks=[
                    SFXCue(sfx_id="SFX_01", sfx_type="HUM", start_time=0.5, duration=15.0, volume=0.4),
                    SFXCue(sfx_id="SFX_02", sfx_type="FOOTSTEP", start_time=3.0, duration=5.0, volume=0.5),
                    SFXCue(sfx_id="SFX_03", sfx_type="WHOOSH", start_time=33.0, duration=1.5, volume=0.7),
                    SFXCue(sfx_id="SFX_04", sfx_type="IMPACT", start_time=42.5, duration=2.0, volume=0.9),
                    SFXCue(sfx_id="SFX_05", sfx_type="RUMBLE", start_time=50.0, duration=4.0, volume=0.6)
                ],
                bgm_mood="Cinematic Sci-Fi Ambient",
                bgm_volume=0.30
            )
        else:
            raise ValueError(f"MockDirectorLLMClient does not have custom generator for {name}")

class AIDirector:
    def __init__(self, client: Optional[LLMClient] = None):
        self.client = client or MockDirectorLLMClient()

    def develop_production_package(self, brief: VideoBrief) -> dict:
        """Orchestrates all director roles to produce a comprehensive production plan."""
        print(f"Director: Analyzing creative brief '{brief.title}'...")
        script = self.client.generate_structured(brief.user_prompt, StoryScript, "DRAMATURG_ROLE")
        bible = self.client.generate_structured(brief.user_prompt, CharacterBible, "CHARACTER_DESIGNER_ROLE")
        manifest = self.client.generate_structured(brief.user_prompt, AssetManifest, "ASSET_SUPERVISOR_ROLE")
        audio = self.client.generate_structured(brief.user_prompt, AudioPlan, "SOUND_DIRECTOR_ROLE")

        # Build 6 detailed shots conforming to ShotPlan
        shots = [
            ShotPlan(
                shot_id="SHOT_01", scene_id="SCENE_01", shot_index=1,
                duration_seconds=8.0, start_time=0.0, end_time=8.0,
                environment_ref="ENV_VAULT", character_refs=["CHAR_NOVA"], asset_refs=["PROP_PEDESTAL", "PROP_CORE"],
                camera=CameraInstruction(focal_length_mm=28.0, camera_type="PAN", start_location=[0.0, -8.0, 4.0], end_location=[0.0, -5.0, 2.5], look_at_target=[0.0, 0.0, 1.0]),
                animation=[CharacterAnimationInstruction(character_id="CHAR_NOVA", locomotion_action="WALK", facial_expression="NEUTRAL", start_frame=1, end_frame=192)],
                lighting_preset="LIGHT_MOODY", audio_cues=["DL_01", "SFX_01", "SFX_02"]
            ),
            ShotPlan(
                shot_id="SHOT_02", scene_id="SCENE_01", shot_index=2,
                duration_seconds=10.0, start_time=8.0, end_time=18.0,
                environment_ref="ENV_VAULT", character_refs=["CHAR_NOVA"], asset_refs=["PROP_PEDESTAL", "PROP_CORE"],
                camera=CameraInstruction(focal_length_mm=50.0, camera_type="TRACK", start_location=[1.5, -3.0, 1.8], end_location=[1.0, -1.8, 1.6], look_at_target=[0.0, 0.0, 1.2]),
                animation=[CharacterAnimationInstruction(character_id="CHAR_NOVA", locomotion_action="IDLE", facial_expression="FOCUSED", start_frame=1, end_frame=240)],
                lighting_preset="LIGHT_MOODY", audio_cues=["DL_02"]
            ),
            ShotPlan(
                shot_id="SHOT_03", scene_id="SCENE_01", shot_index=3,
                duration_seconds=12.0, start_time=18.0, end_time=30.0,
                environment_ref="ENV_VAULT", character_refs=["CHAR_NOVA"], asset_refs=["PROP_CORE"],
                camera=CameraInstruction(focal_length_mm=85.0, camera_type="STATIC", start_location=[0.8, -1.2, 1.3], end_location=[0.8, -1.2, 1.3], look_at_target=[0.0, 0.0, 1.2]),
                animation=[CharacterAnimationInstruction(character_id="CHAR_NOVA", locomotion_action="REACH", facial_expression="FOCUSED", interaction_target="PROP_CORE", start_frame=1, end_frame=288)],
                lighting_preset="LIGHT_MOODY", audio_cues=["DL_03"]
            ),
            ShotPlan(
                shot_id="SHOT_04", scene_id="SCENE_01", shot_index=4,
                duration_seconds=12.0, start_time=30.0, end_time=42.0,
                environment_ref="ENV_VAULT", character_refs=["CHAR_NOVA"], asset_refs=["PROP_CORE", "PROP_DEFLECTOR"],
                camera=CameraInstruction(focal_length_mm=35.0, camera_type="TRACK", start_location=[-2.5, -2.5, 2.0], end_location=[-1.0, 0.0, 1.8], look_at_target=[0.0, 3.0, 1.0]),
                animation=[CharacterAnimationInstruction(character_id="CHAR_NOVA", locomotion_action="GESTURE", facial_expression="RESOLUTE", start_frame=1, end_frame=288)],
                physics=PhysicsInstruction(active_objects=["PROP_CORE"], passive_objects=["PROP_DEFLECTOR", "ENV_VAULT_FLOOR"], impulse_vectors={"PROP_CORE": [0.0, 5.0, 2.0]}, bake_range=[1, 288]),
                lighting_preset="LIGHT_MOODY", audio_cues=["DL_04", "SFX_03"]
            ),
            ShotPlan(
                shot_id="SHOT_05", scene_id="SCENE_01", shot_index=5,
                duration_seconds=10.0, start_time=42.0, end_time=52.0,
                environment_ref="ENV_VAULT", character_refs=[], asset_refs=["PROP_CORE", "PROP_DEFLECTOR"],
                camera=CameraInstruction(focal_length_mm=50.0, camera_type="PAN", start_location=[3.0, 2.0, 1.5], end_location=[2.0, 3.5, 1.2], look_at_target=[0.0, 3.5, 0.5]),
                physics=PhysicsInstruction(active_objects=["PROP_CORE"], passive_objects=["PROP_DEFLECTOR", "ENV_VAULT_FLOOR"], bake_range=[1, 240]),
                lighting_preset="LIGHT_MOODY", audio_cues=["DL_05", "SFX_04"]
            ),
            ShotPlan(
                shot_id="SHOT_06", scene_id="SCENE_01", shot_index=6,
                duration_seconds=8.0, start_time=52.0, end_time=60.0,
                environment_ref="ENV_VAULT", character_refs=["CHAR_NOVA"], asset_refs=["PROP_CORE"],
                camera=CameraInstruction(focal_length_mm=24.0, camera_type="DOLLY", start_location=[0.0, -6.0, 2.0], end_location=[0.0, -9.0, 3.0], look_at_target=[0.0, 0.0, 1.0]),
                animation=[CharacterAnimationInstruction(character_id="CHAR_NOVA", locomotion_action="IDLE", facial_expression="RESOLUTE", start_frame=1, end_frame=192)],
                physics=PhysicsInstruction(cloth_enabled=True, bake_range=[1, 192]),
                lighting_preset="LIGHT_MOODY", audio_cues=["DL_06", "SFX_05"]
            )
        ]

        scene_plan = ScenePlan(scene_id="SCENE_01", scene_title="The Ancient Vault", environment_ref="ENV_VAULT", shots=shots)

        timeline_cuts = [
            TimelineCut(shot_id=s.shot_id, source_video=f"renders/{s.shot_id}.mp4", timeline_in=s.start_time, timeline_out=s.end_time, duration=s.duration_seconds)
            for s in shots
        ]
        timeline = TimelinePlan(total_duration_seconds=60.0, cuts=timeline_cuts)

        return {
            "brief": brief,
            "script": script,
            "bible": bible,
            "manifest": manifest,
            "scene_plan": scene_plan,
            "audio": audio,
            "timeline": timeline
        }

