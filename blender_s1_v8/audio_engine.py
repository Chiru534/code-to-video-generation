"""
Blender-S1 Phase 8: Audio Production Engine
Generates multi-track dialogue (TTS), sound effects, ambient BGM, and synchronized subtitles.
"""
import os
import math
import wave
import struct
import asyncio
from typing import List
from blender_s1_v8.schemas import AudioPlan, DialogueLine, SFXCue

class AudioProductionEngine:
    def __init__(self, output_dir="/content/production/audio"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def generate_dialogue_track_gtts(self, line: DialogueLine) -> str:
        """Fallback dialogue synthesis using gTTS."""
        from gtts import gTTS
        out_mp3 = os.path.join(self.output_dir, f"{line.line_id}.mp3")
        out_wav = os.path.join(self.output_dir, f"{line.line_id}.wav")
        tts = gTTS(text=line.text, lang='en', tld='com')
        tts.save(out_mp3)
        # Convert to WAV 48kHz mono
        os.system(f'ffmpeg -y -i "{out_mp3}" -ar 48000 -ac 1 "{out_wav}" > /dev/null 2>&1')
        if os.path.exists(out_mp3):
            os.remove(out_mp3)
        return out_wav

    async def _generate_edge_tts(self, text: str, voice: str, out_wav: str):
        import edge_tts
        communicate = edge_tts.Communicate(text, voice)
        out_mp3 = out_wav.replace(".wav", ".mp3")
        await communicate.save(out_mp3)
        os.system(f'ffmpeg -y -i "{out_mp3}" -ar 48000 -ac 1 "{out_wav}" > /dev/null 2>&1')
        if os.path.exists(out_mp3):
            os.remove(out_mp3)

    def generate_dialogue(self, line: DialogueLine, voice="en-US-GuyNeural") -> str:
        """Synthesizes high-fidelity speech for a single dialogue line."""
        out_wav = os.path.join(self.output_dir, f"{line.line_id}.wav")
        try:
            asyncio.run(self._generate_edge_tts(line.text, voice, out_wav))
        except Exception as e:
            print(f"edge-tts failed ({e}), falling back to gTTS...")
            return self.generate_dialogue_track_gtts(line)
        return out_wav

    def generate_procedural_sfx(self, cue: SFXCue) -> str:
        """Synthesizes procedural sound effects (IMPACT, WHOOSH, HUM, FOOTSTEP, RUMBLE)."""
        out_wav = os.path.join(self.output_dir, f"{cue.sfx_id}_{cue.sfx_type}.wav")
        sample_rate = 48000
        n_samples = int(sample_rate * cue.duration)

        with wave.open(out_wav, "w") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)

            raw_data = bytearray()
            for i in range(n_samples):
                t = float(i) / sample_rate
                val = 0.0
                if cue.sfx_type == "HUM":
                    # Resonant dual harmonic hum
                    val = 0.6 * math.sin(2.0 * math.pi * 120.0 * t) + 0.3 * math.sin(2.0 * math.pi * 240.0 * t)
                elif cue.sfx_type == "WHOOSH":
                    # Frequency sweep with envelope
                    env = math.sin(math.pi * t / cue.duration)
                    freq = 150.0 + 600.0 * (t / cue.duration)
                    val = env * math.sin(2.0 * math.pi * freq * t)
                elif cue.sfx_type == "IMPACT":
                    # Decaying percussive strike
                    env = math.exp(-6.0 * t)
                    val = env * (0.7 * math.sin(2.0 * math.pi * 85.0 * t) + 0.3 * math.sin(2.0 * math.pi * 280.0 * t))
                elif cue.sfx_type == "FOOTSTEP":
                    # Short damped thump
                    env = math.exp(-18.0 * (t % 0.6))
                    val = env * math.sin(2.0 * math.pi * 95.0 * (t % 0.6))
                elif cue.sfx_type == "RUMBLE":
                    # Low sub-bass rumble
                    val = 0.8 * math.sin(2.0 * math.pi * 42.0 * t) * (0.8 + 0.2 * math.sin(2.0 * math.pi * 2.5 * t))

                sample_val = int(max(-32767, min(32767, val * cue.volume * 32767.0)))
                raw_data.extend(struct.pack("<h", sample_val))

            wav_file.writeframes(raw_data)
        return out_wav

    def generate_ambient_bgm(self, duration_seconds=60.0, volume=0.3) -> str:
        """Synthesizes a 60-second sci-fi ambient musical bed with chord shifts."""
        out_wav = os.path.join(self.output_dir, "bgm_ambient.wav")
        sample_rate = 48000
        n_samples = int(sample_rate * duration_seconds)

        # Chord progression base frequencies (D minor -> Bb major -> F major -> C major)
        chords = [
            [73.42, 110.0, 146.83, 220.0],   # D minor
            [58.27, 116.54, 146.83, 233.08], # Bb major
            [87.31, 130.81, 174.61, 261.63], # F major
            [65.41, 130.81, 164.81, 196.00]  # C major
        ]

        with wave.open(out_wav, "w") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)

            raw_data = bytearray()
            for i in range(n_samples):
                t = float(i) / sample_rate
                # Determine chord index (switch every 15 seconds)
                chord_idx = min(3, int(t / 15.0))
                current_chord = chords[chord_idx]

                # Sum harmonics with gentle LFO modulation
                lfo = 0.8 + 0.2 * math.sin(2.0 * math.pi * 0.15 * t)
                val = 0.0
                for f_note in current_chord:
                    val += math.sin(2.0 * math.pi * f_note * t)
                val = (val / len(current_chord)) * lfo

                # Fade in first 2 seconds, fade out last 3 seconds
                fade = 1.0
                if t < 2.0:
                    fade = t / 2.0
                elif t > (duration_seconds - 3.0):
                    fade = max(0.0, (duration_seconds - t) / 3.0)

                sample_val = int(max(-32767, min(32767, val * volume * fade * 32767.0)))
                raw_data.extend(struct.pack("<h", sample_val))

            wav_file.writeframes(raw_data)
        return out_wav

    def generate_subtitles_srt(self, dialogue_lines: List[DialogueLine]) -> str:
        """Formats synchronized dialogue into SubRip (.srt) caption file."""
        out_srt = os.path.join(self.output_dir, "production.srt")

        def to_srt_time(sec: float) -> str:
            hrs = int(sec // 3600)
            mins = int((sec % 3600) // 60)
            secs = int(sec % 60)
            millis = int((sec - int(sec)) * 1000)
            return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

        with open(out_srt, "w", encoding="utf-8") as f:
            for idx, line in enumerate(dialogue_lines, 1):
                start = to_srt_time(line.start_time)
                end = to_srt_time(line.start_time + line.duration)
                f.write(f"{idx}\n")
                f.write(f"{start} --> {end}\n")
                f.write(f"[{line.speaker}]: {line.text}\n\n")
        return out_srt

