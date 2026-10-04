"""Independent ASR and waveform review of the actual complete Arabic master.

This is reproducible automated evidence, not a claim of direct human listening.
Install requirements-qa.txt; the ASR model is downloaded into an ignored cache.
"""
from pathlib import Path
import json
import os
import re
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
output = Path("qa/arabic")
output.mkdir(parents=True, exist_ok=True)
with wave.open("public/audio/narration-ar.wav", "rb") as handle:
    rate = handle.getframerate()
    pcm = np.frombuffer(handle.readframes(handle.getnframes()), dtype="<i2")
decoded = subprocess.check_output(["ffmpeg", "-v", "error", "-i", "public/audio/narration-ar.wav",
                                   "-ar", "16000", "-ac", "1", "-f", "f32le", "-"])
samples = np.frombuffer(decoded, dtype=np.float32)
model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=1,
                     num_workers=1, download_root="qa/temp/asr-models")
record = {"method": "Faster Whisper small/int8, explicit language; waveform and real boundary checks",
          "directListeningAvailable": False, "audioSha256": timeline["audioSha256"],
          "arabicVoice": recordings["voice"], "englishVoice": recordings["englishVoice"],
          "beats": [], "criticalTerms": []}
cache = Path("qa/temp/asr-arabic")
cache.mkdir(parents=True, exist_ok=True)
for recording in recordings["recordings"]:
    start = recording["startSample"] / rate
    end = start + recording["sampleCount"] / rate
    key = cache / f"{timeline['audioSha256'][:12]}-{recording['beat']}.json"
    if key.exists():
        reviewed = json.loads(key.read_text())
    else:
        segments, _ = model.transcribe(samples[round(start*16000):round(end*16000)],
                                        language="ar", beam_size=3, condition_on_previous_text=False)
        reviewed = {"scene": recording["scene"], "beat": recording["beat"],
                    "startSeconds": start, "endSeconds": end,
                    "segments": [{"startSeconds": start+s.start, "endSeconds": start+s.end,
                                  "text": s.text, "averageLogProbability": s.avg_logprob}
                                 for s in segments]}
        key.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2)+"\n")
    record["beats"].append(reviewed)
    print(f"Independent Arabic ASR: {recording['scene']}/{recording['beat']}", flush=True)
    (output / "audio-review.json").write_text(json.dumps(record, ensure_ascii=False, indent=2)+"\n")

words = [w for scene in timeline["scenes"] for beat in scene["beats"] for w in beat["words"]]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
required = json.loads(Path("src/data/pronunciation.ar.json").read_text())["requiredTermReview"]
spellings = {"ATP depletion": "A T P depletion", "Na+/K+ ATPase": "sodium potassium A T P ace"}
clips, clip_records, offset = [], [], 0.0
for term in required:
    expected = spellings.get(term, term)
    target = norm(expected)
    found = None
    for first, word in enumerate(words):
        if word.get("voice") != recordings["englishVoice"]:
            continue
        phrase = ""
        for last in range(first, min(first+12, len(words))):
            if words[last].get("voice") != recordings["englishVoice"]:
                break
            phrase += norm(words[last]["text"])
            if phrase == target:
                found = first, last
                break
            if not target.startswith(phrase):
                break
        if found:
            break
    if not found:
        raise ValueError(f"Native English term is absent from actual recording: {term}")
    first, last = found
    start = max(0, words[first]["startSeconds"]-.035)
    end = words[last]["startSeconds"]+words[last]["durationSeconds"]+.035
    clip = samples[round(start*16000):round(end*16000)]
    clips.extend([clip, np.zeros(4800, dtype=np.float32)])
    clip_records.append({"term": term, "spokenForm": expected, "sourceStartSeconds": start,
                         "sourceEndSeconds": end, "batchStartSeconds": offset,
                         "batchEndSeconds": offset+len(clip)/16000})
    offset += len(clip)/16000+.3
segments, _ = model.transcribe(np.concatenate(clips), language="en", beam_size=5,
                               word_timestamps=True, condition_on_previous_text=False)
transcribed = [{"startSeconds": s.start, "endSeconds": s.end, "text": s.text,
                "words": [{"text": w.word, "startSeconds": w.start, "endSeconds": w.end,
                           "probability": w.probability} for w in s.words]} for s in segments]
record["criticalTerms"] = clip_records
record["nativeEnglishRecognition"] = transcribed
print("Native English recognition:", " ".join(s["text"] for s in transcribed), flush=True)

active = pcm.astype(np.float64)/32768
window = 480
energy = np.sqrt(np.mean(active[:len(active)//window*window].reshape(-1, window)**2, axis=1))
silent = energy < 10**(-50/20)
runs = np.diff(np.concatenate(([False], silent, [False])).astype(int))
silences = [(int(a)*.02, int(b-a)*.02) for a, b in zip(np.flatnonzero(runs==1), np.flatnonzero(runs==-1))]
record["waveform"] = {"sampleCount": len(pcm), "durationSeconds": len(pcm)/rate,
                       "peakDbFS": float(20*np.log10(max(np.max(np.abs(active)), 1e-12))),
                       "clippedSamples": int(np.sum(np.abs(pcm.astype(np.int32))>=32767)),
                       "silencesLongerThan1Second": [{"startSeconds": a, "durationSeconds": b}
                                                     for a,b in silences if b>1],
                       "longestSilenceSeconds": max(b for a,b in silences)}
if record["waveform"]["clippedSamples"]:
    raise ValueError("Actual narration clips")
record["status"] = "automated-review-complete; human listening not claimed"
(output / "audio-review.json").write_text(json.dumps(record, ensure_ascii=False, indent=2)+"\n")
(output / "recognized-arabic.txt").write_text("\n\n".join(
    b["beat"]+"\n"+" ".join(s["text"] for s in b["segments"]) for b in record["beats"])+"\n")
print(json.dumps({k:v for k,v in record["waveform"].items() if k!='silencesLongerThan1Second'}, indent=2), flush=True)
