"""
Blender-S1 Phase 8: Structured Production Planning Schemas
Version: 1.0.0
"""
from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field

class VideoBrief(BaseModel):
    version: str = "1.0.0"
    project_id: str
    title: str
    user_prompt: str
    target_duration_seconds: float = 60.0
    aspect_ratio: str = "16:9"
    style: str = "Cinematic Stylized Sci-Fi"
    target_fps: int = 24
    audio_requirements: List[str] = Field(default_factory=list)

class CharacterSpec(BaseModel):
    character_id: str
    name: str
    archetype: str
    description: str
    scale: List[float] = Field(default_factory=lambda: [1.0, 1.0, 1.0])
    color_palette: Dict[str, List[float]] = Field(default_factory=dict)
    has_cloth: bool = False
    voice_id: str = "en-US-GuyNeural"

class CharacterBible(BaseModel):
    version: str = "1.0.0"
    characters: List[CharacterSpec] = Field(default_factory=list)

class StoryBeat(BaseModel):
    beat_number: int
    act: Literal[1, 2, 3]
    description: str
    characters_involved: List[str]
    time_range_seconds: List[float]

class DialogueLine(BaseModel):
    line_id: str
    speaker: str
    text: str
    start_time: float
    duration: float
    audio_file: Optional[str] = None

class StoryScript(BaseModel):
    version: str = "1.0.0"
    logline: str
    synopsis: str
    beats: List[StoryBeat] = Field(default_factory=list)
    dialogue: List[DialogueLine] = Field(default_factory=list)

class AssetEntry(BaseModel):
    asset_id: str
    asset_type: Literal["CHARACTER", "ENVIRONMENT", "PROP", "LIGHTING_PRESET", "MATERIAL"]
    name: str
    blend_path: Optional[str] = None
    parameters: Dict[str, float] = Field(default_factory=dict)

class AssetManifest(BaseModel):
    version: str = "1.0.0"
    assets: List[AssetEntry] = Field(default_factory=list)

class CameraInstruction(BaseModel):
    focal_length_mm: float = 35.0
    camera_type: Literal["STATIC", "PAN", "TRACK", "DOLLY", "ORBIT"]
    start_location: List[float]
    end_location: List[float]
    look_at_target: List[float]

class CharacterAnimationInstruction(BaseModel):
    character_id: str
    locomotion_action: Literal["IDLE", "WALK", "RUN", "JUMP", "GESTURE", "REACH"]
    facial_expression: Literal["NEUTRAL", "FOCUSED", "SURPRISED", "RESOLUTE"]
    interaction_target: Optional[str] = None
    start_frame: int
    end_frame: int

class PhysicsInstruction(BaseModel):
    active_objects: List[str] = Field(default_factory=list)
    passive_objects: List[str] = Field(default_factory=list)
    impulse_vectors: Dict[str, List[float]] = Field(default_factory=dict)
    cloth_enabled: bool = False
    bake_range: List[int] = Field(default_factory=lambda: [1, 250])

class RenderConfig(BaseModel):
    resolution_x: int = 1280
    resolution_y: int = 720
    fps: int = 24
    engine: Literal["BLENDER_EEVEE_NEXT", "BLENDER_WORKBENCH", "CYCLES"] = "BLENDER_EEVEE_NEXT"
    samples: int = 32

class ShotPlan(BaseModel):
    version: str = "1.0.0"
    shot_id: str
    scene_id: str
    shot_index: int
    duration_seconds: float
    start_time: float
    end_time: float
    environment_ref: str
    character_refs: List[str] = Field(default_factory=list)
    asset_refs: List[str] = Field(default_factory=list)
    camera: CameraInstruction
    animation: List[CharacterAnimationInstruction] = Field(default_factory=list)
    physics: PhysicsInstruction = Field(default_factory=PhysicsInstruction)
    lighting_preset: str = "THREE_POINT_MOODY"
    audio_cues: List[str] = Field(default_factory=list)
    render_config: RenderConfig = Field(default_factory=RenderConfig)
    verification_status: Literal["PLANNED", "STAGED", "SIMULATED", "RENDERED", "VERIFIED", "FAILED"] = "PLANNED"

class ScenePlan(BaseModel):
    version: str = "1.0.0"
    scene_id: str
    scene_title: str
    environment_ref: str
    shots: List[ShotPlan] = Field(default_factory=list)

class BlenderTaskPlan(BaseModel):
    version: str = "1.0.0"
    shot_id: str
    actions: List[Dict[str, int]] = Field(default_factory=list)
    task_vector: List[float] = Field(default_factory=list)

class AnimationPlan(BaseModel):
    version: str = "1.0.0"
    shot_id: str
    character_poses: Dict[str, List[Dict[str, float]]] = Field(default_factory=dict)

class SFXCue(BaseModel):
    sfx_id: str
    sfx_type: Literal["IMPACT", "WHOOSH", "HUM", "FOOTSTEP", "RUMBLE"]
    start_time: float
    duration: float
    volume: float = 0.8

class AudioPlan(BaseModel):
    version: str = "1.0.0"
    dialogue_tracks: List[DialogueLine] = Field(default_factory=list)
    sfx_tracks: List[SFXCue] = Field(default_factory=list)
    bgm_mood: str = "Sci-Fi Tension Building to Resolution"
    bgm_volume: float = 0.35

class TimelineCut(BaseModel):
    shot_id: str
    source_video: str
    timeline_in: float
    timeline_out: float
    duration: float
    transition_type: Literal["CUT", "DISSOLVE", "FADE_BLACK"] = "CUT"

class TimelinePlan(BaseModel):
    version: str = "1.0.0"
    total_duration_seconds: float
    cuts: List[TimelineCut] = Field(default_factory=list)

class RenderManifest(BaseModel):
    version: str = "1.0.0"
    rendered_shots: Dict[str, str] = Field(default_factory=dict)
    total_frames_rendered: int = 0
    render_durations_seconds: Dict[str, float] = Field(default_factory=dict)

class QualityReport(BaseModel):
    version: str = "1.0.0"
    total_shots: int
    shots_verified: int
    missing_assets: List[str] = Field(default_factory=list)
    audio_sync_ok: bool = True
    fps_ok: bool = True
    qc_verdict: Literal["PASS", "FAIL_RETRY", "PASS_WITH_WARNINGS"] = "PASS"

