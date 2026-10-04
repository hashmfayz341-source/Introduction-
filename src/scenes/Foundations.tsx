import React from 'react';
import {Cell, Mitochondrion} from '../anatomy/Cell';
import {SceneCanvas} from '../components/SceneCanvas';
import {Arrow, EnergyGauge, Ion, Label as SvgLabel} from '../components/Primitives';
import {useScene} from '../hooks/useScene';
import {resolveCueFrame} from '../utils/cues';
import {theme} from '../styles/theme';

type SceneProps = {sceneId:string};
const Label:React.FC<React.ComponentProps<typeof SvgLabel>> = ({anchor='middle',...props}) => <SvgLabel {...props} anchor={anchor}/>;

/** Named-word cues use the real speech boundaries, including multiple mechanisms
 * within the same narration beat; preview falls back to its measured beat anchor. */
const useFoundation = (sceneId:string) => {
  const state=useScene(sceneId);
  const word=(beatId:string,spokenWord:string,duration=32) => {
    const cue=resolveCueFrame(state.timed,beatId,spokenWord,state.fps);
    if(cue===undefined)return state.beat(beatId,duration);
    const t=Math.max(0,Math.min(1,(state.frame-cue)/duration));
    return t*t*(3-2*t);
  };
  return {...state,word};
};

const Leader:React.FC<{x:number;y:number;toX:number;toY:number;text:string;side?:'left'|'right';color?:string;opacity?:number}> =
  ({x,y,toX,toY,text,side='right',color=theme.membrane,opacity=1}) => (
    <g opacity={opacity}>
      <path d={`M${x},${y} L${toX + (side==='right' ? -38 : 38)},${toY-10} H${toX}`} fill="none" stroke={color} strokeWidth={2.5}/>
      <circle cx={x} cy={y} r={5} fill={color}/>
      <Label x={toX+(side==='right'?14:-14)} y={toY} text={text} anchor={side==='right'?'start':'end'} size={30}/>
    </g>
  );

/** These abstract epithelial cells represent replacement of one mature tissue type.
 * The drawing does not imply that swelling changes a cell's differentiated identity. */
const Epithelium:React.FC<{x:number;y:number;progress:number}> = ({x,y,progress}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-138,85 H138" stroke={theme.muted} strokeWidth={5}/>
    {[0,1,2,3].map((i)=>{
      const cellX=-126+i*65;
      return <g key={i}>
        <g opacity={1-progress}>
          <rect x={cellX} y={10} width={58} height={72} rx={7} fill={theme.cytoplasm} stroke={theme.membrane} strokeWidth={3}/>
          <ellipse cx={cellX+29} cy={48} rx={12} ry={14} fill={theme.nucleus}/>
        </g>
        <g opacity={progress}>
          <rect x={cellX} y={-39} width={58} height={121} rx={7} fill="#26345B" stroke="#9AA6EC" strokeWidth={3}/>
          <ellipse cx={cellX+29} cy={52} rx={12} ry={15} fill="#94A1E2"/>
        </g>
      </g>;
    })}
  </g>
);

const CellGroup:React.FC<{x:number;y:number;progress:number}> = ({x,y,progress}) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`translate(${-65*progress} ${45*progress})`}><Cell scale={0.27}/></g>
    <g opacity={progress} transform="translate(75 45)"><Cell scale={0.27}/></g>
    <g opacity={progress} transform="translate(4 -80)"><Cell scale={0.27}/></g>
  </g>
);

