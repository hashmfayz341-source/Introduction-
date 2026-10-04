"""Arabic recording and semantic cues, measured from real speech/decoded PCM.

English assets are never overwritten. No text-length timing or invented words.
Use the Microsoft voices only when the preferred provider is unavailable.
"""
import asyncio
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import unicodedata
import wave

import numpy as np

import edge_tts
import edge_tts.communicate as transport

transport._SSL_CTX.load_default_certs()  # Verified TLS, including managed proxy CA.
ROOT = Path(__file__).resolve().parents[1]
RATE, FPS = 24000, 30
CACHE = ROOT / "public/audio/segments/ar"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def normalized(text):
    return "".join(c.lower() for c in unicodedata.normalize("NFKC", text)
                   if c != "ـ" and unicodedata.category(c)[0] in "LN")


def spoken_form(text, controls):
    # Match complete Latin terms, including when adjacent to an Arabic article.
    for original, replacement in sorted(controls.items(), key=lambda p: -len(p[0])):
        text = re.sub(r"(?<![A-Za-z])" + re.escape(original) + r"(?![A-Za-z])",
                      lambda _: replacement, text)
    # Separate mixed-script clitics for explicit, independently timed boundaries.
    return re.sub(r"([\u0621-\u064A\u0640])([A-Za-z])", r"\1 \2", text)


def match_span(text, span, words, controls):
    """Locate an actual source phrase in the service's actual word boundaries."""
    spoken = spoken_form(text, controls)
    source = normalized(spoken)
    joined = "".join(normalized(w["text"]) for w in words)
    if joined != source:
        first = next((i for i, (a, b) in enumerate(zip(source, joined)) if a != b),
                     min(len(source), len(joined)))
        raise ValueError(f"Service word sequence differs from input near {first}: "
                         f"{source[max(0, first-20):first+40]!r} / "
                         f"{joined[max(0, first-20):first+40]!r}")
    needle = normalized(spoken_form(span, controls))
    source_index = text.index(span)
    expected = len(normalized(spoken_form(text[:source_index], controls)))
    # Expected occurrence retains the script's intended phrase, including repeats.
    position = expected if source[expected:expected+len(needle)] == needle else source.find(needle)
    if position < 0:
        raise ValueError(f"Spoken phrase missing: {span}")
    cursor, start, end = 0, None, None
    for word in words:
        width = len(normalized(word["text"]))
        if cursor + width > position and cursor < position + len(needle):
            if start is None:
                start = word["startSeconds"]
            end = word["startSeconds"] + word["durationSeconds"]
        cursor += width
    if start is None or end is None:
        raise ValueError(f"No real word boundaries cover: {span}")
    return {"sourceSpan": span, "spokenForm": spoken_form(span, controls),
            "startSeconds": start, "endSeconds": end,
            "alignment": "measured-service-word-boundaries"}


async def raw_speech(text, voice, speed):
    key = digest(json.dumps([voice, speed, text], ensure_ascii=False).encode())[:24]
    mp3, wav, metadata = [CACHE / f"{key}.{ext}" for ext in ("mp3", "wav", "json")]
    if not (mp3.exists() and metadata.exists()):
        chunks = []
        words = []
        request = edge_tts.Communicate(text, voice, rate=speed, boundary="WordBoundary",
                                      proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"))
        async for chunk in request.stream():
            if chunk["type"] == "audio":
                chunks.append(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"text": chunk["text"], "startSeconds": chunk["offset"] / 1e7,
                              "durationSeconds": chunk["duration"] / 1e7})
        if not chunks or not words:
            raise RuntimeError("Speech provider returned no audio or real boundaries")
        mp3.write_bytes(b"".join(chunks))
        metadata.write_text(json.dumps(words, ensure_ascii=False, indent=2) + "\n")
    if not wav.exists():
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp3),
                        "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", str(wav)], check=True)
    with wave.open(str(wav), "rb") as handle:
        if (handle.getframerate(), handle.getnchannels(), handle.getsampwidth()) != (RATE, 1, 2):
            raise RuntimeError("Unexpected decoded audio format")
        pcm = handle.readframes(handle.getnframes())
    return pcm, json.loads(metadata.read_text()), {"cacheKey": key, "spokenText": text}


