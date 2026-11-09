"""Generate narration WAVs with Kokoro-82M (CPU, ONNX) and emit scene timings.

Run from the video/ directory:

    python tools/tts.py                                  # ep01 defaults
    python tools/tts.py --src-dir src/episode02 \
                        --audio-dir public/audio/ep02    # ep02

Outputs:
    <audio-dir>/<id>.wav      one file per narration line
    <src-dir>/timings.json    measured duration per scene, in frames @ 30fps

Why per-episode directories: scene ids restart at s01 in every episode, so a
shared audio/ folder would let episode 2 silently overwrite episode 1's voice
tracks and every render would still be "green".
"""
import argparse
import json
import os
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

FPS = 30
MODEL = os.environ.get("KOKORO_MODEL", os.path.join(ROOT, "kokoro-v1.0.onnx"))
VOICES = os.environ.get("KOKORO_VOICES", os.path.join(ROOT, "voices-v1.0.bin"))


def write_wav(path: str, samples: np.ndarray, sample_rate: int) -> float:
    """Write mono 16-bit PCM. Returns duration in seconds."""
    data = np.clip(samples, -1.0, 1.0)
    pcm = (data * 32767).astype(np.int16)
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(pcm.tobytes())
    return len(pcm) / float(sample_rate)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src-dir", default="src/episode", help="folder holding narration.json")
    ap.add_argument("--audio-dir", default="public/audio/ep01", help="where to write the WAVs")
    args = ap.parse_args()

    narration = os.path.join(ROOT, args.src_dir, "narration.json")
    timings_path = os.path.join(ROOT, args.src_dir, "timings.json")
    audio_dir = os.path.join(ROOT, args.audio_dir)

    for path in (MODEL, VOICES):
        if not os.path.exists(path):
            print(f"missing model file: {path}", file=sys.stderr)
            return 2
    if not os.path.exists(narration):
        print(f"missing narration: {narration}", file=sys.stderr)
        return 2

    from kokoro_onnx import Kokoro

    cfg = json.load(open(narration, encoding="utf-8"))
    voice = cfg.get("voice", "af_heart")
    speed = float(cfg.get("speed", 1.0))

    os.makedirs(audio_dir, exist_ok=True)
    kokoro = Kokoro(MODEL, VOICES)

    print(f"narration : {narration}")
    print(f"audio     : {audio_dir}")
    print(f"voice     : {voice} @ {speed}x\n")

    scenes = {}
    total_frames = 0

    for line in cfg["lines"]:
        sid = line["id"]
        text = line["text"].strip()
        samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
        out = os.path.join(audio_dir, f"{sid}.wav")
        sec = write_wav(out, np.asarray(samples, dtype=np.float32), sr)
        frames = int(round(sec * FPS))
        scenes[sid] = {"sec": round(sec, 3), "frames": frames, "text": text}
        total_frames += frames
        print(f"{sid}: {sec:6.2f}s  {frames:5d} frames  {len(text.split()):3d} words")

    payload = {
        "fps": FPS,
        "voice": voice,
        "speed": speed,
        "totalFrames": total_frames,
        "scenes": scenes,
    }
    with open(timings_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"\ntotal: {total_frames} frames = {total_frames / FPS:.1f}s")
    print(f"wrote {timings_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