export const Homeostasis:React.FC<SceneProps> = ({sceneId}) => {
  const {scene,beat,frame,word} = useFoundation(sceneId);
  const reveal=(index:number,frames=26)=>beat(scene.beats[index]?.id??'',frames);
  const anatomy=reveal(1);
  const balance=word('homeostasis-balance','living');
  const cycle=reveal(2);
  const scale=0.99-0.14*cycle;
  const cellX=915; const cellY=605;
  return <SceneCanvas sceneId={sceneId} footer="Homeostasis maintains a narrow physiological range.">
    <g opacity={1-cycle}>
      <g transform={`translate(${cellX} ${cellY})`}>
        <Cell scale={scale}/>
        <g opacity={anatomy} transform={`scale(${scale})`}>
          <path d="M-180,-5 Q-137,0 -121,80 T-80,170 M-145,-170 Q60,-222 190,-74 M-130,141 Q70,230 193,116 M-212,55 Q-160,120 -123,166 M120,-101 Q195,25 121,165" stroke="#73A3B1" strokeWidth={3} opacity={0.42} fill="none"/>
          <g transform="translate(-177 25) rotate(25)">
            {[-9,0,9].map((dy)=><path key={dy} d={`M-18,${dy} H18`} stroke="#AFCBC7" strokeWidth={4}/>)}
          </g>
          <circle cx={185} cy={-102} r={16} fill="#425B56" stroke="#AFCFC0" strokeWidth={3}/>
          <path d="M175,-102 H195 M185,-112 V-92" stroke="#AFCFC0" strokeWidth={3}/>
        </g>
      </g>
      <g opacity={anatomy}>
        <Leader x={cellX-23*scale} y={cellY-16*scale} toX={540} toY={370} text="Nucleus" side="left" color="#9AA6EC"/>
        <Leader x={cellX-59*scale} y={cellY-126*scale} toX={540} toY={460} text="ER + ribosomes" side="left"/>
        <Leader x={cellX-153*scale} y={cellY-79*scale} toX={540} toY={550} text="Lysosome" side="left" color="#CB9A95"/>
        <Leader x={cellX-177*scale} y={cellY+25*scale} toX={540} toY={650} text="Centrioles" side="left"/>
        <Leader x={cellX-145*scale} y={cellY+104*scale} toX={540} toY={755} text="Mitochondrion" side="left" color={theme.mitochondrion}/>
        <Leader x={cellX+263*scale} y={cellY-29*scale} toX={1300} toY={370} text="Plasma membrane"/>
        <Leader x={cellX+185*scale} y={cellY-102*scale} toX={1300} toY={470} text="Peroxisome"/>
        <Leader x={cellX+139*scale} y={cellY+72*scale} toX={1300} toY={570} text="Golgi apparatus"/>
        <Leader x={cellX+225*scale} y={cellY+20*scale} toX={1300} toY={690} text="Cytoplasm"/>
        <Leader x={cellX-123*scale} y={cellY+166*scale} toX={1300} toY={790} text="Cytoskeleton"/>
      </g>
      <g opacity={balance*(1-cycle)}>
        <g opacity={1-anatomy}>{[0,1,2,3,4,5].map((i)=>{
          const theta=(frame*0.006+i*Math.PI/3);
          return <Ion key={i} x={cellX+355*Math.cos(theta)} y={cellY+225*Math.sin(theta)} type={i%2?'Na':'K'} scale={0.82}/>;
        })}</g>
        <path d="M648,866 H1178" stroke={theme.muted} strokeWidth={7} opacity={0.35}/>
        <path d="M765,866 H1065" stroke={theme.recovery} strokeWidth={7}/>
        <circle cx={915+18*Math.sin(frame/24)} cy={866} r={12} fill={theme.ink}/>
        <Label x={915} y={924} text="Dynamic balance" size={32}/>
      </g>
    </g>
    <g opacity={cycle}>
      <Label x={960} y={310} text="Cells differ in proliferative capacity" size={36}/>
      {[{x:390,title:'LABILE',sub:'Continuous renewal',cue:'Labile'},{x:960,title:'STABLE',sub:'Divide after a stimulus',cue:'Stable'},{x:1530,title:'PERMANENT',sub:'Very limited division',cue:'permanent'}].map((type,i)=><g key={type.title} opacity={0.18+0.82*word('homeostasis-types',type.cue)}>
        <Label x={type.x} y={410} text={type.title} color={i===2?theme.muted:theme.membrane} size={34}/>
        <g transform={`translate(${type.x-115} 610)`}><Cell scale={0.33}/></g>
        <g opacity={i===2?0.18:cycle} transform={`translate(${type.x+115} 610)`}><Cell scale={0.33}/></g>
        <Arrow x1={type.x-12} y1={610} x2={type.x+28} y2={610} color={i===2?theme.muted:theme.recovery} progress={cycle}/>
        {i===1&&<g><path d={`M${type.x-20},462 L${type.x-36},500 L${type.x-10},498 L${type.x-24},536`} stroke={theme.mitochondrion} strokeWidth={6} fill="none"/><Label x={type.x+68} y={500} text="stimulus" size={30}/></g>}
        {i===2&&<path d={`M${type.x+40},569 L${type.x+77},651`} stroke={theme.injury} strokeWidth={6}/>}
        <Label x={type.x} y={780} text={type.sub} size={30}/>
      </g>)}
      <Label x={960} y={895} text="Cell type changes its capacity to tolerate and respond to stress" size={31} color={theme.muted}/>
    </g>
  </SceneCanvas>;
};

