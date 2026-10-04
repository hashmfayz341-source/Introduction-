import React from 'react';
import {Cell,Mitochondrion} from '../anatomy/Cell';
import {SceneCanvas} from '../components/SceneCanvas';
import {Arrow,EnergyGauge,Ion,Label} from '../components/Primitives';
import {useScene} from '../hooks/useScene';
import {resolveCueFrame} from '../utils/cues';
import {theme} from '../styles/theme';

type Props={sceneId:string};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const L:React.FC<React.ComponentProps<typeof Label>>=(p)=><Label anchor="middle" {...p}/>;
const useIntegrated=(sceneId:string)=>{
  const state=useScene(sceneId);
  const word=(id:string,text:string,d=45)=>{
    const cue=resolveCueFrame(state.timed,id,text,state.fps);
    if(cue===undefined)return state.beat(id,d);
    const p=Math.max(0,Math.min(1,(state.frame-cue)/d));
    return p*p*(3-2*p);
  };
  return {...state,word};
};

/** Cutaway preserves two separate membranes and their distinct consequences. */
export const Mitochondria:React.FC<Props>=({sceneId})=>{
  const {frame,beat,word}=useIntegrated(sceneId);
  const insults=beat('mitochondria-insults',55);
  const inner=beat('mitochondria-inner',65);
  const gradient=word('mitochondria-inner','gradient',65);
  const lowATP=word('mitochondria-inner','ATP',70);
  const outer=beat('mitochondria-outer',65);
  const release=word('mitochondria-outer','cytochrome',75);
  const caspase=word('mitochondria-outer','caspases',60);
  const distinction=beat('mitochondria-distinct',50);
  const zoom=1+insults*.07;
  return <SceneCanvas sceneId={sceneId} footer="Inner membrane: energy failure. Outer membrane: cytochrome c release. Distinct events can coexist.">
    <g transform="translate(290 505)"><Cell scale={.46}/></g>
    <L x={290} y={690} text="Injured cell" size={32}/>
    <path d="M360 534 L492 355 M360 552 L492 660" stroke={theme.mitochondrion} strokeWidth="2" fill="none" opacity=".45"/>
    <g opacity={insults}>
      <L x={290} y={305} text="Ischemia" color={theme.injury} size={31}/>
      <Ion x={227} y={760} type="Ca"/><L x={338} y={770} text="ROS" color={theme.injury} size={33}/>
      <Arrow x1={330} y1={735} x2={540} y2={622} progress={insults} color={theme.injury}/>
    </g>
    <g transform={`translate(925 495) scale(${zoom})`}>
      <path d="M-370,-115 C-222,-200 175,-181 326,-85 C423,-25 369,128 171,151 C-56,185 -346,132 -382,29 C-407,-37 -407,-76 -370,-115Z" fill="#382F29" stroke={outer>.3?theme.injury:theme.mitochondrion} strokeWidth="7" strokeDasharray={outer>.7?'400 50 580 40':undefined}/>
      <path d="M-333,-92 C-225,-152 160,-144 293,-67 C366,-19 319,99 155,118 C-49,148 -308,110 -342,24 C-365,-29 -363,-59 -333,-92Z" fill="#1C333B" stroke={theme.mitochondrion} strokeWidth="5"/>
      <path d="M-280,-55 L-239,57 L-180,65 L-194,-71 L-132,-83 L-101,65 L-40,72 L-57,-89 L12,-90 L43,69 L101,62 L89,-78 L156,-59 L176,46 L230,14" fill="none" stroke={theme.mitochondrion} strokeWidth="5" opacity={1-inner*.4}/>
      {[0,1,2,3,4,5,6,7].map(i=>{
        const p=gradient;return <g key={i} transform={`translate(${-245+i*64} ${mix(-114,-25+i%2*60,p)})`} opacity={1-p*.8}><circle r="12" fill={theme.membrane}/><text y="6" textAnchor="middle" fontSize="17" fill={theme.background}>+</text></g>;
      })}
      <g opacity={inner}>
        <path d="M-23,-99 L-23,-58 M-41,-73 L-23,-54 L-6,-73" stroke={theme.injury} strokeWidth="6" fill="none"/>
        <circle cx="-23" cy="-98" r="13" fill={theme.injury}/>
      </g>
      {[0,1,2,3,4].map(i=><circle key={`cyt-${i}`} cx={mix(150+i*26,230+i*20,release)} cy={mix(142-i%2*8,240+i%2*28,release)} r="10" fill="#D2B1EA" opacity={outer}/>) }
    </g>
    <L x={907} y={284} text="Mitochondrial cutaway" color={theme.mitochondrion} size={37}/>
    <path d={`M1185 323 L${925+209.8*zoom} ${495-133.2*zoom}`} stroke={theme.mitochondrion} strokeWidth="3"/>
    <L x={1310} y={325} text="Outer membrane" size={29}/>
    <path d="M1130 397 L1300 393" stroke={theme.mitochondrion} strokeWidth="3"/>
    <L x={1434} y={402} text="Inner membrane" size={29}/>
    <g opacity={inner}>
      <L x={910} y={735} text="Inner permeability transition" color={theme.injury} size={33}/>
      <L x={910} y={784} text="Ion gradient collapses" color={theme.membrane} size={32} opacity={gradient}/>
      <Arrow x1={1330} y1={495} x2={1470} y2={495} color={theme.mitochondrion} progress={lowATP}/>
      <EnergyGauge x={1495} y={470} level={1-lowATP*.94}/>
      <L x={1620} y={600} text={['Sustained energy loss','→ necrosis']} size={30} color={theme.injury} opacity={lowATP}/>
    </g>
    <g opacity={outer}>
      <L x={600} y={880} text={['Outer permeabilization','Cytochrome c → cytosol']} size={30} color="#D2B1EA"/>
      <Arrow x1={800} y1={858} x2={1020} y2={858} color="#D2B1EA" progress={release}/>
      <L x={1130} y={870} text="Caspases" size={34} color="#D2B1EA" opacity={caspase}/>
      <Arrow x1={1240} y1={858} x2={1395} y2={858} color="#D2B1EA" progress={caspase}/>
      <L x={1545} y={870} text="Apoptosis" size={36} color="#D2B1EA" opacity={caspase}/>
    </g>
    <L x={1700} y={727} text={['Two membranes','Two consequences']} size={29} opacity={distinction}/>
    <circle cx="925" cy="495" r="4" fill={theme.mitochondrion} opacity={.25+.1*Math.sin(frame/30)}/>
  </SceneCanvas>;
};

