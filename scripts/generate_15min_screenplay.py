"""
Blender-S1 15-Minute Cinematic Documentary Screenplay & Subtitle Generator
Title: "The Silicon Engine: How GPUs Work & Power the AI Revolution"
Duration: 900.00 Seconds (15 Minutes, 21,600 frames @ 24 fps)
Target Audio: Broadcast -14.0 LUFS EBU R128 with sidechain ducking
Subtitles: Clean SubRip (.srt) without redundant act prefixes
"""
import json
import os

# 25 Detailed Cinematic Shots across 5 Acts (900 seconds exact)
SHOTS = [
    # --- ACT 1: THE SILICON CRISIS & THE PARALLELISM REVOLUTION (0:00 - 2:30 | 150s) ---
    {
        "id": "A1_S1",
        "act": 1,
        "start_s": 1.0,
        "end_s": 28.0,
        "shot_name": "Prologue: The Silicon Wall",
        "speaker": "Nova",
        "type": "presenter",
        "text": "For half a century, computing rode the exponential curve of Moore's Law. Transistors shrank, clock frequencies climbed, and every two years, our software ran twice as fast without changing a single line of code. But around 2005, that golden era hit a physical wall. Dennard scaling collapsed.",
    },
    {
        "id": "A1_S2",
        "act": 1,
        "start_s": 30.0,
        "end_s": 62.0,
        "shot_name": "CPU Architecture Cutaway",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Inside a traditional central processing unit, the silicon is dominated by control logic. Branch predictors, out-of-order execution engines, and massive multi-level cache hierarchies consume over eighty percent of the chip area. The CPU was engineered for extreme single-threaded velocity—minimizing the latency of a single sequential train of thought.",
    },
    {
        "id": "A1_S3",
        "act": 1,
        "start_s": 64.0,
        "end_s": 95.0,
        "shot_name": "The GPU Parallel Paradigm",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "When clock speeds stalled at four gigahertz due to thermal dissipation limits, engineers reimagined computing from first principles. Instead of dedicating vast silicon real estate to predicting the future, why not strip away branch prediction and pack the die with thousands of streamlined arithmetic logic units? This is the graphics processing unit.",
    },
    {
        "id": "A1_S4",
        "act": 1,
        "start_s": 97.0,
        "end_s": 128.0,
        "shot_name": "SIMT & Warp Execution",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "The GPU executes code using Single Instruction, Multiple Threads, or SIMT. Threads are not scheduled individually; they are grouped into warps of thirty-two lockstep lanes. A single instruction fetch issues mathematical operations across all thirty-two execution units simultaneously, hiding instruction latency through massive thread-level parallelism.",
    },
    {
        "id": "A1_S5",
        "act": 1,
        "start_s": 130.0,
        "end_s": 149.0,
        "shot_name": "Act 1 Synthesis",
        "speaker": "Nova",
        "type": "presenter",
        "text": "While a CPU is a supersonic jet designed to deliver a handful of passengers to their destination with minimal delay, a GPU is a transcontinental freight train—carrying millions of data elements simultaneously across the silicon landscape.",
    },

    # --- ACT 2: THE MEMORY WALL & HIGH-BANDWIDTH ARCHITECTURE (2:30 - 5:30 | 180s) ---
    {
        "id": "A2_S1",
        "act": 2,
        "start_s": 151.0,
        "end_s": 182.0,
        "shot_name": "The Memory Wall",
        "speaker": "Nova",
        "type": "presenter",
        "text": "Having ten thousand arithmetic cores is useless if they spend ninety percent of their cycles waiting for numbers to arrive from memory. This is the Memory Wall—the fundamental bottleneck where compute capacity outpaces memory bandwidth by orders of magnitude.",
    },
    {
        "id": "A2_S2",
        "act": 2,
        "start_s": 184.0,
        "end_s": 218.0,
        "shot_name": "GDDR vs High Bandwidth Memory",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Traditional computer memory communicates across narrow circuit board traces—thirty-two or sixty-four bits wide. Even ultra-fast GDDR6 memory at twenty gigabits per second struggles to feed modern workloads. To shatter this barrier, engineers pioneered 3D silicon packaging and High Bandwidth Memory.",
    },
    {
        "id": "A2_S3",
        "act": 2,
        "start_s": 220.0,
        "end_s": 255.0,
        "shot_name": "3D TSV Silicon Stacking",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Look closely at modern HBM3 stacks. DRAM dies are thinned to mere micrometers and stacked vertically in columns of eight or sixteen. Microscopic vertical copper channels called Through-Silicon Vias penetrate directly through the silicon substrate, connected by thousands of microbumps.",
    },
    {
        "id": "A2_S4",
        "act": 2,
        "start_s": 257.0,
        "end_s": 298.0,
        "shot_name": "Silicon Interposer & Data Streaming",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Beneath the GPU die and HBM stacks lies a passive silicon interposer—a microscopic highway with sub-micron wiring density. With a bus width of over four thousand bits, modern GPUs stream data at three point three five terabytes per second directly into the on-chip L2 cache and streaming multiprocessor register files.",
    },
    {
        "id": "A2_S5",
        "act": 2,
        "start_s": 300.0,
        "end_s": 328.0,
        "shot_name": "Memory Coalescing Principle",
        "speaker": "Nova",
        "type": "presenter",
        "text": "When all thirty-two threads in a warp access consecutive memory addresses, hardware memory coalescing merges thirty-two individual read requests into a single one-hundred-and-twenty-eight-byte transaction. Bandwidth efficiency approaches one hundred percent.",
    },

    # --- ACT 3: THE TENSOR CORE & THE SYSTOLIC REVOLUTION (5:30 - 8:45 | 195s) ---
    {
        "id": "A3_S1",
        "act": 3,
        "start_s": 331.0,
        "end_s": 364.0,
        "shot_name": "The Mathematical Essence of AI",
        "speaker": "Nova",
        "type": "presenter",
        "text": "Underneath all the modern wonder of large language models, computer vision, and generative intelligence lies a single mathematical operation: General Matrix Multiply. Over ninety-nine percent of all floating-point calculations in neural network training and inference are matrix products.",
    },
    {
        "id": "A3_S2",
        "act": 3,
        "start_s": 366.0,
        "end_s": 402.0,
        "shot_name": "Traditional ALU Arithmetic vs Matrix Math",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Multiplying two N-by-N matrices on standard scalar ALUs requires N-cubed multiplications and additions, with repeated round-trips to the register file. Each arithmetic operation consumes energy moving data back and forth. In 2017, silicon architects introduced a dedicated execution block: the Tensor Core.",
    },
    {
        "id": "A3_S3",
        "act": 3,
        "start_s": 404.0,
        "end_s": 448.0,
        "shot_name": "Inside the 3D Systolic MAC Array",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "A Tensor Core operates on a 2D systolic array of multiply-accumulate processing units. Like blood pulsing rhythmically through a biological circulatory system, values from Matrix A enter from the left, while values from Matrix B cascade from the top. At each internal junction, the unit multiplies its inputs, adds the result to a running sum, and passes the operands downstream.",
    },
    {
        "id": "A3_S4",
        "act": 3,
        "start_s": 450.0,
        "end_s": 494.0,
        "shot_name": "Mixed Precision Architecture",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Tensor Cores unlocked mixed precision. Inputs are ingested in fast sixteen-bit floating point formats, multiplied with high throughput, and accumulated into thirty-two-bit floating point accumulators to prevent numerical drift. A single modern GPU delivers over one thousand teraflops of matrix compute power.",
    },
    {
        "id": "A3_S5",
        "act": 3,
        "start_s": 496.0,
        "end_s": 524.0,
        "shot_name": "Act 3 Milestone",
        "speaker": "Nova",
        "type": "presenter",
        "text": "By shifting from scalar arithmetic to spatial systolic arrays, the energy cost per multiply-accumulate dropped by nearly ninety percent. This single architectural shift made training trillion-parameter foundation models commercially feasible.",
    },

    # --- ACT 4: HIGH-DIMENSIONAL SPACE & THE TRANSFORMER ENGINE (8:45 - 12:00 | 195s) ---
    {
        "id": "A4_S1",
        "act": 4,
        "start_s": 526.0,
        "end_s": 558.0,
        "shot_name": "The Transformer Paradigm",
        "speaker": "Nova",
        "type": "presenter",
        "text": "In 2017, the seminal paper 'Attention Is All You Need' retired recurrence and convolution. Recurrent neural networks processed words one token at a time, creating an inescapable sequential bottleneck. The Transformer discarded temporal loops entirely in favor of parallel self-attention.",
    },
    {
        "id": "A4_S2",
        "act": 4,
        "start_s": 560.0,
        "end_s": 602.0,
        "shot_name": "Vector Embeddings & QKV Projections",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "When text enters a foundation model, each token is mapped into a vector embedding spanning thousands of dimensions. Three linear matrix projections transform these embeddings into Query, Key, and Value representations. Because these projections are pure matrix multiplications, the GPU executes them across thousands of parallel warps at wire speed.",
    },
    {
        "id": "A4_S3",
        "act": 4,
        "start_s": 604.0,
        "end_s": 650.0,
        "shot_name": "Scaled Dot-Product Attention Manifold",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Next comes the heart of intelligence: Query times Key transposed. This computes the pairwise semantic compatibility between every word in the context window. Dividing by the square root of the head dimension prevents softmax saturation, while the softmax surface normalizes attention scores into a probability distribution that selectively weights the Value vectors.",
    },
    {
        "id": "A4_S4",
        "act": 4,
        "start_s": 652.0,
        "end_s": 696.0,
        "shot_name": "The Dynamic Transformer Engine (FP8)",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Modern hardware introduces the Transformer Engine. By dynamically analyzing the statistical range of activation tensors at runtime, the chip switches between eight-bit floating point formats—using E4M3 for weights and forward activations where precision matters, and E5M2 for backward gradients where dynamic range dominates. Compute throughput doubles with zero perceptual degradation.",
    },
    {
        "id": "A4_S5",
        "act": 4,
        "start_s": 698.0,
        "end_s": 724.0,
        "shot_name": "Prefill vs Decode & KV Caching",
        "speaker": "Nova",
        "type": "presenter",
        "text": "During prompt prefill, the GPU is compute-bound, saturating thousands of Tensor Cores. But during autoregressive generation, each new token requires reading the entire previous context. Without KV caching to store precomputed key and value vectors in HBM, generating a single response would slow to a crawl.",
    },

    # --- ACT 5: QUANTIZATION & THE SUPERCOMPUTING HORIZON (12:00 - 15:00 | 180s) ---
    {
        "id": "A5_S1",
        "act": 5,
        "start_s": 726.0,
        "end_s": 758.0,
        "shot_name": "The Scaling Challenge",
        "speaker": "Nova",
        "type": "presenter",
        "text": "Today's largest AI models contain hundreds of billions of parameters. Storing a five-hundred-billion parameter model in FP16 requires one terabyte of high-speed memory just for the weights—far exceeding the capacity of any single silicon chip on Earth. The frontier demands two breakthroughs: extreme quantization, and scale-out clustering.",
    },
    {
        "id": "A5_S2",
        "act": 5,
        "start_s": 760.0,
        "end_s": 802.0,
        "shot_name": "Quantization Lattice Geometry",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Quantization compresses continuous weight distributions into discrete low-bit representations. By mapping floating point tensors to eight-bit or four-bit integers using group-wise scaling factors, memory footprint is slashed by up to seventy-five percent. Advanced algorithms preserve salient outlier channels, enabling models to fit directly on cost-effective enterprise GPUs.",
    },
    {
        "id": "A5_S3",
        "act": 5,
        "start_s": 804.0,
        "end_s": 846.0,
        "shot_name": "NVLink Mesh & NVSwitch Architecture",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "To connect multiple accelerators without crossing the sluggish PCI Express bus, architects engineered NVLink. Providing nine hundred gigabytes per second of bidirectional bandwidth per GPU, NVLink and NVSwitch fabric transform eight physical accelerators into a single monolithic virtual GPU with shared memory and uniform latency.",
    },
    {
        "id": "A5_S4",
        "act": 5,
        "start_s": 848.0,
        "end_s": 880.0,
        "shot_name": "Exascale AI Supercomputing Clusters",
        "speaker": "Narrator",
        "type": "silicon_3d",
        "text": "Across modern AI supercomputers, tens of thousands of GPUs are bound together by low-latency optical InfiniBand networks. 3D parallelism—combining Tensor Parallelism within a server, Pipeline Parallelism across racks, and Data Parallelism across the cluster—powers training runs that execute quintillions of floating point calculations every single second.",
    },
    {
        "id": "A5_S5",
        "act": 5,
        "start_s": 882.0,
        "end_s": 899.0,
        "shot_name": "Epilogue: The Silicon Horizon",
        "speaker": "Nova",
        "type": "presenter",
        "text": "From humble origins accelerating 3D polygons for computer games, the graphics processing unit evolved into the definitive computational engine of human civilization. The future of intelligence is etched in silicon.",
    },
]

