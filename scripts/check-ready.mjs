import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const lessonBytes = readFileSync('src/data/lesson.json');
const lesson = JSON.parse(lessonBytes);
const timeline = JSON.parse(readFileSync('src/data/timeline.json', 'utf8'));
if (!timeline) throw new Error('Real narration has not been generated.');
if (timeline.lessonSha256 !== hash(lessonBytes)) throw new Error('Narration must be regenerated for the current script.');
if (timeline.lectureSha256 !== lesson.source.sha256) throw new Error('Audio was generated for a different lecture.');
const audio = `public/${timeline.audioPath}`;
if (!existsSync(audio) || hash(readFileSync(audio)) !== timeline.audioSha256) throw new Error('Narration WAV missing or modified.');
if (timeline.fps !== 30 || timeline.durationInFrames !== Math.ceil(timeline.sampleCount * 30 / timeline.sampleRate)) throw new Error('Timeline does not match real audio samples.');
if (timeline.scenes.length !== lesson.scenes.length) throw new Error('Scene count differs between script and audio.');
let cursor = 0;
for (let i = 0; i < timeline.scenes.length; i++) {
  const scene = timeline.scenes[i];
  if (scene.id !== lesson.scenes[i].id || scene.startFrame !== cursor) throw new Error(`Scene timeline mismatch: ${scene.id}`);
  if (scene.beats.length !== lesson.scenes[i].beats.length) throw new Error(`Missing narration beats: ${scene.id}`);
  for (const beat of scene.beats) {
    if (beat.cueFrame < scene.startFrame || beat.cueFrame >= scene.startFrame + scene.durationInFrames) throw new Error(`Cue outside scene: ${beat.id}`);
  }
  cursor += scene.durationInFrames;
}
if (cursor !== timeline.durationInFrames) throw new Error('Scene durations do not cover audio.');
console.log(`Real audio timeline verified: ${timeline.durationSeconds.toFixed(3)}s / ${timeline.durationInFrames} frames.`);
