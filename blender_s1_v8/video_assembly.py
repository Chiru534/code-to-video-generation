"""
Blender-S1 Phase 8: FFmpeg Video Assembly & Timeline Composition Engine
Concats rendered shots, synchronizes multi-track audio, burns subtitles, and validates output.
"""
import os
import subprocess
import json
from typing import List, Dict
from blender_s1_v8.schemas import TimelinePlan, DialogueLine, SFXCue

class VideoAssemblyEngine:
    def __init__(self, output_dir="/content/production/assembly"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def assemble_final_video(
        self,
        shot_video_paths: List[str],
        dialogue_paths: List[Dict[str, any]], # list of {"path": str, "start_time": float}
        sfx_paths: List[Dict[str, any]],      # list of {"path": str, "start_time": float}
        bgm_path: str,
        subtitles_srt: str,
        output_filename="blender_s1_phase8_the_quantum_core_60s.mp4",
        fps=24,
        resolution=(1280, 720)
    ) -> str:
        final_video_path = os.path.join(self.output_dir, output_filename)
        concat_txt_path = os.path.join(self.output_dir, "concat_shots.txt")

        # 1. Create FFmpeg concat file
        with open(concat_txt_path, "w") as f:
            for p in shot_video_paths:
                f.write(f"file '{p}'\n")

        # 2. Concat video streams losslessly to intermediate
        raw_video_path = os.path.join(self.output_dir, "timeline_video_only.mp4")
        concat_cmd = f'ffmpeg -y -f concat -safe 0 -i "{concat_txt_path}" -c copy "{raw_video_path}"'
        res = subprocess.run(concat_cmd, shell=True, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Warning: concat copy failed, falling back to re-encode concat: {res.stderr}")
            concat_cmd = f'ffmpeg -y -f concat -safe 0 -i "{concat_txt_path}" -c:v libx264 -pix_fmt yuv420p -r {fps} "{raw_video_path}"'
            subprocess.run(concat_cmd, shell=True, check=True)

        # 3. Construct Multi-Track Audio Filtergraph
        # Inputs:
        # Input 0: raw_video_path
        # Input 1: bgm_path
        # Input 2..N: dialogue tracks
        # Input N+1..M: sfx tracks
        input_args = [f'-i "{raw_video_path}"', f'-i "{bgm_path}"']
        filter_complex = []
        mix_inputs = ["[1:a]"] # BGM starts at index 1

        idx = 2
        for d in dialogue_paths:
            input_args.append(f'-i "{d[\'path\']}"')
            delay_ms = int(d['start_time'] * 1000)
            filter_complex.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},volume=1.0[d_{idx}]")
            mix_inputs.append(f"[d_{idx}]")
            idx += 1

        for s in sfx_paths:
            input_args.append(f'-i "{s[\'path\']}"')
            delay_ms = int(s['start_time'] * 1000)
            filter_complex.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},volume=0.8[s_{idx}]")
            mix_inputs.append(f"[s_{idx}]")
            idx += 1

        total_audio_streams = len(mix_inputs)
        filter_complex.append(f"{''.join(mix_inputs)}amix=inputs={total_audio_streams}:duration=first:dropout_transition=2[a_mixed]")

        # Subtitle burning filter
        sub_escaped = subtitles_srt.replace(":", "\\:").replace("\\", "/")
        video_filter = f"[0:v]subtitles='{sub_escaped}':force_style='FontSize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3'[v_sub]"
        filter_complex.append(video_filter)

        full_filter = "; ".join(filter_complex)
        inputs_str = " ".join(input_args)

        master_cmd = (
            f"ffmpeg -y {inputs_str} "
            f'-filter_complex "{full_filter}" '
            f'-map "[v_sub]" -map "[a_mixed]" '
            f"-c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r {fps} "
            f"-c:a aac -b:a 192k -ar 48000 "
            f'-t 60.0 "{final_video_path}"'
        )
        print("Executing FFmpeg Master Composition...")
        res = subprocess.run(master_cmd, shell=True, capture_output=True, text=True)
        if res.returncode != 0:
            print("FFmpeg composition error:", res.stderr)
            # Fallback simpler mix if complex filter encounters font/subtitles issues
            simple_cmd = (
                f'ffmpeg -y -i "{raw_video_path}" -i "{bgm_path}" '
                f'-c:v copy -c:a aac -b:a 192k -t 60.0 "{final_video_path}"'
            )
            subprocess.run(simple_cmd, shell=True, check=True)

        return final_video_path

    def inspect_final_video(self, video_path: str) -> dict:
        """Runs ffprobe to deterministically verify resolution, fps, duration, and streams."""
        cmd = f'ffprobe -v quiet -print_format json -show_format -show_streams "{video_path}"'
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        info = json.loads(res.stdout)

        v_stream = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
        a_stream = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)

        duration = float(info["format"]["duration"])
        size_bytes = int(info["format"]["size"])

        return {
            "video_path": video_path,
            "duration_seconds": duration,
            "size_bytes": size_bytes,
            "width": int(v_stream["width"]) if v_stream else 0,
            "height": int(v_stream["height"]) if v_stream else 0,
            "fps": v_stream.get("r_frame_rate", "24/1") if v_stream else "unknown",
            "video_codec": v_stream.get("codec_name", "none") if v_stream else "none",
            "audio_codec": a_stream.get("codec_name", "none") if a_stream else "none",
            "has_audio": a_stream is not None
        }

