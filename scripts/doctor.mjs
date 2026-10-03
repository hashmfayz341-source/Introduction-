import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';

for (const [command, args] of [['node',['--version']], ['ffmpeg',['-version']], ['ffprobe',['-version']], ['python3',['--version']]]) {
  const result = spawnSync(command, args, {encoding:'utf8'});
  console.log(`${command}: ${result.status === 0 ? (result.stdout || result.stderr).split('\n')[0] : 'NOT AVAILABLE'}`);
}
const lesson = JSON.parse(readFileSync('src/data/lesson.json', 'utf8'));
console.log(`Lecture: ${existsSync(lesson.source.path) ? 'present' : 'MISSING'}`);
console.log(`Complete source review: ${lesson.source.completeReview ? 'recorded' : 'PENDING'}`);
console.log(`Scene count: ${lesson.scenes.length}`);
console.log(`Narration WAV: ${existsSync('public/audio/narration.wav') ? 'present' : 'MISSING'}`);
console.log(`Final MP4: ${existsSync('out/cell-injury.mp4') ? 'present' : 'NOT RENDERED'}`);
