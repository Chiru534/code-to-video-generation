"""Generate narration WAVs with Kokoro-82M (CPU, ONNX) and emit scene timings.

Run from the video/ directory:
    python tools/tts.py

Outputs:
    public/audio/<id>.wav      one file per narration line
    src/episode/timings.json   measured duration per scene, in frames @ 30fps
"""
import json
import os
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO_DIR = os.path.join(ROOT, "public", "audio")
NARRATION = os.path.join(ROOT, "src", "episode", "narration.json")
TIMINGS = os.path.join(ROOT, "src", "episode", "timings.json")

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
    for path in (MODEL, VOICES):
        if not os.path.exists(path):
            print(f"missing model file: {path}", file=sys.stderr)
            return 2

    from kokoro_onnx import Kokoro

    cfg = json.load(open(NARRATION, encoding="utf-8"))
    voice = cfg.get("voice", "af_heart")
    speed = float(cfg.get("speed", 1.0))

    os.makedirs(AUDIO_DIR, exist_ok=True)
    kokoro = Kokoro(MODEL, VOICES)

    scenes = {}
    total_frames = 0

    for line in cfg["lines"]:
        sid = line["id"]
        text = line["text"].strip()
        samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
        out = os.path.join(AUDIO_DIR, f"{sid}.wav")
        sec = write_wav(out, np.asarray(samples, dtype=np.float32), sr)
        frames = int(round(sec * FPS))
        scenes[sid] = {"sec": round(sec, 3), "frames": frames, "text": text}
        total_frames += frames
        print(f"{sid}: {sec:6.2f}s  {frames:5d} frames  {len(text.split()):3d} words  -> {out}")

    payload = {
        "fps": FPS,
        "voice": voice,
        "speed": speed,
        "totalFrames": total_frames,
        "scenes": scenes,
    }
    with open(TIMINGS, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"\ntotal: {total_frames} frames = {total_frames / FPS:.1f}s")
    print(f"wrote {TIMINGS}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