export const Adaptation:React.FC<SceneProps> = ({sceneId}) => {
  const {scene,beat,word} = useFoundation(sceneId);
  const reveal=(index:number,frames=35)=>beat(scene.beats[index]?.id??'',frames);
  const hypertrophy=word('adaptation-size','Hypertrophy'),atrophy=word('adaptation-size','Atrophy'),hyperplasia=word('adaptation-number','Hyperplasia'),metaplasia=word('adaptation-number','Metaplasia'),limit=reveal(3);
  const xs=[300,740,1180,1620];
  return <SceneCanvas sceneId={sceneId} footer="Adaptation preserves viability by establishing a new steady state.">
    <path d="M140,339 H1780" stroke={theme.membrane} strokeWidth={2} opacity={0.35}/>
    <Label x={960} y={316} text="Stress → a new steady state" size={38}/>
    {[['Hypertrophy','Cell size ↑'],['Atrophy','Cell size ↓'],['Hyperplasia','Cell number ↑'],['Metaplasia','Mature cell type replaced']].map(([title,detail],i)=><g key={title}>
      <Label x={xs[i]} y={425} text={title} size={36} color={theme.membrane}/>
      {i===1&&<g transform={`translate(${xs[i]} 635)`}><path d="M-133,-46 C-121,-116 -43,-141 26,-123 C89,-125 141,-74 149,-18 C155,37 129,111 57,125 C-20,144 -97,114 -128,50 C-148,15 -145,-17 -133,-46Z" fill="none" stroke={theme.muted} strokeWidth={2} strokeDasharray="8 8"/><Cell scale={0.52-0.19*atrophy}/></g>}
      {i===0&&<g transform={`translate(${xs[i]} 635)`}><Cell scale={0.40+0.20*hypertrophy}/></g>}
      {i===2&&<CellGroup x={xs[i]} y={635} progress={hyperplasia}/>}
      {i===3&&<Epithelium x={xs[i]} y={650} progress={metaplasia}/>}
      <g opacity={[hypertrophy,atrophy,hyperplasia,metaplasia][i]}><Label x={xs[i]} y={842} text={detail} size={i===3?30:33}/></g>
      {i<3&&<path d={`M${xs[i]+220},396 V884`} stroke={theme.muted} strokeWidth={1.5} opacity={0.22}/>}
    </g>)}
    <g opacity={limit}><Arrow x1={640} y1={938} x2={1230} y2={938} color={theme.injury} progress={limit}/><Label x={640} y={915} text="Adaptive capacity exceeded" size={30} anchor="start" color={theme.injury}/><Label x={1270} y={949} text="Injury" size={33} anchor="start" color={theme.injury}/></g>
  </SceneCanvas>;
};

