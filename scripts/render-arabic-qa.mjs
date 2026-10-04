import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';

const timeline=JSON.parse(await fs.readFile('src/data/timeline.ar.json','utf8'));
const pass=process.argv[2]??'arabic';
const filter=process.argv[3]?.split(',');
const base=path.resolve(`qa/frames/${pass}`);
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.resolve(`qa/temp/bundle-${pass}`)});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE??'/usr/bin/chromium'});
const manifest=[];
try{
  for(const scene of timeline.scenes.filter(s=>!filter||filter.includes(s.id))){
    const local=(absolute)=>absolute-scene.startFrame;
    const cue=(beat,key,offset=32)=>local(scene.beats.find(b=>b.id===beat).cues[key].frame)+offset;
    const points=[['start',15],['middle',Math.round(scene.durationInFrames/2)],
      ...scene.beats.map((b,i)=>[`beat${i+1}`,Math.min(local(b.endFrame)-5,local(b.cueFrame)+90)]),
      ['end',scene.durationInFrames-45]];
    const extras={
      homeostasis:()=>[['balance',cue('homeostasis-balance','living')],['labile',cue('homeostasis-types','labile')],['stable',cue('homeostasis-types','stable')]],
      'injury-threshold':()=>[['stress-factors',cue('threshold-stress','outcome')]],
      causes:()=>[['chemical',cue('causes-trauma','chemicals')],['biological',cue('causes-trauma','biological')],['environment',cue('causes-environment','environmental')],['nutrition',cue('causes-environment','both')]],
      'pump-swelling':()=>[['pump-slows',cue('pump-failure','falls',75)],['water-influx',cue('pump-ions','water',50)],['swelling',cue('pump-ions','swelling',100)]],
      'protein-synthesis':()=>[['translation',cue('protein-workshop','zoom',70)],['ribosomes-detach',cue('protein-detach','decreases',90)]],
      mitochondria:()=>[['inner-gradient',cue('mitochondria-inner','gradient',75)],['outer-release',cue('mitochondria-outer','cytochrome',90)]],
      'membrane-injury':()=>[['lysosomal-release',cue('membrane-organelles','lysosomal',100)]],
      'death-patterns':()=>[['nuclear-fragments',cue('death-nucleus','fragmentation',45)],['apoptotic-bodies',Math.min(cue('death-apoptosis','breaks',50),cue('death-apoptosis','removed',-2))],['clearance',cue('death-apoptosis','removed',100)]],
      recovery:()=>[['cell-recovers',cue('recovery-return','volume',100)]],
    };
    points.push(...(extras[scene.id]?.()??[]));
    const composition=await selectComposition({serveUrl,id:`LabAr-${scene.id}`,puppeteerInstance:browser});
    await fs.mkdir(path.join(base,scene.id),{recursive:true});
    for(const[state,target]of points){
      const frame=Math.max(0,Math.min(scene.durationInFrames-1,target));
      const output=path.join(base,scene.id,`${state}.jpg`);
      await renderStill({serveUrl,composition,frame,output,imageFormat:'jpeg',jpegQuality:92,puppeteerInstance:browser});
      manifest.push({scene:scene.id,state,localFrame:frame,globalFrame:scene.startFrame+frame,output});
    }
    console.log(`Arabic QA frames: ${scene.id}`);
  }
  await fs.writeFile(path.join(base,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  let record=manifest.map(({output,...r})=>r);
  await fs.mkdir('qa/arabic',{recursive:true});
  if(filter){
    const previous=JSON.parse(await fs.readFile('qa/arabic/encoded-states.json','utf8'));
    record=[...previous.filter(r=>!filter.includes(r.scene)),...record];
  }
  await fs.writeFile('qa/arabic/encoded-states.json',JSON.stringify(record,null,2)+'\n');
}finally{await browser.close({silent:true});}
