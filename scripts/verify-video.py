"""Verify the encoded deliverable against the real narration master; no source edits."""
import hashlib
import json
from pathlib import Path
import subprocess
import argparse
import numpy as np

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('video',nargs='?',default='out/cell-injury.mp4')
parser.add_argument('--timeline',default='src/data/timeline.json')
parser.add_argument('--record',default='qa/final.json')
args=parser.parse_args()
video=Path(args.video)
timeline=json.loads(Path(args.timeline).read_text())
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video')
a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['codec_name'],v['width'],v['height'],v['r_frame_rate'],v['pix_fmt'])==('h264',1920,1080,'30/1','yuv420p')
assert v['color_space']=='bt709' and v['color_transfer']=='bt709' and v['color_primaries']=='bt709'
assert int(v['nb_frames'])==timeline['durationInFrames']
assert a['codec_name']=='aac' and int(a['channels']) in (1,2)
assert abs(float(v['duration'])-timeline['durationInFrames']/30)<.001
assert abs(float(a['duration'])-timeline['durationSeconds'])<1/30

def decoded(path):
    raw=subprocess.check_output(['ffmpeg','-v','error','-xerror','-i',str(path),'-vn','-ar','8000','-ac','1','-f','s16le','pipe:1'])
    return np.frombuffer(raw,dtype='<i2').astype(np.float64)
master=decoded(Path('public')/timeline['audioPath'])
encoded=decoded(video)
results=[]
for scene in timeline['scenes']:
    sec=scene['startFrame']/30+4
    start=round(sec*8000);length=8000;lag=400
    reference=master[start:start+length]
    search=encoded[start-lag:start+length+lag]
    values=np.correlate(search,reference,mode='valid')
    energy=np.cumsum(np.concatenate(([0.],search**2)))
    denominators=np.sqrt((energy[length:]-energy[:-length])*np.dot(reference,reference))
    scores=values/np.maximum(denominators,1e-12)
    index=int(np.argmax(scores));offset=(index-lag)/8000
    assert scores[index]>.97, f"Audio mismatch in {scene['id']}: {scores[index]}"
    assert abs(offset)<1/30, f"Audio displacement in {scene['id']}: {offset}s"
    results.append({'scene':scene['id'],'atSeconds':sec,'lagSeconds':offset,'correlation':float(scores[index])})
record={
 'renderedFromCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
 'path':str(video),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),
 'bytes':video.stat().st_size,'frames':int(v['nb_frames']),'durationSeconds':float(v['duration']),
 'width':v['width'],'height':v['height'],'fps':v['r_frame_rate'],'pixelFormat':v['pix_fmt'],
 'videoCodec':v['codec_name'],'audioCodec':a['codec_name'],'audioChannels':a['channels'],
 'audioSampleRate':int(a['sample_rate']),'audioDurationSeconds':float(a['duration']),
 'colorSpace':v['color_space'],'audioComparisons':results,
 'maxAudioLagSeconds':max(abs(r['lagSeconds']) for r in results),
 'minimumAudioCorrelation':min(r['correlation'] for r in results),
}
Path(args.record).parent.mkdir(parents=True,exist_ok=True)
Path(args.record).write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({k:record[k] for k in ['frames','durationSeconds','bytes','maxAudioLagSeconds','minimumAudioCorrelation']},indent=2))