export const InjuryThreshold:React.FC<SceneProps> = ({sceneId}) => {
  const {scene,beat,frame,word} = useFoundation(sceneId);
  const reveal=(index:number,frames=35)=>beat(scene.beats[index]?.id??'',frames);
  const stress=reveal(0), reversible=reveal(1), recovery=word('threshold-reversible','removed'), integrity=reveal(2), irreversible=reveal(3);
  const factors=word('threshold-stress','outcome')*(1-reversible);
  const swelling=0.68*reversible*(1-0.45*recovery)+0.4*irreversible;
  const damage=irreversible;
  return <SceneCanvas sceneId={sceneId} footer="Outcome depends on cell type, adaptability, severity and duration.">
    <g opacity={1-factors}>
      <g opacity={stress*(1-recovery)}>
        <path d="M318,430 L372,535 L332,535 L388,662" stroke={theme.injury} strokeWidth={12} fill="none" strokeLinejoin="round"/>
        <Arrow x1={422} y1={558} x2={675} y2={558} color={theme.injury} progress={stress}/>
        <Label x={358} y={742} text="Stress" color={theme.injury} size={35}/>
      </g>
      <g transform="translate(965 597)"><Cell scale={0.92} swelling={swelling} membraneDamage={damage} nuclearState={damage>0.5?'fragmented':'normal'} mitochondriaDamage={damage}/></g>
      <Label x={965} y={326} text={irreversible>0.1?'Irreversible injury':reversible>0.1?'Reversible injury':'Homeostasis'} size={38} color={irreversible>0.1?theme.injury:theme.ink}/>
      <g opacity={recovery*(1-irreversible)}>
        <path d="M1340,765 C1450,736 1480,512 1352,430" fill="none" stroke={theme.recovery} strokeWidth={6}/>
        <Arrow x1={1370} y1={434} x2={1295} y2={408} color={theme.recovery}/>
        <Label x={1650} y={585} text={['Remove the','injurious stimulus']} size={32} color={theme.recovery}/>
        <Label x={1650} y={736} text="Recovery possible" size={31} color={theme.recovery}/>
      </g>
      <g opacity={integrity*(1-irreversible)}><Label x={345} y={443} text={['Functional membrane','integrity retained']} size={31} color={theme.recovery}/><Label x={345} y={796} text="Nucleus remains viable" size={31} color="#A8B4EB"/></g>
      <g opacity={irreversible}>
        <Arrow x1={1303} y1={590} x2={1490} y2={590} color={theme.injury} progress={irreversible}/>
        <Label x={1640} y={601} text="Cell death" size={38} color={theme.injury}/>
        <Label x={1630} y={671} text="Necrosis / apoptosis" size={30}/>
      </g>
      <path d="M520,909 H1400" stroke={theme.muted} strokeWidth={5} opacity={0.35}/>
      <path d={`M520,909 H${520+880*(0.25*stress+0.35*reversible+0.4*irreversible)*(1-0.45*recovery*(1-irreversible))}`} stroke={irreversible>0.1?theme.injury:theme.mitochondrion} strokeWidth={8}/>
      <Label x={500} y={877} text="Tolerable" size={30} anchor="start" color={theme.recovery}/>
      <Label x={1400} y={877} text="Severe / sustained" size={30} anchor="end" color={theme.injury}/>
    </g>
    <g opacity={factors}>
      <Label x={960} y={355} text="The same stress can have different outcomes" size={39}/>
      <g transform="translate(960 623)"><Cell scale={0.69}/></g>
      <Label x={345} y={499} text="Cell type" size={37} color={theme.membrane}/>
      <Label x={345} y={550} text="State + adaptability" size={31}/>
      <Arrow x1={490} y1={520} x2={742} y2={572} progress={factors}/>
      <Label x={1560} y={480} text="Severity" size={37} color={theme.injury}/>
      <path d="M1400,546 H1700" stroke={theme.muted} strokeWidth={5}/>
      {[0,1,2,3,4].map((i)=><path key={i} d={`M${1420+i*65},556 V${546-18-i*13}`} stroke={theme.injury} strokeWidth={9}/>)}
      <Arrow x1={1370} y1={542} x2={1187} y2={583} progress={factors} color={theme.injury}/>
      <circle cx={1545} cy={770} r={61} fill="none" stroke={theme.mitochondrion} strokeWidth={5}/>
      <path d={`M1545,770 L1545,733 M1545,770 L${1545+39*Math.cos(frame/200)},${770+39*Math.sin(frame/200)}`} stroke={theme.mitochondrion} strokeWidth={5} fill="none"/>
      <Label x={1545} y={891} text="Duration" size={37} color={theme.mitochondrion}/>
      <Arrow x1={1458} y1={753} x2={1176} y2={701} progress={factors} color={theme.mitochondrion}/>
    </g>
  </SceneCanvas>;
};

