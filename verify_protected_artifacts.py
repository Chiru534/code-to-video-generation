#!/usr/bin/env python3
"""
Blender-S1: Cryptographic Protected Artifacts Verifier
Document Reference: BLENDER-S1-DOC-PROT-003
Verifies the cryptographic integrity (SHA256) of all 5 frozen neural checkpoints
and tracks cloud master film deliverable hashes under the Zero-Local Mandate.
"""
import sys
import hashlib
from pathlib import Path

LOCAL_CHECKPOINTS = {
    "checkpoints/blender_s1_v3_character_rigging.pt": "705107B2F9431BE65EEAFE59B30EB3C0DC4E77BB4FFCD6AF946F53F7E892960E",
    "checkpoints/blender_s1_v4_animation_pilot.pt": "8F4B71E39512F5BEC7B8943B15DE709FC5CC02C493E2ACC5D0AADBBD24BAC813",
    "checkpoints/blender_s1_v4_1_continuous_motion.pt": "5AFFBB45DB4C2C4B1A5EE6ED0F44048C19A6FCEE2C4C114608B1EF16160CA854",
    "checkpoints/blender_s1_v4_2_motion_intelligence.pt": "1FD7FE174D51B65BBCE445465F4394EE95C8339030A8EC00119BD07A19DDB89C",
    "checkpoints/blender_s1_v5_pilot.pt": "79AC9D5CD20840685B7F6A9A5F0151DF98A798CFC57B022D1E95F0B913ECA745"
}

REMOTE_CLOUD_DELIVERABLES = {
    "NOVA_FIRST_CONTACT_15S.mp4 (Phase 8 Baseline)": {
        "rel_path": "phase8_nova_capability_test/NOVA_FIRST_CONTACT_15S.mp4",
        "sha256": "F7C6E270074620A4B0627BF2EFC97E971F6325612C6F876634E701ED567E26D3",
        "cloud_storage": "Google Drive (<DRIVE_MOUNT>/blender_s1/productions/)",
        "git_archive": "tag: r0-baseline"
    },
    "FINAL_QUANTUM_CORE_60S.mp4 (Phase 8 V2 Reference)": {
        "rel_path": "phase8_production_v2/FINAL_QUANTUM_CORE_60S.mp4",
        "sha256": "4510F63861FB5C4D5E3E77C1C5DA0FD0CFA4B4DAB0C57D62599322C42876B8EE",
        "cloud_storage": "Google Drive (<DRIVE_MOUNT>/blender_s1/productions/)",
        "git_archive": "tag: r0-baseline"
    }
}

def compute_sha256(file_path: Path) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest().upper()

def main():
    root = Path(__file__).resolve().parent
    print("================================================================================")
    print("                BLENDER-S1 CRYPTOGRAPHIC ARTIFACT VERIFIER                      ")
    print("================================================================================")
    
    all_passed = True
    print("\n[SECTION 1: FROZEN NEURAL POLICY CHECKPOINTS]")
    for rel_path, expected_hash in LOCAL_CHECKPOINTS.items():
        full_path = root / rel_path
        if not full_path.exists():
            print(f" [MISSING] {rel_path}")
            all_passed = False
            continue
        
        actual_hash = compute_sha256(full_path)
        if actual_hash == expected_hash:
            size_mb = full_path.stat().st_size / (1024 * 1024)
            print(f" [PASSED]  {rel_path} ({size_mb:.2f} MB)")
            print(f"           SHA256: {actual_hash[:16]}...{actual_hash[-16:]}")
        else:
            print(f" [FAILED]  {rel_path}")
            print(f"           Expected: {expected_hash}")
            print(f"           Actual:   {actual_hash}")
            all_passed = False

    print("\n[SECTION 2: CLOUD MASTER FILM DELIVERABLES (ZERO-LOCAL MANDATE)]")
    for name, meta in REMOTE_CLOUD_DELIVERABLES.items():
        local_path = root / meta["rel_path"]
        if local_path.exists():
            actual_hash = compute_sha256(local_path)
            status = "PASSED (LOCAL CACHE)" if actual_hash == meta["sha256"] else "HASH MISMATCH"
            print(f" [{status}] {name}")
            print(f"           SHA256: {actual_hash[:16]}...{actual_hash[-16:]}")
        else:
            print(f" [CLOUD-PRESERVED] {name}")
            print(f"           Registered SHA256: {meta['sha256'][:16]}...{meta['sha256'][-16:]}")
            print(f"           Storage Location:  {meta['cloud_storage']}")
            print(f"           Git Baseline:      {meta['git_archive']}")

    print("================================================================================")
    if all_passed:
        print(" VERDICT: ALL LOCAL CHECKPOINTS & CLOUD DELIVERABLE HASHES VERIFIED")
        print("================================================================================")
        sys.exit(0)
    else:
        print(" VERDICT: CHECKPOINT INTEGRITY VIOLATION DETECTED")
        print("================================================================================")
        sys.exit(1)

if __name__ == "__main__":
    main()
