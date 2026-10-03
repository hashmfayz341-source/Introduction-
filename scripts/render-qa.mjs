import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';
const lesson=JSON.parse(await fs.readFile('src/data/lesson.json','utf8'));
const timeline=JSON.parse(await fs.readFile('src/data/timeline.json','utf8'));
const pass=process.argv[2]??'initial';
const filter=process.argv[3];
const base=path.resolve(`qa/frames/${pass}`);
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.resolve(`qa/temp/bundle-${pass}`)});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE??'/usr/bin/chromium'});
const manifest=[];
try {
 for(const s of lesson.scenes.filter(s=>!filter||s.id===filter)){
  const t=timeline.scenes.find(t=>t.id===s.id);
  const points=[['start',15],['beat2',t.beats[1].cueFrame-t.startFrame+100],['beat3',t.beats[2].cueFrame-t.startFrame+100],['beat4',t.beats[3].cueFrame-t.startFrame+100],['end',t.durationInFrames-45]];
  const composition=await selectComposition({serveUrl,id:`Lab-${s.id}`,puppeteerInstance:browser});
  await fs.mkdir(path.join(base,s.id),{recursive:true});
  for(const [state,localFrame] of points){
    const frame=Math.min(t.durationInFrames-1,localFrame);
    const output=path.join(base,s.id,`${state}.jpg`);
    await renderStill({serveUrl,composition,frame,output,imageFormat:'jpeg',jpegQuality:92,puppeteerInstance:browser});
    manifest.push({scene:s.id,state,localFrame:frame,globalFrame:t.startFrame+frame,output});
  }
  console.log(`QA frames ready: ${s.id}`);
 }
 await fs.writeFile(path.join(base,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
}finally{await browser.close({silent:true});}
