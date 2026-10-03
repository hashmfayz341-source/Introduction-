import React from 'react';
import {Cell, Mitochondrion} from '../anatomy/Cell';
import {SceneCanvas} from '../components/SceneCanvas';
import {Arrow, EnergyGauge, Ion, Label} from '../components/Primitives';
import {useScene} from '../hooks/useScene';
import {theme} from '../styles/theme';

type SceneProps = {sceneId: string};
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const cyan = theme.membrane;
const gold = theme.mitochondrion;
const injury = theme.injury;
const ink = theme.ink;

/** Substeps share a spoken paragraph, but follow its measured individual words. */
const useEnergyScene = (sceneId: string) => {
  const state = useScene(sceneId);
  const word = (beatId: string, anchor: string, animationFrames = 45) => {
    const target = state.timed.beats.find((b) => b.id === beatId);
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cue = target?.words.find((w) => normalize(w.text) === normalize(anchor));
    if (!cue) return state.beat(beatId, animationFrames);
    const cueFrame = Math.round(cue.startSeconds * 30) - state.timed.startFrame;
    const p = Math.max(0, Math.min(1, (state.frame - cueFrame) / animationFrames));
    return p * p * (3 - 2 * p);
  };
  return {...state, word};
};

/** A membrane detail, continuous with the membrane of the cell at right. */
export const PumpSwelling: React.FC<SceneProps> = ({sceneId}) => {
  const {frame, beat, word} = useEnergyScene(sceneId);
  const pump = word('pump-failure', 'falls', 60);
  const ions = beat('pump-ions', 65);
  const water = word('pump-ions', 'Water', 80);
  const swelling = word('pump-ions', 'swelling', 85);
  const morphology = beat('pump-morphology', 65);
  const calcium = beat('pump-calcium', 60);
  const calciumFailure = word('pump-calcium', 'failing', 50);
  // Normal transport decelerates instead of suddenly reversing direction.
  const cycle = (frame / (70 + 250 * pump)) % 1;
  const normalTransport = 1 - pump;
  return <SceneCanvas sceneId={sceneId} footer={calcium>.5 ? 'Ca²⁺ regulation is separate; Na⁺/K⁺ ATPase does not transport Ca²⁺.' : 'ATP ↓  →  pump failure  →  Na⁺ ↑  →  water influx  →  swelling'}>
    <g transform="translate(1320 590)">
      <Cell scale={0.94} swelling={swelling} erSwelling={morphology} />
      <g opacity={1-morphology} transform={`scale(${.94*(1+swelling*.2)})`} stroke={cyan} strokeWidth="5" strokeLinecap="round">
        <path d="M-73,-236 l-8,-30 M-44,-238 l-4,-30 M-11,-235 v-31 M22,-230 l6,-29" />
      </g>
    </g>
    <path d="M1075,480 L875,365 M1080,680 L875,805" fill="none" stroke={cyan} strokeWidth="2" opacity="0.3" />
    <circle cx="1077" cy="584" r="82" fill="none" stroke={cyan} strokeWidth="3" strokeDasharray="9 8" opacity="0.65" />
    <Label x={1320} y={920} text={morphology > 0.1 ? 'Organelle swelling + blebs' : swelling > 0.1 ? 'Cell swelling' : 'The same cell'} anchor="middle" color={swelling > 0.1 ? injury : ink} size={36} />

    <Label x={175} y={320} text="Membrane detail" color={cyan} size={35} />
    <Label x={175} y={400} text="Extracellular" color={theme.muted} size={29} />
    <Label x={175} y={830} text="Cytoplasm" color={theme.muted} size={29} />
    <path d="M150,543 H860 M150,591 H860" fill="none" stroke={cyan} strokeWidth="6" />
    {Array.from({length: 22}, (_, i) => <g key={i} opacity="0.9">
      <circle cx={165 + i * 32} cy="543" r="7" fill={cyan} />
      <circle cx={165 + i * 32} cy="591" r="7" fill={cyan} />
      <path d={`M${165 + i * 32},550 v17 m-5,16 v-16`} stroke={cyan} strokeWidth="2" />
    </g>)}
    {/* Existing passive ion conductance becomes unopposed as active pumping falls. */}
    {[251,762].map(x=><g key={`channel-${x}`}>
      <rect x={x-17} y="534" width="34" height="65" fill={theme.background} />
      <path d={`M${x-17},530 v72 M${x+17},530 v72`} stroke="#4F9CAC" strokeWidth="6" strokeLinecap="round" />
    </g>)}
    <g transform={`translate(477 569) rotate(${Math.sin(cycle * Math.PI * 2) * 7 * normalTransport})`}>
      <path d="M-40,-80 Q0,-101 40,-80 L33,-20 Q58,0 32,22 L40,77 Q0,96 -40,77 L-31,22 Q-57,0 -32,-21Z" fill="#304764" stroke={mix(0, 1, pump) > 0.5 ? injury : '#9FACEE'} strokeWidth="6" />
      <path d="M-13,-58 Q13,-44 -9,-8 Q-30,15 10,39" fill="none" stroke="#AFB8ED" strokeWidth="5" opacity={0.85 - pump * 0.6} />
    </g>
    <Label x={500} y={360} text="Na⁺/K⁺ ATPase" anchor="middle" size={38} />
    <g opacity={normalTransport}>
      <Arrow x1={437} y1={730} x2={437} y2={425} color="#86BEF0" progress={1} />
      <Arrow x1={532} y1={425} x2={532} y2={730} color="#C9ADFC" progress={1} />
      {[0,1,2].map((i) => <Ion key={`normal-na-${i}`} x={437} y={mix(712, 440, (cycle + i * 0.13) % 1)} type="Na" scale={0.72} />)}
      {[0,1].map((i) => <Ion key={`normal-k-${i}`} x={532} y={mix(445, 709, (cycle + i * 0.2) % 1)} type="K" scale={0.72} />)}
      <Label x={338} y={665} text="3 Na⁺ out" anchor="end" color="#86BEF0" size={28} />
      <Label x={620} y={480} text="2 K⁺ in" color="#C9ADFC" size={28} />
    </g>
    <EnergyGauge x={655} y={320} level={1 - pump * 0.88} label="ATP" />
    <Label x={498} y={709} text="Pump slows" anchor="middle" color={injury} size={35} opacity={pump} />
    <g opacity={ions}>
      {/* Passive net sodium gain is beside the stopped pump, never through it. */}
      <Arrow x1={251} y1={450} x2={251} y2={720} color="#86BEF0" progress={ions} />
      <Arrow x1={762} y1={729} x2={762} y2={431} color="#C9ADFC" progress={ions} />
      {[0,1,2,3,4,5].map((i) => <Ion key={`gain-${i}`} x={mix(205 + i * 61, 245 + (i % 3) * 61, ions)} y={mix(453, 706 + Math.floor(i / 3) * 59, ions)} type="Na" scale={0.72} />)}
      {[0,1,2].map((i) => <Ion key={`loss-${i}`} x={725 + i * 47} y={mix(752, 452 - i * 24, ions)} type="K" scale={0.72} />)}
      <Label x={323} y={910} text="Na⁺ ↑" color="#86BEF0" anchor="middle" size={36} />
      <Label x={735} y={910} text="K⁺ ↓" color="#C9ADFC" anchor="middle" size={36} />
    </g>
    <g opacity={water * (1-calcium)}>
      {[0,1,2,3,4,5].map((i) => {
        const angle = (-0.9 + i * 0.38);
        const distance = mix(405, 185 + i % 2 * 32, water);
        return <Ion key={`water-${i}`} x={1320 + Math.cos(angle) * distance} y={590 + Math.sin(angle) * distance} type="H2O" scale={0.87} />;
      })}
      <Arrow x1={1720} y1={565} x2={1536} y2={565} color="#87C9ED" progress={water} />
      <Label x={1695} y={435} text="H₂O enters" anchor="middle" color="#87C9ED" size={32} />
    </g>
    <g opacity={calcium}>
      <Ion x={1710} y={730} type="Ca" scale={1} />
      <Arrow x1={1663} y1={729} x2={1530} y2={688} color={gold} progress={calciumFailure} />
      <Label x={1655} y={835} text={['Ca²⁺ regulation', 'fails separately']} anchor="middle" color={gold} size={29} />
    </g>
  </SceneCanvas>;
};

