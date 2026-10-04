import fs from 'node:fs';
import {createHash} from 'node:crypto';

const read = (name) => JSON.parse(fs.readFileSync(name, 'utf8'));
const english = read('src/data/lesson.json');
const arabic = read('src/data/lesson.ar.json');
const lexicon = read('src/data/pronunciation.ar.json');
const error = (message) => {throw new Error(message);};
if (arabic.language !== 'ar-SA') error('Missing Arabic language declaration.');
if (arabic.scenes.length !== 18) error('Existing 18 scenes must be preserved.');
const digest = createHash('sha256').update(fs.readFileSync(arabic.source.path)).digest('hex');
if (digest !== arabic.source.sha256 || digest !== english.source.sha256) error('Lecture fingerprint changed.');
const beats = new Map();
let events = 0;
for (const [index, scene] of arabic.scenes.entries()) {
  const previous = english.scenes[index];
  if (scene.id !== previous.id || scene.visual !== previous.visual) error(`Existing scene changed: ${scene.id}`);
  if (JSON.stringify(scene.sourcePages) !== JSON.stringify(previous.sourcePages)) error(`Source coverage changed: ${scene.id}`);
  if (scene.beats.length !== previous.beats.length) error(`Narration beat omitted: ${scene.id}`);
  for (const [position, beat] of scene.beats.entries()) {
    if (beat.id !== previous.beats[position].id || beats.has(beat.id)) error(`Beat identity changed: ${beat.id}`);
    if (!/[\u0600-\u06ff]/u.test(beat.text)) error(`Missing Arabic narration: ${beat.id}`);
    if (!beat.text.includes(beat.anchor)) error(`Unspoken primary anchor: ${beat.id}`);
    for (const [key, span] of Object.entries(beat.cueSpans)) {
      if (!span || !beat.text.includes(span)) error(`Unspoken semantic cue: ${beat.id}/${key}`);
      events++;
    }
    beats.set(beat.id, beat);
  }
}
for (const filename of fs.readdirSync('src/scenes').filter((name) => name.endsWith('.tsx'))) {
  const code = fs.readFileSync(`src/scenes/${filename}`, 'utf8');
  const patterns = [
    /word\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g,
    /atWord\(timed,\s*frame,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g,
  ];
  for (const pattern of patterns) for (const [, id, key] of code.matchAll(pattern)) {
    if (!beats.get(id)?.cueSpans[key.toLowerCase()]) error(`Missing existing animation event: ${id}/${key}`);
  }
}
const narration = [...beats.values()].map((beat) => beat.text).join('\n').toLowerCase();
for (const term of lexicon.requiredTermReview) if (!narration.includes(term.toLowerCase())) error(`Required English term omitted: ${term}`);
for (let page = 1; page <= 28; page++) if (!arabic.scenes.some((scene) => scene.sourcePages.includes(page))) error(`Source page omitted: ${page}`);
console.log(`Arabic script verified: 28 pages, ${arabic.scenes.length} existing scenes, ${beats.size} beats, ${events} real-script semantic event spans.`);