const CauseIcon:React.FC<{kind:number;progress:number}> = ({kind,progress}) => {
  const color=kind===0?theme.membrane:kind===6?'#A3A9E8':theme.injury;
  return <g stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round">
    {kind===0&&<g><path d="M-75,-22 H75 M-75,25 H75"/><circle cx={-22+progress*45} cy={0} r={17} fill="#6B2E3C" stroke="#DD7C86"/><circle cx={53} cy={-57} r={22} stroke={theme.membrane}/><text x={53} y={-48} textAnchor="middle" fontSize={26} fill={theme.membrane} stroke="none">O₂</text></g>}
    {kind===1&&<g transform="rotate(-30)"><path d="M-7,65 V-22 M-53,-22 H51 V-61 H-53Z"/><path d="M57,45 L77,63 M56,72 L75,80"/></g>}
    {kind===2&&<g><path d="M-25,-60 V-14 L-61,50 Q-69,69 -49,69 H49 Q68,69 59,48 L25,-14 V-60 M-33,-60 H33"/><path d="M-43,34 H43"/><circle cx={-12} cy={46} r={4}/><circle cx={17} cy={15} r={5}/></g>}
    {kind===3&&<g><circle r={48}/>{[0,1,2,3,4,5,6,7].map((i)=><path key={i} d={`M${49*Math.cos(i*Math.PI/4)},${49*Math.sin(i*Math.PI/4)} L${66*Math.cos(i*Math.PI/4)},${66*Math.sin(i*Math.PI/4)}`}/>)}<circle cx={-16} cy={-5} r={5}/><circle cx={17} cy={14} r={7}/><path d="M-14,25 Q12,-28 25,-13"/></g>}
    {kind===4&&<g><path d="M-12,-65 Q-12,-82 8,-82 Q26,-82 26,-65 V25 Q46,43 33,66 Q18,84 -5,68 Q-24,51 -12,29Z"/><path d="M8,-52 V43"/><circle cx={8} cy={51} r={12} fill={color}/><path d="M46,-28 H76 M50,0 H70 M46,28 H76"/></g>}
    {kind===5&&<g><circle r={57}/><circle r={39}/><path d="M-88,-50 V64 M-101,-51 V-15 Q-88,1 -75,-15 V-51 M84,-57 V65 M84,-57 Q108,-10 84,10"/></g>}
    {kind===6&&<g><path d="M-43,-78 C56,-37 -56,34 43,78 M43,-78 C-56,-37 56,34 -43,78"/>{[-60,-30,0,30,60].map((y,i)=><path key={y} d={`M${i%2?-33:-21},${y} H${i%2?33:21}`}/>)} </g>}
    {kind===7&&<g><circle r={65}/><path d="M0,-42 V0 L33,18"/><path d="M-39,-57 L-48,-72 M40,-57 L48,-72"/></g>}
  </g>;
};