def soften_join(pcm):
    """5 ms amplitude ramps only; no overlap, time shift or stretched speech."""
    values = np.frombuffer(pcm, dtype="<i2").astype(np.float64)
    n = min(round(.005 * RATE), len(values) // 2)
    if n:
        values[:n] *= np.linspace(0, 1, n)
        values[-n:] *= np.linspace(1, 0, n)
    return np.rint(values).astype("<i2").tobytes()


async def synthesize(beat, config):
    """Retain fluent Saudi Arabic; replace Latin runs with native English speech.

    All new word times come from their own recordings and sample-accurate joins.
    Removed boundary gaps and trims never remove a reported word interval.
    """
    text = spoken_form(beat["text"], config["lexicalControls"])
    base, source_words, provenance = await raw_speech(text, config["voice"], config["rate"])
    source = normalized(text)
    if "".join(normalized(w["text"]) for w in source_words) != source:
        raise ValueError(f"Cannot align the actual Arabic service words: {beat['id']}")
    positions, cursor = [], 0
    for word in source_words:
        width = len(normalized(word["text"]))
        positions.append((cursor, cursor + width))
        cursor += width
    groups = []
    for match in re.finditer(r"[A-Za-z][A-Za-z0-9+/\-]*(?:\s+[A-Za-z][A-Za-z0-9+/\-]*)*", text):
        start = len(normalized(text[:match.start()]))
        end = start + len(normalized(match.group()))
        indexes = [i for i, (a, b) in enumerate(positions) if b > start and a < end]
        if not indexes or positions[indexes[0]][0] != start or positions[indexes[-1]][1] != end:
            raise ValueError(f"Mixed word crosses the language splice: {match.group()}")
        groups.append((indexes[0], indexes[-1], match.group()))

    assembled, words, term_records = bytearray(), [], []
    source_sample, source_word_index = 0, 0
    for first, last, phrase in groups:
        first_word, last_word = source_words[first], source_words[last]
        previous_end = (source_words[first-1]["startSeconds"] + source_words[first-1]["durationSeconds"]
                        if first else 0)
        next_start = source_words[last+1]["startSeconds"] if last+1 < len(source_words) else len(base)/2/RATE
        cut_start = round(max(previous_end, first_word["startSeconds"] - .04) * RATE)
        cut_end = round(min(next_start, last_word["startSeconds"] + last_word["durationSeconds"] + .04) * RATE)
        # Limit unnatural pauses at a language boundary to 100 ms on each side.
        if first_word["startSeconds"] - previous_end > .25:
            cut_start = round((previous_end + .10) * RATE)
        if next_start - last_word["startSeconds"] - last_word["durationSeconds"] > .25:
            cut_end = round((next_start - .10) * RATE)
        retained_offset = len(assembled)/2/RATE - source_sample/RATE
        assembled.extend(soften_join(base[source_sample*2:cut_start*2]))
        words.extend({**w, "startSeconds": w["startSeconds"] + retained_offset,
                      "voice": config["voice"]} for w in source_words[source_word_index:first])

        english, english_words, english_provenance = await raw_speech(
            phrase + ".", config["englishVoice"], config["englishRate"])
        if "".join(normalized(w["text"]) for w in english_words) != normalized(phrase):
            raise ValueError(f"English recording does not match phrase: {phrase}")
        values = np.frombuffer(english, dtype="<i2")
        active = np.flatnonzero(np.abs(values.astype(np.int32)) > 40)
        if not len(active):
            raise ValueError(f"English recording is silent: {phrase}")
        trim_start = max(0, min(int(active[0]) - round(.025*RATE),
                                round((english_words[0]["startSeconds"]-.025)*RATE)))
        last_end = english_words[-1]["startSeconds"] + english_words[-1]["durationSeconds"]
        trim_end = min(len(values), max(int(active[-1]) + round(.045*RATE), round((last_end+.025)*RATE)))
        insertion_sample = len(assembled)//2
        english_offset = insertion_sample/RATE - trim_start/RATE
        clip = values[trim_start:trim_end].astype(np.float64)
        reference = np.frombuffer(base[round(first_word["startSeconds"]*RATE)*2:
                                       round((last_word["startSeconds"]+last_word["durationSeconds"])*RATE)*2], dtype="<i2").astype(np.float64)
        rms = lambda x: float(np.sqrt(np.mean(x*x))) if len(x) else 0
        gain = min(1.2, max(.85, rms(reference)/max(1, rms(clip))))
        english_pcm = np.rint(np.clip(clip*gain, -32767, 32767)).astype("<i2").tobytes()
        assembled.extend(soften_join(english_pcm))
        words.extend({**w, "startSeconds": w["startSeconds"] + english_offset,
                      "voice": config["englishVoice"]} for w in english_words)
        term_records.append({"phrase": phrase, **english_provenance, "voice": config["englishVoice"],
                             "startSample": insertion_sample, "sampleCount": len(english_pcm)//2,
                             "trimStartSample": trim_start, "trimEndSample": trim_end,
                             "gain": round(gain, 6), "joinFadeMilliseconds": 5})
        source_sample, source_word_index = cut_end, last+1
    retained_offset = len(assembled)/2/RATE - source_sample/RATE
    assembled.extend(soften_join(base[source_sample*2:]))
    words.extend({**w, "startSeconds": w["startSeconds"] + retained_offset,
                  "voice": config["voice"]} for w in source_words[source_word_index:])
    # Remove service-added utterance padding, keeping all real word intervals and
    # acoustic guards. Internal sentence pauses and speech rate remain untouched.
    values=np.frombuffer(assembled,dtype="<i2")
    active=np.flatnonzero(np.abs(values.astype(np.int32))>40)
    if not len(active):
        raise ValueError(f"Assembled narration is silent: {beat['id']}")
    trim_start=max(0,min(int(active[0])-round(.025*RATE),
                         round((words[0]['startSeconds']-.025)*RATE)))
    last_end=words[-1]['startSeconds']+words[-1]['durationSeconds']
    trim_end=min(len(values),max(int(active[-1])+round(.065*RATE),round((last_end+.04)*RATE)))
    for word in words:
        word['startSeconds']-=trim_start/RATE
    for term in term_records:
        old_start=term['startSample']
        old_end=old_start+term['sampleCount']
        removed_head=max(0,trim_start-old_start)
        removed_tail=max(0,old_end-trim_end)
        term['startSample']=max(0,old_start-trim_start)
        term['sampleCount']-=removed_head+removed_tail
        term['trimStartSample']+=removed_head
        term['trimEndSample']-=removed_tail
    assembled=assembled[trim_start*2:trim_end*2]
    provenance['beatTrimStartSample']=trim_start
    provenance['beatTrimEndSample']=trim_end
    if any(a["startSeconds"] > b["startSeconds"] for a, b in zip(words, words[1:])):
        raise ValueError(f"Edited real words are not monotonic: {beat['id']}")
    provenance["englishTerms"] = term_records
    return bytes(assembled), words, provenance


async def main():
    subprocess.run(["node", "scripts/check-arabic-script.mjs"], cwd=ROOT, check=True)
    lesson_bytes = (ROOT / "src/data/lesson.ar.json").read_bytes()
    lesson = json.loads(lesson_bytes)
    config = json.loads((ROOT / "src/data/pronunciation.ar.json").read_bytes())
    if config["provider"] != "Microsoft Edge neural speech":
        raise ValueError("Recording configuration must name the actual available provider")
    CACHE.mkdir(parents=True, exist_ok=True)
    pcm, scenes, recordings = bytearray(), [], []

    def position():
        return len(pcm) // 2

    def frame(samples):
        return round(samples * FPS / RATE)

    def silence(seconds):
        pcm.extend(b"\x00\x00" * round(seconds * RATE))

    for scene in lesson["scenes"]:
        start = position()
        silence(0.24)  # Brief entrance; the voice supplies natural internal pauses.
        beats = []
        for index, beat in enumerate(scene["beats"]):
            recording, words, provenance = await synthesize(beat, config)
            duration = len(recording) / 2 / RATE
            if any(w["startSeconds"] + w["durationSeconds"] > duration + .04 for w in words):
                raise ValueError(f"Word boundary outside decoded recording: {beat['id']}")
            start_sample = position()
            offset = start_sample / RATE
            main_cue = match_span(beat["text"], beat["anchor"], words, config["lexicalControls"])
            cues = {}
            for key, span in beat["cueSpans"].items():
                cue = match_span(beat["text"], span, words, config["lexicalControls"])
                cue["startSeconds"] += offset
                cue["endSeconds"] += offset
                cue["frame"] = round(cue["startSeconds"] * FPS)
                cues[key] = cue
            pcm.extend(recording)
            speech_end = position()
            silence(.10 if index < len(scene["beats"]) - 1 else .42)
            beats.append({"id": beat["id"], "startFrame": frame(start_sample),
                          "speechStartFrame": frame(start_sample + round(words[0]["startSeconds"] * RATE)),
                          "cueFrame": round((offset + main_cue["startSeconds"]) * FPS),
                          "speechEndFrame": frame(speech_end), "endFrame": frame(position()),
                          "anchorSpan": main_cue["sourceSpan"], "cues": cues,
                          "words": [{**w, "startSeconds": offset + w["startSeconds"]} for w in words]})
            recordings.append({"scene": scene["id"], "beat": beat["id"], **provenance,
                               "startSample": start_sample, "sampleCount": len(recording) // 2,
                               "durationSeconds": duration, "wordCount": len(words)})
            print(f"{scene['id']} / {beat['id']}: {duration:.3f}s / {len(cues)} real event cues", flush=True)
        scenes.append({"id": scene["id"], "startFrame": frame(start),
                       "durationInFrames": frame(position()) - frame(start), "beats": beats})

    count = position()
    duration_frames = math.ceil(count * FPS / RATE)
    scenes[-1]["durationInFrames"] = duration_frames - scenes[-1]["startFrame"]
    # One consistent loudness pass on the full narration, preserving sample timing.
    raw = ROOT / "qa/temp/narration-ar-raw.wav"
    raw.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(raw), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(pcm)
    output = ROOT / "public/audio/narration-ar.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw),
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", str(RATE), "-ac", "1",
                    "-c:a", "pcm_s16le", str(output)], check=True)
    with wave.open(str(output), "rb") as handle:
        if handle.getnframes() != count:
            raise ValueError("Loudness processing changed the measured master sample count")
    timeline = {"language": "ar", "lessonSha256": digest(lesson_bytes),
                "lectureSha256": lesson["source"]["sha256"], "audioPath": "audio/narration-ar.wav",
                "audioSha256": digest(output.read_bytes()), "sampleRate": RATE, "sampleCount": count,
                "fps": FPS, "durationInFrames": duration_frames, "durationSeconds": count / RATE,
                "source": f"Microsoft Edge neural speech / {config['voice']} (Arabic {config['rate']}) + {config['englishVoice']} (English terms {config['englishRate']}); sample-accurate bilingual joins and real service word boundaries",
                "scenes": scenes}
    for path in (ROOT / "src/data/timeline.ar.json", ROOT / "public/audio/timing.ar.json"):
        path.write_text(json.dumps(timeline, ensure_ascii=False, indent=2) + "\n")
    (ROOT / "public/audio/recordings.ar.json").write_text(json.dumps({
        "provider": config["provider"], "voice": config["voice"], "rate": config["rate"],
        "englishVoice": config["englishVoice"], "englishRate": config["englishRate"],
        "lexicalControls": config["lexicalControls"], "sampleRate": RATE,
        "recordings": recordings}, ensure_ascii=False, indent=2) + "\n")
    print(f"Arabic master: {count / RATE:.3f}s / {duration_frames} frames; English untouched")


if __name__ == "__main__":
    asyncio.run(main())