const Glycogen: React.FC<{x: number; y: number; depletion: number}> = ({x,y,depletion}) => <g transform={`translate(${x} ${y})`}>
  {Array.from({length: 19}, (_,i) => {
    const ring = i === 0 ? 0 : i < 7 ? 1 : 2;
    const theta = i * 2.399;
    return <g key={i} opacity={Math.max(0.06, 1 - depletion * (1.1 + (i % 5) * 0.12))}>
      {i > 0 && <line x1="0" y1="0" x2={Math.cos(theta) * ring * 38} y2={Math.sin(theta) * ring * 38} stroke={gold} strokeWidth="3" />}
      <path d="M-13,-22 L13,-22 L26,0 L13,22 L-13,22 L-26,0Z" transform={`translate(${Math.cos(theta) * ring * 38} ${Math.sin(theta) * ring * 38})`} fill="#674D2E" stroke={gold} strokeWidth="3" />
    </g>;
  })}
</g>;

export const Glycolysis: React.FC<SceneProps> = ({sceneId}) => {
  const {frame, beat, word} = useEnergyScene(sceneId);
  const anaerobic = beat('glycolysis-backup', 38);
  const glycogen = beat('glycolysis-glycogen', 95);
  const lactate = word('glycolysis-glycogen', 'Lactate', 70);
  const ph = word('glycolysis-glycogen', 'pH', 55);
  const enzymes = beat('glycolysis-ph', 60);
  const chromatin = word('glycolysis-ph', 'clumping', 60);
  const caution = beat('glycolysis-caution', 50);
  const stream = (frame / 120) % 1;
  return <SceneCanvas sceneId={sceneId} footer={caution>.5 ? 'Acidosis impairs cell function; DNA injury is a separate mechanism.' : 'Anaerobic glycolysis gives limited ATP; accumulating lactate is associated with lower pH.'}>
    <g transform="translate(420 585)">
      <Cell scale={0.86} swelling={0.55} erSwelling={0.3} />
      <g opacity={chromatin}>
        {[[-50,-35],[3,-46],[-71,16],[1,29]].map(([x,y],i) => <ellipse key={i} cx={x} cy={y} rx="20" ry="11" fill="#ADB1F3" />)}
      </g>
    </g>
    <Label x={420} y={885} text="Oxygen supply ↓" color={injury} anchor="middle" size={34} />
    <g opacity={anaerobic}>
      <Arrow x1={635} y1={560} x2={780} y2={560} color={gold} progress={anaerobic} />
      <Label x={1170} y={325} text="Anaerobic glycolysis ↑" anchor="middle" size={43} />
      <Glycogen x={850} y={515} depletion={glycogen} />
      <Label x={850} y={682} text="Glycogen ↓" anchor="middle" color={gold} size={35} />
      <Arrow x1={958} y1={515} x2={1110} y2={515} color={gold} progress={anaerobic} />
      {[0,1,2].map((i) => <circle key={`glucose-${i}`} cx={mix(960,1110,(stream+i/3)%1)} cy="515" r="11" fill={gold} opacity={0.8 - glycogen * 0.3} />)}
      <g transform="translate(1190 515)">
        <path d="M0,-70 L61,-35 L61,35 L0,70 L-61,35 L-61,-35Z" fill="#204D54" stroke={cyan} strokeWidth="5" />
        <path d="M-30,0 H30 M12,-17 L30,0 L12,17" fill="none" stroke={cyan} strokeWidth="6" />
      </g>
      <Label x={1188} y={680} text="Limited ATP" anchor="middle" color={cyan} size={35} />
      <EnergyGauge x={1108} y={740} level={0.22} label="ATP" />
    </g>
    <g opacity={lactate}>
      <Arrow x1={1277} y1={515} x2={1430} y2={515} color={injury} progress={lactate} />
      {Array.from({length: 12}, (_,i) => <g key={i} transform={`translate(${1460 + (i % 4) * 61} ${420 + Math.floor(i / 4) * 74})`} opacity={Math.min(1,lactate * 1.5 - i * 0.035)}>
        <circle cx="-9" cy="0" r="10" fill={injury} />
        <circle cx="11" cy="0" r="10" fill={injury} />
        <circle cx="1" cy="-18" r="9" fill={injury} />
      </g>)}
      <Label x={1547} y={665} text="Lactate ↑" anchor="middle" color={injury} size={35} />
    </g>
    <g opacity={ph}>
      <path d="M1467,808 A85,85 0 0 1 1637,808" fill="none" stroke="#29434F" strokeWidth="17" />
      <path d="M1467,808 A85,85 0 0 1 1552,723" fill="none" stroke={injury} strokeWidth="17" />
      <line x1="1552" y1="808" x2={1552 + Math.cos(mix(-0.3,-2.5,ph)) * 70} y2={808 + Math.sin(mix(-0.3,-2.5,ph)) * 70} stroke={ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx="1552" cy="808" r="11" fill={ink} />
      <Label x={1552} y={878} text="pH ↓" anchor="middle" size={39} color={injury} />
      <Label x={1170} y={919} text="Enzyme activity ↓" anchor="middle" size={34} opacity={enzymes} />
    </g>
    <g opacity={chromatin}>
      <Arrow x1={678} y1={777} x2={440} y2={606} color="#ADB1F3" progress={chromatin} />
      <Label x={716} y={828} text={['Chromatin', 'may clump']} anchor="middle" color="#ADB1F3" size={30} />
    </g>
    <Label x={1210} y={381} text="Low pH ≠ automatic DNA breaks" anchor="middle" color="#ADB1F3" size={30} opacity={caution} />
  </SceneCanvas>;
};

const proteinPath = 'M0,0 q13,-24 24,-8 t24,-7 t24,5 t24,-4';

export const ProteinSynthesis: React.FC<SceneProps> = ({sceneId}) => {
  const {frame, beat, word} = useEnergyScene(sceneId);
  const rough = word('protein-workshop', 'zoom', 50);
  const detach = beat('protein-detach', 80);
  const translation = word('protein-detach', 'decreases', 55);
  const branches = beat('protein-branches', 50);
  const recover = word('protein-recover', 'returns', 75);
  const persistent = word('protein-recover', 'Persistent', 45);
  const branchProgress = [word('protein-branches', 'swelling', 35),word('protein-branches', 'pH', 35),word('protein-branches', 'production', 35)];
  const pulse = 0.7 + 0.3 * Math.sin(frame / 14);
  return <SceneCanvas sceneId={sceneId} footer="ATP depletion  →  ribosomes detach from rough ER  →  protein synthesis falls">
    <g transform="translate(440 565)">
      <Cell scale={0.88} ribosomeLoss={detach*(1-recover)} erSwelling={detach * 0.4*(1-recover)} />
    </g>
    <g opacity={1-branches}>
      <path d="M447,432 L814,365 M486,483 L814,695" fill="none" stroke={cyan} strokeWidth="2" opacity="0.38" />
      <circle cx="452" cy="460" r="72" fill="none" stroke={cyan} strokeWidth="3" strokeDasharray="9 7" />
      <Label x={1210} y={319} text="Rough endoplasmic reticulum" anchor="middle" color={cyan} size={38} />
    </g>
    <EnergyGauge x={310} y={830} level={1 - detach * 0.88*(1-recover)} label="ATP" />
    <g opacity={rough*(1-branches)} transform={`translate(${mix(452,1230,rough)} ${mix(460,570,rough)}) scale(${mix(.12,1,rough)}) translate(-1230 -570)`}>
      {[0,1,2].map((row) => <g key={`er-${row}`}>
        <path d={`M830,${443 + row * 85} Q1040,${384 + row * 85} 1280,${433 + row * 85} T1700,${447 + row * 85}`} fill="none" stroke={cyan} strokeWidth={17 + detach * 6} strokeLinecap="round" />
        <path d={`M830,${473 + row * 85} Q1040,${414 + row * 85} 1280,${463 + row * 85} T1700,${477 + row * 85}`} fill="none" stroke={cyan} strokeWidth={6 + detach * 3} strokeLinecap="round" opacity="0.65" />
      </g>)}
      {Array.from({length: 15}, (_,i) => {
        const row = Math.floor(i / 5);
        const column = i % 5;
        const baseX = 886 + column * 173;
        const baseY = 421 + row * 86 + Math.sin(column * 1.1) * 9;
        const moved = Math.min(1, Math.max(0, detach * 1.35 - i * 0.021));
        const x = mix(baseX, 890 + (i % 8) * 110, moved);
        const y = mix(baseY, 779 + Math.floor(i / 8) * 83, moved);
        return <g key={`ribosome-${i}`}>
          <g opacity={(1 - translation) * (1 - moved)} transform={`translate(${baseX-2} ${baseY-25}) scale(${pulse})`}>
            <path d={proteinPath} fill="none" stroke={gold} strokeWidth="5" strokeLinecap="round" />
          </g>
          <g transform={`translate(${x} ${y}) rotate(${moved * (i % 2 === 0 ? 25 : -20)})`}>
            <ellipse cx="0" cy="0" rx="19" ry="14" fill="#D49AB9" stroke="#F5CEE1" strokeWidth="3" />
            <ellipse cx="0" cy="16" rx="14" ry="9" fill="#B0789D" />
          </g>
        </g>;
      })}
      <Label x={880} y={710} text="Ribosomes" color="#F5CEE1" size={33} opacity={1 - detach * 0.4} />
      <Label x={1420} y={716} text="Nascent proteins" color={gold} size={32} opacity={1 - translation} />
    </g>
    <g opacity={detach*(1-branches)}>
      <Arrow x1={1110} y1={681} x2={1110} y2={773} color="#F5CEE1" progress={detach} />
      <Label x={1262} y={935} text="Protein synthesis ↓" anchor="middle" color={injury} size={42} opacity={translation} />
    </g>
    <Label x={440} y={940} text={recover>.3 ? 'Early removal: recovery possible' : 'Translation disrupted'} anchor="middle" color={recover>.3 ? theme.recovery : injury} size={29} opacity={detach} />
    <g opacity={branches}>
      <Label x={1280} y={326} text="One ATP deficit. Three branches." anchor="middle" size={39} />
      <EnergyGauge x={1155} y={386} level={0.14} label="ATP" />
      {[902,1262,1622].map((x,i)=><Arrow key={x} x1={1283} y1={520} x2={x} y2={660} color={injury} progress={branchProgress[i]} />)}
      <g transform="translate(902 744)" opacity={branchProgress[0]}>
        <path d="M-60,-35 Q-91,38 -25,57 Q60,88 82,8 Q87,-78 9,-74 Q-34,-83 -60,-35Z" fill={theme.cytoplasm} stroke={cyan} strokeWidth="6" />
        <Ion x={24} y={0} type="H2O" scale={1} />
      </g>
      <g opacity={branchProgress[1]}><Glycogen x={1262} y={744} depletion={0.8} /></g>
      <g transform="translate(1622 744)" opacity={branchProgress[2]}>
        <path d="M-93,16 Q0,-21 95,12" fill="none" stroke={cyan} strokeWidth="10" />
        <ellipse cx="-38" cy="-10" rx="22" ry="16" fill="#D49AB9" />
        <ellipse cx="34" cy="-41" rx="22" ry="16" fill="#D49AB9" />
      </g>
      <Label x={902} y={896} text="Swelling" anchor="middle" size={34} color={cyan} opacity={branchProgress[0]} />
      <Label x={1262} y={896} text="pH ↓" anchor="middle" size={34} color={gold} opacity={branchProgress[1]} />
      <Label x={1622} y={896} text="Protein synthesis ↓" anchor="middle" size={32} color="#F5CEE1" opacity={branchProgress[2]} />
      <Label x={1280} y={960} text="Persistent injury limits recovery" anchor="middle" size={30} color={injury} opacity={persistent} />
    </g>
  </SceneCanvas>;
};

const DNAFragment: React.FC<{x: number; y: number; damage: number}> = ({x,y,damage}) => <g transform={`translate(${x} ${y})`}>
  {[0,1,2,3,4,5].map((i) => <g key={i} transform={`translate(${damage * (i<3?-8:8)} ${i * 16})`}>
    <line x1={Math.sin(i * 1.4) * 29} y1="0" x2={-Math.sin(i * 1.4) * 29} y2="0" stroke="#AAAEEB" strokeWidth="4" opacity={damage > 0.3 && i === 3 ? 0 : 1} />
    <path d={`M${Math.sin(i * 1.4) * 29},0 L${Math.sin((i+1) * 1.4) * 29},16`} stroke="#939CE3" strokeWidth="5" opacity={damage > 0.3 && i === 3 ? 0 : 1} />
    <path d={`M${-Math.sin(i * 1.4) * 29},0 L${-Math.sin((i+1) * 1.4) * 29},16`} stroke="#DDD0F5" strokeWidth="5" opacity={damage > 0.3 && i === 3 ? 0 : 1} />
  </g>)}
</g>;

export const Calcium: React.FC<SceneProps> = ({sceneId}) => {
  const {beat, word} = useEnergyScene(sceneId);
  const influx = word('calcium-rise', 'entry', 50);
  const stores = word('calcium-rise', 'stores', 55);
  const lipids = beat('calcium-lipids', 65);
  const proteases = word('calcium-lipids', 'Proteases', 55);
  const dna = beat('calcium-dna', 60);
  const atpases = word('calcium-dna', 'ATPases', 55);
  const mitochondria = beat('calcium-death', 55);
  const apoptosis = word('calcium-death', 'caspases', 60);
  const pool = Math.max(influx, stores);
  const cellX = mix(960, 430, pool);
  const enzymeXs = [268, 688, 1108, 1528];
  const targetProgress = [atpases,lipids,proteases,dna];
  return <SceneCanvas sceneId={sceneId} footer="Calcium dysregulation amplifies damage; apoptosis depends on the cell and injury context.">
    <g transform={`translate(${cellX-430} 0)`}>
    <g transform="translate(430 485)">
      <Cell scale={0.64} />
      {[0,1,2].map((i) => <Ion key={`stored-${i}`} x={mix(20 + i * 15,75 + i * 12,stores)} y={mix(-81,-20 + i * 15,stores)} type="Ca" scale={0.46} opacity={1} />)}
    </g>
    <Label x={430} y={276} text="Extracellular Ca²⁺" anchor="middle" color={gold} size={30} />
    {[0,1,2].map((i) => <Ion key={`extra-${i}`} x={360 + i * 70} y={mix(311,443+i*18,influx)} type="Ca" scale={0.69} />)}
    <Arrow x1={430} y1={316} x2={430} y2={435} color={gold} progress={influx} />
    <Label x={242} y={735} text={['Ischemia', 'or toxins']} color={injury} size={31} />
    <Label x={569} y={639} text="ER stores" color={cyan} size={29} opacity={stores} />
    <Arrow x1={465} y1={430} x2={510} y2={516} color={gold} progress={stores} />
    </g>
    <Arrow x1={cellX+215} y1={490} x2={822} y2={490} color={gold} progress={Math.max(0,(pool-.85)/.15)} />
    <g opacity={Math.max(0,(pool-.7)/.3)}>
      <Label x={994} y={315} text="Cytosol detail" anchor="middle" color={cyan} size={29} />
      <circle cx="994" cy="461" r="111" fill="#564323" stroke={gold} strokeWidth="3" opacity="0.5" />
      {Array.from({length: 7},(_,i) => <Ion key={`pool-${i}`} x={994 + Math.cos(i*2.399)*((i%3)*28+8)} y={461 + Math.sin(i*2.399)*((i%3)*28+8)} type="Ca" scale={0.62} />)}
      <Label x={994} y={616} text="Cytosolic Ca²⁺ ↑" anchor="middle" color={gold} size={39} />
    </g>
    <g>
      {enzymeXs.map((x,i) => <Arrow key={x} x1={994} y1={645} x2={x} y2={746} color={gold} progress={targetProgress[i]} width={3} />)}
      {['ATPase','Phospholipase','Protease','Endonuclease'].map((name,i) => <Label key={name} x={enzymeXs[i]} y={791} text={name} anchor="middle" color={gold} size={33} opacity={targetProgress[i]} />)}
      <g opacity={atpases}><EnergyGauge x={145} y={844} level={1 - atpases * 0.8} label="ATP ↓" /></g>
      <g transform="translate(688 854)" opacity={lipids}>
        {Array.from({length: 9},(_,i) => <g key={i} opacity={lipids > 0.3 && (i === 4 || i === 5) ? 1 - lipids : 1}>
          <circle cx={-104+i*26} cy="0" r="8" fill={cyan} />
          <circle cx={-104+i*26} cy="38" r="8" fill={cyan} />
          <path d={`M${-104+i*26},8 v22`} stroke={cyan} strokeWidth="3" />
        </g>)}
      </g>
      <g transform="translate(1108 874)" opacity={proteases}>
        <path d={`M-92,11 Q-48,-39 -17,0 ${proteases < .45 ? 'T23,0' : 'M29,0'} Q57,39 100,-12`} stroke="#BEBEDF" strokeWidth="8" fill="none" />
        <path d={`M-87,-17 Q-34,36 -11,-12 ${proteases < .45 ? 'T25,0' : 'M31,0'} Q65,-34 92,21`} stroke="#727CBC" strokeWidth="7" fill="none" />
      </g>
      <g opacity={dna}><DNAFragment x={1528} y={824} damage={dna} /></g>
      <Label x={688} y={948} text="Membrane lipids" anchor="middle" color={cyan} size={28} opacity={lipids} />
      <Label x={1108} y={948} text="Proteins / cytoskeleton" anchor="middle" color="#BEBEDF" size={28} opacity={proteases} />
      <Label x={1528} y={948} text="DNA" anchor="middle" color="#AAAEEB" size={28} opacity={dna} />
    </g>
    <g opacity={mitochondria}>
      <Arrow x1={1125} y1={418} x2={1350} y2={418} color={gold} progress={mitochondria} />
      <Mitochondrion x={1515} y={415} scale={1.7} />
      <Label x={1515} y={294} text="Mitochondrial dysfunction" anchor="middle" color={injury} size={29} />
      <Label x={1515} y={541} text="ATP generation ↓" anchor="middle" color={injury} size={33} />
    </g>
    <g opacity={apoptosis}>
      <Arrow x1={1630} y1={437} x2={1744} y2={437} color={injury} progress={apoptosis} />
      <circle cx="1768" cy="437" r="26" fill="#763D47" stroke={injury} strokeWidth="3" />
      <Label x={1700} y={612} text={['Caspase signals', 'may activate']} anchor="middle" color={injury} size={28} />
    </g>
  </SceneCanvas>;
};