export const Causes:React.FC<SceneProps> = ({sceneId}) => {
  const {word} = useFoundation(sceneId);
  const names=['Oxygen deprivation','Physical','Chemical','Biological','Environmental','Nutrition','Genetic','Aging'];
  const examples:(string|string[])[]=[
    ['Hypoxia: oxygen ↓','Ischemia: blood flow ↓'],
    ['Needles, blades, knives, glass','Falls, pressure, steering wheel'],
    'Acids • alkalis • pollutants',
    ['Viruses • bacteria • fungi','Parasites • insects • worms'],
    ['High / low temperature','Radiation'],
    ['Macro- / micronutrients','Deficiency / excess'],
    ['Down syndrome • sickle cell anemia','Mediterranean disease (lecture term)'],
    ['Declining cellular reserve','Reduced repair capacity'],
  ];
  const cues=[['causes-oxygen','Hypoxia'],['causes-trauma','Physical'],['causes-trauma','Chemicals'],['causes-trauma','Biological'],['causes-environment','Environmental'],['causes-environment','Both'],['causes-genetic','Genetic'],['causes-genetic','Aging']];
  const progress=cues.map(([id,token])=>word(id,token));
  const xs=[300,740,1180,1620];
  const active=Math.max(0,progress.reduce((result,p,i)=>p>0.1?i:result,0));
  return <SceneCanvas sceneId={sceneId} footer="Many causes converge on a limited set of cellular targets.">
    <g transform="translate(960 606)"><Cell scale={0.44}/></g>
    {names.map((name,i)=>{
      const x=xs[i%4],y=i<4?370:829;
      const p=progress[i];
      const isActive=active===i;
      return <g key={name} opacity={0.15+0.85*p}>
        <Arrow x1={x} y1={i<4?500:737} x2={960+(x-960)*0.19} y2={i<4?550:714} color={isActive?theme.injury:theme.muted} progress={p} width={isActive?4:2}/>
        <g transform={`translate(${x} ${y-22}) scale(${0.70+0.08*(isActive?1:0)})`}><CauseIcon kind={i} progress={p}/></g>
        <Label x={x} y={i<4?473:924} text={name} size={31} color={isActive?theme.ink:theme.muted}/>
      </g>;
    })}
    <path d="M275,641 H650 M1270,641 H1645" stroke={theme.muted} strokeWidth={1.5} opacity={0.28}/>
    <Label x={active<4?1470:450} y={580} text={names[active]} size={32} color={theme.membrane}/>
    <Label x={active<4?1470:450} y={632} text={examples[active]} size={30}/>
  </SceneCanvas>;
};

export const Targets:React.FC<SceneProps> = ({sceneId}) => {
  const {word} = useFoundation(sceneId);
  const progress=[word('targets-energy','Mitochondria'),word('targets-boundary','membranes'),word('targets-proteins','ribosomes'),word('targets-proteins','cytoskeleton'),word('targets-genome','DNA')];
  const cyto=progress[3];
  const active=Math.max(0,progress.reduce((result,p,i)=>p>0.1?i:result,0));
  const targets=[
    {x:811,y:718,toX:450,toY:385,name:'Mitochondria',purpose:'ATP production',color:theme.mitochondrion},
    {x:1247,y:579,toX:1445,toY:410,name:'Cell membranes',purpose:'Ion balance + integrity',color:theme.membrane},
    {x:900,y:476,toX:450,toY:584,name:'ER + ribosomes',purpose:'Protein synthesis',color:'#76B3BF'},
    {x:839,y:782,toX:450,toY:801,name:'Cytoskeleton',purpose:'Structure + transport',color:'#76B3BF'},
    {x:918,y:590,toX:1445,toY:753,name:'Genetic apparatus',purpose:'DNA integrity',color:'#9AA6EC'},
  ];
  return <SceneCanvas sceneId={sceneId} footer="Loss of function at one target can amplify damage at the others.">
    <g transform="translate(965 608)"><Cell scale={1.04}/><g opacity={cyto*0.8}><path d="M-180,-5 Q-137,0 -121,80 T-80,170 M-145,-170 Q60,-222 190,-74 M-130,141 Q70,230 193,116 M-212,55 Q-160,120 -123,166 M120,-101 Q195,25 121,165" stroke="#89BAC3" strokeWidth={4} fill="none"/></g></g>
    {targets.map((t,i)=><g key={t.name} opacity={0.18+0.82*progress[i]}>
      <Leader x={t.x} y={t.y} toX={t.toX} toY={t.toY} text={t.name} side={t.toX<965?'left':'right'} color={t.color}/>
      <Label x={t.toX+(t.toX<965?-14:14)} y={t.toY+48} text={t.purpose} size={30} anchor={t.toX<965?'end':'start'} color={theme.muted}/>
      <circle cx={t.x} cy={t.y} r={28+10*progress[i]} fill="none" stroke={t.color} strokeWidth={3} opacity={active===i?0.9:0}/>
    </g>)}
  </SceneCanvas>;
};

