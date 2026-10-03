import React,{useEffect,useState} from 'react';
import {Composition,continueRender,delayRender} from 'remotion';
import {CellInjury,SceneRenderer} from './compositions/CellInjury';
import {PipelineCheck} from './compositions/PipelineCheck';
import {lesson,timeline} from './hooks/useScene';
import {Homeostasis,Adaptation,InjuryThreshold,Causes,Targets,OxygenATP} from './scenes/Foundations';
import {PumpSwelling,Glycolysis,ProteinSynthesis,Calcium} from './scenes/Energy';
import {ROS,Antioxidants,MembraneInjury,DNAProtein,DeathPatterns} from './scenes/Damage';
import {Mitochondria,Recovery,Recap} from './scenes/Integration';

export const registry:Record<string,SceneRenderer>={
  homeostasis:Homeostasis,adaptation:Adaptation,'injury-threshold':InjuryThreshold,
  causes:Causes,targets:Targets,'oxygen-atp':OxygenATP,'pump-swelling':PumpSwelling,
  glycolysis:Glycolysis,'protein-synthesis':ProteinSynthesis,calcium:Calcium,
  mitochondria:Mitochondria,ros:ROS,antioxidants:Antioxidants,
  'membrane-injury':MembraneInjury,'dna-protein':DNAProtein,'death-patterns':DeathPatterns,
  recovery:Recovery,recap:Recap,
};
const Main:React.FC=()=>timeline?<CellInjury lesson={lesson} timeline={timeline} scenes={registry}/>:null;
const labs=lesson.scenes.map(s=>{
  const Scene=registry[s.visual];
  const Lab:React.FC=()=> <Scene sceneId={s.id}/>;
  return {id:s.id,component:Lab,duration:timeline?.scenes.find(t=>t.id===s.id)?.durationInFrames??720};
});

export const Root:React.FC=()=>{
  const [handle]=useState(()=>delayRender('Loading bundled Inter fonts'));
  useEffect(()=>{
    Promise.all([400,600,700].map(w=>document.fonts.load(`${w} 32px Inter`))).then(()=>continueRender(handle));
  },[handle]);
  return <>
    {timeline?<Composition id="CellInjury" component={Main} durationInFrames={timeline.durationInFrames} width={1920} height={1080} fps={timeline.fps}/>:null}
    {labs.map(l=><Composition key={l.id} id={`Lab-${l.id}`} component={l.component} durationInFrames={l.duration} width={1920} height={1080} fps={30}/>)}
    <Composition id="PipelineCheck" component={PipelineCheck} durationInFrames={90} width={1920} height={1080} fps={30}/>
  </>;
};