const Myelin:React.FC<{x:number;y:number;opacity:number}>=({x,y,opacity})=><g transform={`translate(${x} ${y})`} opacity={opacity}>{[50,40,30,20].map(r=><ellipse key={r} rx={r} ry={r*.63} fill="none" stroke={theme.membrane} strokeWidth="4"/>)}</g>;
export const Recovery:React.FC<Props>=({sceneId})=>{
  const {beat,word}=useIntegrated(sceneId);
  const restore=beat('recovery-return',110);
  const recover=word('recovery-return','volume',85);
  const morphology=beat('recovery-morphology',55);
  const myelin=word('recovery-morphology','myelin',50);
  const severe=word('recovery-morphology','irreversible',55);
  const fragmented=word('recovery-morphology','fragmentation',50);
  const hallmarks=beat('recovery-hallmarks',60);
  const context=beat('recovery-context',45);
  return <SceneCanvas sceneId={sceneId} footer="Recovery depends on the cell, the severity of injury, and how quickly its cause is removed.">
    <path d="M960 300 V930" stroke="#31505C" strokeWidth="3"/>
    <L x={500} y={310} text="Early intervention" size={38} color={theme.recovery}/>
    <L x={1415} y={310} text={hallmarks>.5?'Irreversible injury':'Beyond recovery'} size={38} color={theme.injury} opacity={severe}/>
    <g transform="translate(520 600)"><Cell scale={.89} swelling={1-recover} erSwelling={1-recover} ribosomeLoss={1-recover}/>
      <g opacity={1-recover}>{[[-55,-40],[5,-40],[-55,15],[10,20]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="18" ry="12" fill="#ABB7EB"/>)}</g>
    </g>
    <g opacity={restore}>
      <Ion x={184} y={476} type="O2"/><Arrow x1={224} y1={480} x2={307} y2={520} color={theme.recovery} progress={restore}/>
      <EnergyGauge x={398} y={835} level={.12+recover*.88}/>
      <L x={530} y={969} text={recover>.8?'Volume + ion balance restored':'Oxygen supply restored'} color={theme.recovery} size={31}/>
    </g>
    <g opacity={severe} transform="translate(1410 560)">
      <Cell scale={.75} swelling={.75} membraneDamage={hallmarks} mitochondriaDamage={hallmarks} nuclearState={fragmented>.5?'fragmented':'condensed'}/>
      <Myelin x={-80} y={170} opacity={myelin}/>
    </g>
    <g opacity={myelin}>
      <Arrow x1={1140} y1={792} x2={1350} y2={690} color={theme.membrane}/>
      <L x={1138} y={840} text={['Myelin figures','Membrane remnants']} color={theme.membrane} size={27}/>
    </g>
    <g opacity={hallmarks}>
      <L x={1520} y={840} text={['Mitochondrial failure','Membrane damage']} size={29} color={theme.injury}/>
      
    </g>
    <L x={550} y={377} text="Blebs + clumping can resolve" color={theme.muted} size={29} opacity={morphology}/>
    <L x={1410} y={947} text="No single universal time limit" color={theme.muted} size={29} opacity={context}/>
  </SceneCanvas>;
};

