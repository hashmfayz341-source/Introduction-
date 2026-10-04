# Arabic narration upgrade

The existing 18-scene lesson is being upgraded with spoken Arabic narration.
No scene designs, anatomy, labels or transitions have been replaced.

## English backup

The complete English version remains available at the immutable source tag
`cell-injury-v1`, commit `8777ef17494e38a86dd4fb6e4a60f8eb5b7230c6`, and its
[published MP4](https://github.com/hashmfayz341-source/Introduction-/releases/download/cell-injury-v1/cell-injury.mp4).
The current local English MP4 is `out/cell-injury.mp4`, SHA-256
`37ded821224caf1a059ed7a53170cdaa9a61487c12e952632dd95704cd669d6b`.
The English script, audio and measured timeline remain unchanged.

## Arabic script review

`src/data/lesson.ar.json` and `docs/narration-ar.md` contain 72 rewritten narration
beats across the same 18 scenes, preserving all 28 source-page mappings.
The delivery uses clear Arabic with restrained Saudi-friendly spoken phrasing,
and English medical vocabulary explained when first introduced.

Review against the source and approved English lesson confirms:

- All eight injury-cause categories and six interacting mechanisms remain present.
- Permanent cells' limited division is distinguished from size changes.
- Reversible membrane changes preserve viability; severe irreversible injury
  cannot be rescued simply by removing the original cause.
- Hypoxia and ischemia remain distinct. Na/K pumping is separate from calcium entry.
- ATP loss branches through swelling, glycolysis/acidosis and reduced protein synthesis.
- Calcium activates the correct four enzyme classes and mitochondrial/caspase pathways.
- Inner mitochondrial gradient failure is distinct from outer cytochrome-c release.
- Nonradical hydrogen peroxide, the three ROS target classes and sequential peroxide
  detoxification retain the corrections made during the English medical review.
- Lysosomal enzymes move into cytoplasm after membrane injury, and apoptotic
  fragments remain contained during formation and clearance.
- The nonspecific source example “Mediterranean disease” is preserved without
  assigning it an invented diagnosis.

There are 75 named mechanism cue spans, including all 64 literal event calls and
11 dynamically selected events. These are actual words or phrases in the Arabic
script. Their eventual timing must be measured from the real recording; no audio
duration or fabricated word timestamps have been added.

Validate this preparation with `node scripts/check-arabic-script.mjs`.

## Recording and pronunciation status

OpenAI `gpt-4o-mini-tts`, voice `cedar`, is proposed following authorization to
create a secure API key. The Platform connection currently rejects account/project
target access, so recording is pending authentication setup. This document does
not claim that Arabic speech, alignment, rendering or pronunciation QA has passed.

`src/data/pronunciation.ar.json` records the proposed tone instructions, English
acronym controls and eleven required term checks. Pronunciation fixes will be
recorded only after listening to and checking the actual generated speech.
The Arabic MP4 will use a separate filename so the English backup is preserved.
