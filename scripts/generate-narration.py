"""Real speech timeline, measured from decoded PCM and actual word boundaries."""
import asyncio
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import wave
import edge_tts
import edge_tts.communicate as speech_transport

# Keep certificate verification enabled, including the managed proxy's system CA.
speech_transport._SSL_CTX.load_default_certs()

ROOT = Path(__file__).resolve().parents[1]
RATE, FPS = 24000, 30
VOICE = os.environ.get("NARRATOR_VOICE", "en-US-AriaNeural")
SPEED = os.environ.get("NARRATOR_RATE", "-5%")
SEGMENTS = ROOT / "public/audio/segments"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def frame(samples):
    return round(samples * FPS / RATE)


def normalize(text):
    return re.sub(r"[^a-z0-9]+", "", text.lower())


async def synthesize(beat):
    key = sha(json.dumps([VOICE, SPEED, beat["text"]]).encode())[:24]
    mp3, wav, meta = [SEGMENTS / f"{key}.{ext}" for ext in ("mp3", "wav", "json")]
    if not (mp3.exists() and meta.exists()):
        words = []
        voice = edge_tts.Communicate(beat["text"], VOICE, rate=SPEED, boundary="WordBoundary",
                                    proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"))
        with mp3.open("wb") as handle:
            async for chunk in voice.stream():
                if chunk["type"] == "audio":
                    handle.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    words.append({"text": chunk["text"], "startSeconds": chunk["offset"] / 1e7,
                                  "durationSeconds": chunk["duration"] / 1e7})
        if not mp3.stat().st_size or not words:
            raise RuntimeError("Speech service returned no audio or word boundaries")
        meta.write_text(json.dumps(words, indent=2))
    if not wav.exists():
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp3),
                        "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", str(RATE), "-ac", "1",
                        "-c:a", "pcm_s16le", str(wav)], check=True)
    with wave.open(str(wav), "rb") as handle:
        if (handle.getframerate(), handle.getnchannels(), handle.getsampwidth()) != (RATE, 1, 2):
            raise RuntimeError("Unexpected decoded audio format")
        pcm = handle.readframes(handle.getnframes())
    return pcm, json.loads(meta.read_text())


async def main():
    subprocess.run(["node", "scripts/check-source.mjs"], cwd=ROOT, check=True)
    lesson_bytes = (ROOT / "src/data/lesson.json").read_bytes()
    lesson = json.loads(lesson_bytes)
    SEGMENTS.mkdir(parents=True, exist_ok=True)
    all_pcm, scenes, used_ids = bytearray(), [], set()

    def position():
        return len(all_pcm) // 2

    def silence(seconds):
        all_pcm.extend(b"\x00\x00" * round(seconds * RATE))

    for scene in lesson["scenes"]:
        start = position()
        silence(0.35)
        beats = []
        for index, beat in enumerate(scene["beats"]):
            if beat["id"] in used_ids:
                raise ValueError(f"Duplicate narration beat ID: {beat['id']}")
            used_ids.add(beat["id"])
            pcm, words = await synthesize(beat)
            speech_start, count = position(), len(pcm) // 2
            if any(w["startSeconds"] > count / RATE + 0.05 for w in words):
                raise ValueError(f"Word boundary exceeds audio: {beat['id']}")
            anchor = normalize(beat.get("anchor", words[0]["text"]))
            matches = [w for w in words if normalize(w["text"]) == anchor]
            if not matches:
                raise ValueError(f"Speech anchor not found: {beat['id']} / {beat.get('anchor')}")
            cue = speech_start + round(matches[0]["startSeconds"] * RATE)
            all_pcm.extend(pcm)
            speech_end = position()
            silence(beat.get("holdAfterSeconds", 0.12 if index < len(scene["beats"]) - 1 else 0.65))
            beats.append({"id": beat["id"], "startFrame": frame(speech_start),
                          "speechStartFrame": frame(speech_start + round(words[0]["startSeconds"] * RATE)),
                          "cueFrame": frame(cue), "speechEndFrame": frame(speech_end),
                          "endFrame": frame(position()),
                          "words": [{**w, "startSeconds": speech_start / RATE + w["startSeconds"]} for w in words]})
            print(f"{scene['id']} / {beat['id']}: {count / RATE:.3f}s measured", flush=True)
        scenes.append({"id": scene["id"], "startFrame": frame(start),
                       "durationInFrames": frame(position()) - frame(start), "beats": beats})

    count = position()
    duration_frames = math.ceil(count * FPS / RATE)
    scenes[-1]["durationInFrames"] = duration_frames - scenes[-1]["startFrame"]
    output = ROOT / "public/audio/narration.wav"
    with wave.open(str(output), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(all_pcm)
    timeline = {"lessonSha256": sha(lesson_bytes), "lectureSha256": lesson["source"]["sha256"],
                "audioPath": "audio/narration.wav", "audioSha256": sha(output.read_bytes()),
                "sampleRate": RATE, "sampleCount": count, "fps": FPS,
                "durationInFrames": duration_frames, "durationSeconds": count / RATE,
                "source": f"Edge TTS / {VOICE} / {SPEED}; decoded PCM and real word boundaries", "scenes": scenes}
    for path in (ROOT / "src/data/timeline.json", ROOT / "public/audio/timing.json"):
        path.write_text(json.dumps(timeline, indent=2) + "\n")
    print(f"Narration: {count / RATE:.3f}s / {duration_frames} frames")


if __name__ == "__main__":
    asyncio.run(main())