export const OxygenATP:React.FC<SceneProps> = ({sceneId}) => {
  const {beat,frame,word} = useFoundation(sceneId);
  const ischemia=word('oxygen-flow','clot'),hypoxia=word('oxygen-flow','oxygen');
  const mito=word('oxygen-mitochondria','phosphorylation'),atp=word('oxygen-mitochondria','ATP'),other=beat('oxygen-other'),necrosis=beat('oxygen-necrosis');
  const flow=1-0.89*ischemia;
  const oxy=1-0.84*Math.max(hypoxia,ischemia);
  return <SceneCanvas sceneId={sceneId} footer="Oxygen supports oxidative phosphorylation; ATP powers cellular work.">
    <g transform="translate(0 0)">
      <path d="M200,318 C550,360 950,307 1440,332" stroke="#CE6A77" strokeWidth={88} fill="none"/>
      <path d="M200,318 C550,360 950,307 1440,332" stroke="#582B3D" strokeWidth={62} fill="none"/>
      {[0,1,2,3,4,5].map((i)=>{
        const x=230+((frame*2.2*flow+i*185)%1160);
        return <g key={i} opacity={x>650?flow:1}><ellipse cx={x} cy={332} rx={25} ry={17} fill="#AB5A6B" stroke="#D88696" strokeWidth={3}/><circle cx={x+19} cy={306} r={7} fill={theme.membrane} opacity={oxy}/></g>;
      })}
      <g opacity={ischemia}><path d="M607,289 C672,284 680,310 649,332 C688,354 654,372 612,370 C650,345 601,321 607,289Z" fill="#E7938D" stroke={theme.injury} strokeWidth={6}/><Label x={643} y={420} text="Ischemia: blood flow ↓" size={31} color={theme.injury}/></g>
      <Label x={1718} y={325} text={hypoxia>0.1?['O₂ delivery','↓']:'O₂ delivery'} size={31} color={hypoxia>0.1?theme.injury:theme.membrane}/>
    </g>
    <g opacity={hypoxia}>
      <Label x={345} y={545} text="Hypoxia" color={theme.membrane} size={37}/>
      <Label x={345} y={593} text="Insufficient oxygen" size={31}/>
      <g opacity={ischemia}><Label x={345} y={737} text="Ischemia" color={theme.injury} size={37}/><Label x={345} y={787} text={['↓ oxygen + nutrients','↓ waste removal']} size={30}/></g>
    </g>
    <g transform={`translate(${930-30*mito} ${678+9*mito})`}>
      <Mitochondrion scale={3.75+0.18*mito}/>
      {[0,1,2,3].map((i)=><Ion key={i} x={-192+i*98} y={-197+(frame%56)*0.63} type="O2" opacity={oxy} scale={0.8}/>)}
      <Label x={0} y={213} text={mito>0.1?'Oxidative phosphorylation ↓':'Oxidative phosphorylation'} size={32} color={mito>0.1?theme.injury:theme.mitochondrion}/>
    </g>
    <Arrow x1={1290} y1={670} x2={1430} y2={670} color={theme.mitochondrion} progress={mito}/>
    <EnergyGauge x={1460} y={640} level={1-0.82*atp} label="ATP"/>
    <g opacity={other*(1-necrosis)}>
      <Label x={1562} y={815} text="Also depleted by:" size={31} color={theme.muted}/>
      <Label x={1562} y={861} text={['Nutrient loss • mitochondrial injury','Toxins such as cyanide']} size={30}/>
    </g>
    <g opacity={necrosis}><Label x={1560} y={831} text={['Severe, sustained ATP loss','→ necrosis']} size={30} color={theme.injury}/></g>
  </SceneCanvas>;
};
