# Cell Injury medical motion video

Permanent repository: **hashmfayz341-source/Introduction-**. React, TypeScript,
Remotion and SVG provide deterministic 1920×1080, 30 fps medical animation.

**Current status: render/audio infrastructure only. The original lecture
attachment is unavailable in this environment. No complete lesson, final
narration, medical review, or final MP4 is claimed.**

The original README contained only the repository title. It was inspected before
editing; its original commit remains in history.

## Installation and preview

Requirements: Node 22+, Python 3.10+, FFmpeg/FFprobe and a Chromium-compatible
browser.

```sh
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
npm run browser
npm run preview
```

`npm run doctor` reports readiness. For an existing browser, set
`REMOTION_BROWSER_EXECUTABLE` to its absolute path instead of downloading one.
No API keys are embedded in this project.

## Lecture and real audio

Place the complete PDF at `public/source/cell-injury-lecture.pdf`. After reading
every page, record the PDF SHA-256, page count, reviewed pages, source coverage,
scene objectives, visual design and narration beats in `src/data/lesson.json`.
Lecture statements, established medical clarifications and visual simplifications
have separate provenance labels.

`npm run check:source` blocks final rendering and audio generation until complete
lecture review is recorded. With the Python environment activated, `npm run audio`
generates actual Edge TTS speech (`en-US-AriaNeural`, rate `-5%`). Generation
requires a network connection. The voice/rate can be selected with
`NARRATOR_VOICE` and `NARRATOR_RATE`.

Decoded PCM sample counts determine scene durations; actual spoken-word boundaries
determine animation cues. The master audio is `public/audio/narration.wav`. Its
measured timeline is stored in `src/data/timeline.json` and
`public/audio/timing.json`. SHA-256 checks block stale narration after a script,
lecture or audio change. Intermediate speech segments are excluded from Git.

## Rendering

The intended main composition is `CellInjury`; it will be registered after lecture
review and complete scene implementation. Final output is `out/cell-injury.mp4`.
The reproducible final command is:

```sh
npm run render
```

This command deliberately fails while the source and narrated lesson are missing.
`PipelineCheck` is a development diagnostic, not an educational video:

```sh
npm run typecheck
npm run render:pipeline
npm run qa:pipeline
```

Final source, lecture, approved narration, measured audio and review records belong
in the repository. Deliver the final MP4 as a GitHub release asset. `node_modules/`,
`out/`, environments, caches and temporary QA frames are ignored.

## Layout

- `src/anatomy/`: consistent reusable biological entities.
- `src/animations/`: real-speech-cued deterministic motion.
- `src/compositions/`: master audio composition and development diagnostics.
- `src/data/`: lecture coverage, narration beats and measured timing.
- `public/source/`, `public/audio/`: reviewed lecture and real reusable audio.
- `scripts/`: source validation, narration generation and audio integrity checks.
- `docs/qa.md`: verification evidence and remaining work.
