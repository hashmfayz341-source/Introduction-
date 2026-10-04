import fs from 'node:fs';
import {createHash} from 'node:crypto';

const hash=(bytes)=>createHash('sha256').update(bytes).digest('hex');
const bytes=fs.readFileSync('src/data/lesson.ar.json');
const lesson=JSON.parse(bytes);
const timeline=JSON.parse(fs.readFileSync('src/data/timeline.ar.json'));
const mirrored=fs.readFileSync('public/audio/timing.ar.json');
if(hash(mirrored)!==hash(fs.readFileSync('src/data/timeline.ar.json')))throw new Error('Public timing differs from the source timeline');
if(timeline.lessonSha256!==hash(bytes)||timeline.lectureSha256!==lesson.source.sha256)throw new Error('Narration source fingerprint changed');
const audio=fs.readFileSync(`public/${timeline.audioPath}`);
if(hash(audio)!==timeline.audioSha256)throw new Error('Arabic master is missing or modified');
let dataBytes,format;
for(let p=12;p+8<=audio.length;){
  const tag=audio.toString('ascii',p,p+4),size=audio.readUInt32LE(p+4);
  if(tag==='fmt ')format={code:audio.readUInt16LE(p+8),channels:audio.readUInt16LE(p+10),rate:audio.readUInt32LE(p+12),bits:audio.readUInt16LE(p+22)};
  if(tag==='data')dataBytes=size;
  p+=8+size+(size%2);
}
if(format?.code!==1||format.channels!==1||format.rate!==timeline.sampleRate||format.bits!==16||dataBytes/2!==timeline.sampleCount)throw new Error('Actual PCM samples disagree with timing');
if(timeline.fps!==30||timeline.durationInFrames!==Math.ceil(timeline.sampleCount*30/timeline.sampleRate))throw new Error('Frame count does not follow the real master');
if(timeline.scenes.length!==18)throw new Error('Missing existing scene');
let cursor=0,events=0,words=0,previous=-1;
for(const [index,scene]of timeline.scenes.entries()){
  const source=lesson.scenes[index];
  if(scene.id!==source.id||scene.startFrame!==cursor||scene.beats.length!==source.beats.length)throw new Error(`Scene continuity error: ${scene.id}`);
  for(const [position,beat]of scene.beats.entries()){
    const script=source.beats[position];
    if(beat.id!==script.id||beat.cueFrame<beat.startFrame||beat.cueFrame>=beat.speechEndFrame)throw new Error(`Invalid primary cue: ${beat.id}`);
    if(JSON.stringify(Object.keys(beat.cues).sort())!==JSON.stringify(Object.keys(script.cueSpans).sort()))throw new Error(`Named events omitted: ${beat.id}`);
    for(const word of beat.words){
      if(word.startSeconds<previous||word.startSeconds+word.durationSeconds>timeline.durationSeconds+.03)throw new Error(`Nonmonotonic or out-of-range real word: ${beat.id}`);
      previous=word.startSeconds;words++;
    }
    for(const [key,cue]of Object.entries(beat.cues)){
      if(cue.sourceSpan!==script.cueSpans[key]||cue.alignment!=='measured-service-word-boundaries'||cue.frame!==Math.round(cue.startSeconds*30))throw new Error(`Unmeasured semantic cue: ${beat.id}/${key}`);
      if(cue.frame<beat.startFrame||cue.frame>=beat.speechEndFrame||cue.endSeconds<cue.startSeconds)throw new Error(`Event outside speech: ${beat.id}/${key}`);
      if(!beat.words.some(w=>Math.abs(w.startSeconds-cue.startSeconds)<1e-7))throw new Error(`Event is not at a recorded boundary: ${beat.id}/${key}`);
      events++;
    }
  }
  cursor+=scene.durationInFrames;
}
if(cursor!==timeline.durationInFrames||events!==75)throw new Error('The complete timeline or 75 mechanism events are missing');
console.log(`Arabic real audio verified: ${timeline.durationSeconds.toFixed(3)}s, ${cursor} frames, 18 scenes, 72 beats, ${events} measured events, ${words} actual spoken words.`);
