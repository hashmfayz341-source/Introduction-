"""Decode the complete MP4, checking errors and extracting real encoded QA states."""
from pathlib import Path
import json
import shutil
import subprocess
import argparse

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--manifest',default='qa/encoded-states.json')
parser.add_argument('--video',default='out/cell-injury.mp4')
parser.add_argument('--output',default='qa/frames/encoded')
args=parser.parse_args()
manifest=json.loads(Path(args.manifest).read_text())
base=Path(args.output);base.mkdir(parents=True,exist_ok=True)
unique=sorted(set(r['globalFrame'] for r in manifest))
expression='+'.join(f'eq(n,{frame})' for frame in unique)
subprocess.run(['ffmpeg','-v','error','-xerror','-y','-i',args.video,'-map','0:v:0','-vf',f"select='{expression}'",
                '-fps_mode','vfr','-q:v','2',str(base/'frame-%03d.jpg')],check=True)
for r in manifest:
    target=base/r['scene']/f"{r['state']}.jpg";target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(str(base/f"frame-{unique.index(r['globalFrame'])+1:03d}.jpg"),target)
    r['output']=str(target.resolve())
(base/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
for frame in base.glob('frame-*.jpg'):frame.unlink()
print(f'Full MP4 decoded without errors; {len(manifest)} encoded representative frames extracted.')
