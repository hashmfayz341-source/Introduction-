import {mkdir, readFile, statfs} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Long frame sequences can exceed a container's small /tmp mount. Use an
// ignored directory beside the output, and configure only the child process.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = path.resolve(root, process.env.CELL_INJURY_RENDER_TEMP_DIR ?? 'out/.remotion-tmp');
await mkdir(temp, {recursive: true});
const timeline = JSON.parse(await readFile(path.join(root, 'src/data/timeline.ar.json'), 'utf8'));
const disk = await statfs(temp);
const available = disk.bavail * disk.bsize;
const required = timeline.durationInFrames * 160_000 + 1_000_000_000;
if (available < required) {
  throw new Error(`Render temporary storage needs about ${(required / 2 ** 30).toFixed(1)} GiB; ` +
    `${(available / 2 ** 30).toFixed(1)} GiB is free. Set CELL_INJURY_RENDER_TEMP_DIR to a larger volume.`);
}
console.log(`Render temporary directory: ${temp} (${(available / 2 ** 30).toFixed(1)} GiB free)`);
const env = {...process.env, TMPDIR: temp};
if (process.platform === 'win32') {
  env.TEMP = temp;
  env.TMP = temp;
}
const child = spawn(process.execPath, [
  path.join(root, 'node_modules/@remotion/cli/remotion-cli.js'),
  'render', 'src/index.ts', 'CellInjuryArabic', 'out/cell-injury-ar.mp4',
  '--codec=h264', '--crf=18', '--pixel-format=yuv420p', ...process.argv.slice(2),
], {cwd: root, env, stdio: 'inherit'});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => {console.error(error); process.exitCode = 1;});
child.on('exit', (code, signal) => {process.exitCode = code ?? (signal ? 1 : 0);});
