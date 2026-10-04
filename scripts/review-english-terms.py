"""Independently recognize every distinct English phrase in the actual Arabic master.

ASR is diagnostic evidence, not a claim that a human has listened to the recording.
"""
from pathlib import Path
import json
import os
import subprocess
import wave

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
os.environ.setdefault("SSL_CERT_FILE", "/etc/ssl/certs/ca-certificates.crt")
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
timeline = json.loads(Path("src/data/timeline.ar.json").read_text())
recordings = json.loads(Path("public/audio/recordings.ar.json").read_text())
with wave.open("public/audio/narration-ar.wav", "rb") as handle:
    rate = handle.getframerate()
    pcm = np.frombuffer(handle.readframes(handle.getnframes()), dtype="<i2")

seen, clips, phrases = set(), [], []
batch_samples = 0
for recording in recordings["recordings"]:
    for term in recording["englishTerms"]:
        key = term["phrase"].lower()
        if key in seen:
            continue
        seen.add(key)
        start = recording["startSample"] + term["startSample"]
        clip = pcm[start:start + term["sampleCount"]]
        phrases.append({"phrase": term["phrase"], "spokenForm": term["spokenText"],
                        "voice": term["voice"], "sourceStartSeconds": start / rate,
                        "batchStartSeconds": batch_samples / rate,
                        "batchEndSeconds": (batch_samples + len(clip)) / rate})
        silence = np.zeros(round(.35 * rate), dtype="<i2")
        clips.extend([clip, silence])
        batch_samples += len(clip) + len(silence)

temp = Path("qa/temp/all-english-terms.wav")
temp.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(temp), "wb") as handle:
    handle.setnchannels(1)
    handle.setsampwidth(2)
    handle.setframerate(rate)
    handle.writeframes(np.concatenate(clips).tobytes())
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(temp),
                               "-ar", "16000", "-ac", "1", "-f", "f32le", "-"])
model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=1,
                     num_workers=1, download_root="qa/temp/asr-models")
segments, _ = model.transcribe(np.frombuffer(raw, dtype=np.float32), language="en",
                               beam_size=5, word_timestamps=True,
                               condition_on_previous_text=False)
recognition = [{"startSeconds": s.start, "endSeconds": s.end, "text": s.text,
                "words": [{"text": w.word, "startSeconds": w.start,
                           "endSeconds": w.end, "probability": w.probability}
                          for w in s.words]} for s in segments]
record = {"method": "Faster Whisper small/int8, English; unique real master segments",
          "directListeningAvailable": False, "audioSha256": timeline["audioSha256"],
          "englishVoice": recordings["englishVoice"], "phrases": phrases,
          "recognition": recognition,
          "limitation": "Recognition errors alone cannot establish a pronunciation error."}
Path("qa/arabic/english-terms-review.json").write_text(
    json.dumps(record, ensure_ascii=False, indent=2) + "\n")
print(f"Reviewed {len(phrases)} distinct English phrases", flush=True)
print(" ".join(s["text"] for s in recognition), flush=True)