def format_timestamp(seconds: float) -> str:
    """Format seconds into SubRip HH:MM:SS,mmm"""
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    msec = int(round((seconds - int(seconds)) * 1000))
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{msec:03d}"

def generate_srt(shots, output_path):
    """Generate clean SubRip subtitles without redundant act prefixes."""
    with open(output_path, "w", encoding="utf-8") as f:
        for idx, shot in enumerate(shots, 1):
            start = format_timestamp(shot["start_s"])
            end = format_timestamp(shot["end_s"])
            speaker = shot["speaker"]
            text = shot["text"]
            f.write(f"{idx}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{speaker}: {text}\n\n")
    print(f"Generated clean SRT subtitles: {output_path} ({len(shots)} cues)")

def export_screenplay(shots, json_path, md_path):
    """Export screenplay to JSON and Markdown for human and automated review."""
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"title": "The Silicon Engine: How GPUs Work & Power the AI Revolution",
                   "duration_s": 900.0,
                   "total_frames": 21600,
                   "fps": 24,
                   "shots": shots}, f, indent=2)
    print(f"Exported screenplay JSON: {json_path}")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# 🎬 The Silicon Engine: How GPUs Work & Power the AI Revolution\n")
        f.write("## 15-Minute Cinematic Documentary Production Screenplay\n\n")
        f.write("- **Total Duration:** 900.00 Seconds (15 Minutes)\n")
        f.write("- **Total Frames:** 21,600 Frames @ 24 fps\n")
        f.write("- **Resolution:** 1080p Full HD (1920×1080)\n")
        f.write("- **Audio:** Broadcast -14.0 LUFS EBU R128 with -14 dB Dynamic Sidechain Ducking\n\n")
        f.write("---\n\n")
        
        current_act = 0
        act_titles = {
            1: "Act 1: The Silicon Crisis & The Parallelism Revolution (0:00 - 2:30)",
            2: "Act 2: The Memory Wall & High-Bandwidth Architecture (2:30 - 5:30)",
            3: "Act 3: The Tensor Core & The Systolic Revolution (5:30 - 8:45)",
            4: "Act 4: High-Dimensional Space & The Transformer Engine (8:45 - 12:00)",
            5: "Act 5: Quantization & The Supercomputing Horizon (12:00 - 15:00)"
        }
        
        for shot in shots:
            if shot["act"] != current_act:
                current_act = shot["act"]
                f.write(f"### {act_titles[current_act]}\n\n")
            
            f.write(f"#### Shot {shot['id']}: {shot['shot_name']}\n")
            f.write(f"- **Timecode:** `{format_timestamp(shot['start_s'])}` → `{format_timestamp(shot['end_s'])}` ({shot['end_s'] - shot['start_s']:.1f}s)\n")
            f.write(f"- **Visual Type:** `{shot['type']}` | **Speaker:** `{shot['speaker']}`\n")
            f.write(f"> **Dialogue:** \"{shot['text']}\"\n\n")

    print(f"Exported screenplay Markdown: {md_path}")

if __name__ == "__main__":
    os.makedirs("d:/New folder/production", exist_ok=True)
    os.makedirs("d:/New folder/production/audio", exist_ok=True)
    
    srt_out = "d:/New folder/production/production_15min.srt"
    json_out = "d:/New folder/production/screenplay_15min.json"
    md_out = "d:/New folder/production/SCREENPLAY_15MIN.md"
    
    generate_srt(SHOTS, srt_out)
    export_screenplay(SHOTS, json_out, md_out)
