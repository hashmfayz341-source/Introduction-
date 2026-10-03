import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root = process.cwd();
const lesson = JSON.parse(readFileSync(path.join(root, 'src/data/lesson.json'), 'utf8'));
const source = lesson.source;
const fail = (message) => {throw new Error(message);};
if (!existsSync(path.join(root, source.path))) fail(`Lecture PDF missing: ${source.path}. Supply the lecture before creating the lesson.`);
const sha = createHash('sha256').update(readFileSync(path.join(root, source.path))).digest('hex');
if (source.sha256 !== sha) fail('The reviewed source fingerprint does not match the lecture PDF.');
if (!source.completeReview || !Number.isInteger(source.pageCount) || source.pageCount < 1) fail('Complete lecture review has not been recorded.');
for (let page = 1; page <= source.pageCount; page++) {
  if (!source.reviewedPages.includes(page)) fail(`Source page ${page} has not been reviewed.`);
  if (!lesson.scenes.some((s) => s.sourcePages.includes(page))) fail(`Source page ${page} has no scene coverage.`);
}
if (!lesson.scenes.length) fail('No lecture-grounded scenes are defined.');
const ids = new Set();
for (const scene of lesson.scenes) {
  if (ids.has(scene.id)) fail(`Duplicate scene: ${scene.id}`);
  ids.add(scene.id);
  if (!scene.beats.length || scene.beats.some((b) => !b.text.trim())) fail(`Incomplete narration: ${scene.id}`);
}
console.log(`Complete source review verified: ${source.pageCount} pages; ${lesson.scenes.length} scenes.`);