export const Recap:React.FC<Props>=({sceneId})=>{
  const {beat,word}=useIntegrated(sceneId);
  const atp=beat('recap-atp',50);
  const pumps=word('recap-atp','pumps',50);
  const water=word('recap-atp','water',60);
  const branches=word('recap-atp','Glycolysis',45);
  const calcium=beat('recap-network',45);
  const ros=word('recap-network','ROS',45);
  const mito=word('recap-network','mitochondrial',50);
  const membrane=word('recap-network','membrane',60);
  const dna=beat('recap-dna',50);
  const outcome=beat('recap-outcome',55);
  const end=word('recap-outcome','why',65);
  return <SceneCanvas sceneId={sceneId} footer={end>.3?'Based on Cell Injury and Death, Part I · AMS-HIS Pathology Team':'Follow the cause. Follow the consequence. Ask whether the cell can recover.'}>
    <g transform="translate(955 535)"><Cell scale={.67} swelling={water*.7} erSwelling={water*.5} membraneDamage={membrane*.6}/></g>
    <g opacity={atp}>
      <Mitochondrion x={280} y={355} scale={1.1}/><EnergyGauge x={390} y={323} level={.15}/>
      <Arrow x1={480} y1={452} x2={720} y2={490} color={theme.mitochondrion} progress={pumps}/>
      <L x={540} y={510} text="Pump failure" size={33} opacity={pumps}/>
      <L x={620} y={610} text="Na⁺ ↑ → H₂O ↑" size={32} color="#75C9E8" opacity={water}/>
      <g opacity={branches}>
        <path d="M430 402 V712 H540 M430 654 H170" fill="none" stroke={theme.mitochondrion} strokeWidth="3"/>
        <L x={245} y={735} text={['Glycolysis ↑','pH ↓']} size={29} color={theme.mitochondrion}/>
        <L x={565} y={777} text={['Ribosomes detach','Protein synthesis ↓']} size={29} color={theme.mitochondrion}/>
      </g>
    </g>
    <g opacity={calcium}>
      <Ion x={950} y={297} type="Ca" scale={1.1}/>
      <L x={950} y={355} text="Damage enzymes" size={29} color={theme.mitochondrion}/>
      <Arrow x1={950} y1={370} x2={950} y2={400} color={theme.mitochondrion} progress={calcium}/>
    </g>
    <g opacity={ros}>
      <L x={1450} y={339} text="ROS ↑" size={37} color={theme.injury}/>
      {[0,1,2,3].map(i=><path key={i} d={`M${1390+i*37} 367 l14 16 l-14 16`} fill="none" stroke={theme.injury} strokeWidth="4"/>)}
      <Arrow x1={1390} y1={419} x2={1140} y2={485} color={theme.injury} progress={ros}/>
    </g>
    <g opacity={mito}>
      <Mitochondrion x={1460} y={590} scale={1.05} damage={1}/>
      <L x={1460} y={710} text="Mitochondrial injury" size={30} color={theme.mitochondrion}/>
      <Arrow x1={1370} y1={570} x2={1160} y2={550} color={theme.mitochondrion} progress={mito}/>
      <Arrow x1={1560} y1={550} x2={1540} y2={393} color={theme.injury} progress={mito}/>
    </g>
    <g opacity={membrane}>
      <L x={960} y={777} text="Membrane failure" size={32} color={theme.injury}/>
      <Arrow x1={1300} y1={725} x2={1125} y2={760} color={theme.injury} progress={membrane}/>
      <Arrow x1={1070} y1={749} x2={1380} y2={650} color={theme.injury} progress={membrane}/>
    </g>
    <g opacity={dna}>
      <L x={1650} y={841} text={['Unrepaired DNA','Misfolded proteins']} size={29} color="#BCA9EE"/>
      <Arrow x1={1525} y1={879} x2={1255} y2={905} color="#BCA9EE" progress={dna}/>
      <L x={1120} y={925} text="Apoptosis" color="#BCA9EE" size={32}/>
    </g>
    <g opacity={outcome}>
      <L x={545} y={905} text="Recoverable → balance" size={32} color={theme.recovery}/>
      <L x={545} y={955} text="Irreparable → cell death" size={32} color={theme.injury}/>
    </g>
  </SceneCanvas>;
};
