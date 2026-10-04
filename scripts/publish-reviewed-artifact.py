"""Transfer an already reviewed MP4 to a GitHub release without local raw uploads.

The existing repository and main history are never changed. Small Git blobs are
read by a temporary branch workflow; the GitHub runner verifies the exact bytes,
uploads/downloads the release asset, then publishes the verified release.
"""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import re
import subprocess

REPO = "hashmfayz341-source/Introduction-"
ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def api(endpoint, payload=None):
    command = ["gh", "api", f"repos/{REPO}/{endpoint}"]
    if payload is not None:
        command += ["--method", "POST", "--input", "-"]
    result = subprocess.run(command, input=json.dumps(payload) if payload is not None else None,
                            cwd=ROOT, capture_output=True, text=True, timeout=90)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or result.stdout[:1000])
    return json.loads(result.stdout)


def blob(data):
    expected = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
    result = api("git/blobs", {"content":base64.b64encode(data).decode(), "encoding":"base64"})
    if result["sha"] != expected:
        raise ValueError("Uploaded chunk SHA differs from the exact local bytes")
    return expected


def validate_media(path, timeline_path):
    result = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format",
                             "-of", "json", str(path)], check=True, capture_output=True,
                            text=True, timeout=30)
    metadata = json.loads(result.stdout)
    video = next(stream for stream in metadata["streams"] if stream["codec_type"] == "video")
    next(stream for stream in metadata["streams"] if stream["codec_type"] == "audio")
    if (video["width"], video["height"]) != (1920,1080) or Fraction(video["avg_frame_rate"]) != 30:
        raise ValueError("Artifact does not match the required 1920×1080 at 30 fps")
    timeline = json.loads(ROOT.joinpath(timeline_path).read_text())
    expected_duration = timeline["durationInFrames"] / timeline["fps"]
    if abs(float(metadata["format"]["duration"]) - expected_duration) > 0.1:
        raise ValueError("Video duration differs from the measured narration timeline")
    if "nb_frames" in video and int(video["nb_frames"]) != timeline["durationInFrames"]:
        raise ValueError("Artifact video frame count is incomplete")
    return metadata


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifact", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    parser.add_argument("--release-tag", required=True)
    parser.add_argument("--release-title", required=True)
    parser.add_argument("--notes-file", type=Path, required=True)
    parser.add_argument("--timeline", default="src/data/timeline.json")
    parser.add_argument("--qa-record", default="qa/final.json")
    parser.add_argument("--audio", type=Path)
    args = parser.parse_args()
    if not re.fullmatch(r"[0-9a-f]{40}", args.source_commit):
        raise ValueError("Expected an exact final source commit SHA")
    if git("rev-parse", "HEAD") != args.source_commit or git("branch", "--show-current") != "main":
        raise ValueError("Local main is not at the reviewed final source commit")
    if git("remote", "get-url", "origin").removesuffix(".git") != f"https://github.com/{REPO}":
        raise ValueError("Origin differs from the authorized repository")
    if git("status", "--porcelain"):
        raise ValueError("Commit reviewed source changes before publishing the final artifact")
    if api("git/ref/heads/main")["object"]["sha"] != args.source_commit:
        raise ValueError("Remote main differs from the reviewed final source commit")
    path = args.artifact.resolve()
    metadata = validate_media(path, args.timeline)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    size = path.stat().st_size
    reviewed = json.loads(ROOT.joinpath(args.qa_record).read_text())
    if (digest, size) != (reviewed["sha256"], reviewed["bytes"]):
        raise ValueError("Artifact differs from the encoded file that passed final QA")
    subprocess.run(["git", "diff", "--exit-code", reviewed["renderedFromCommit"],
                    args.source_commit, "--", "src", "public", "remotion.config.ts",
                    "package.json", "package-lock.json"], cwd=ROOT, check=True)
    branch = f"publication/release-{args.source_commit[:12]}"
    parts = []
    with path.open("rb") as stream:
        while content := stream.read(2_000_000):
            parts.append(content)

    def upload(item):
        index, content = item
        sha = blob(content)
        print(f"Verified artifact part {index+1}/{len(parts)}: {len(content):,} bytes ({sha})", flush=True)
        return {"sha":sha, "size":len(content)}

    with ThreadPoolExecutor(max_workers=2) as pool:
        uploaded = list(pool.map(upload, enumerate(parts)))
    manifest = {"sourceCommit":args.source_commit, "name":path.name, "size":size,
                "sha256":digest, "releaseTag":args.release_tag,
                "releaseTitle":args.release_title, "notes":args.notes_file.read_text(),
                "duration":float(metadata["format"]["duration"]), "parts":uploaded}
    if args.audio:
        audio = args.audio.resolve()
        timeline = json.loads(ROOT.joinpath(args.timeline).read_text())
        if audio != ROOT.joinpath("public", timeline["audioPath"]).resolve():
            raise ValueError("Release audio must be the measured master in the reviewed source")
        audio_digest = hashlib.sha256(audio.read_bytes()).hexdigest()
        if audio_digest != timeline["audioSha256"]:
            raise ValueError("Release audio master fingerprint changed")
        manifest["audio"] = {"sourcePath":str(audio.relative_to(ROOT)),"name":audio.name,
                              "sha256":audio_digest,"size":audio.stat().st_size}
    manifest_data = (json.dumps(manifest, indent=2)+"\n").encode()
    workflow = '''name: Publish verified Cell Injury MP4
on:
  push:
    branches:
      - BRANCH_NAME
permissions:
  contents: write
jobs:
  publish:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - name: Ensure media metadata tools
        run: |
          if ! command -v ffprobe >/dev/null; then
            sudo apt-get update
            sudo apt-get install -y ffmpeg
          fi
      - name: Reconstruct, verify, and publish reviewed video
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          python3 - <<'RELEASE'
          import base64, hashlib, json, os, pathlib, subprocess
          manifest = json.loads(pathlib.Path('.publication/artifact-manifest.json').read_text())
          directory = pathlib.Path(os.environ['RUNNER_TEMP']) / 'cell-injury-final-release'
          directory.mkdir()
          video = directory / manifest['name']
          repository = os.environ['GITHUB_REPOSITORY']
          with video.open('wb') as output:
              for part in manifest['parts']:
                  endpoint = 'repos/' + repository + '/git/blobs/' + part['sha']
                  result = subprocess.run(['gh','api',endpoint], check=True, capture_output=True, text=True, timeout=90)
                  data = json.loads(result.stdout)
                  content = base64.b64decode(data['content'])
                  assert data['sha'] == part['sha'] and len(content) == part['size']
                  output.write(content)
          assert video.stat().st_size == manifest['size']
          assert hashlib.sha256(video.read_bytes()).hexdigest() == manifest['sha256']
          probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)], text=True))
          picture = next(stream for stream in probe['streams'] if stream['codec_type'] == 'video')
          next(stream for stream in probe['streams'] if stream['codec_type'] == 'audio')
          assert (picture['width'],picture['height']) == (1920,1080)
          assert abs(float(probe['format']['duration']) - manifest['duration']) < 0.1
          remote = subprocess.check_output(['git','ls-remote','origin','refs/heads/main'], text=True).split()[0]
          assert remote == manifest['sourceCommit']
          notes = directory / 'release-notes.md'
          notes.write_text(manifest['notes'])
          subprocess.run(['gh','release','create',manifest['releaseTag'],'--repo',repository,'--target',manifest['sourceCommit'],'--draft','--title',manifest['releaseTitle'],'--notes-file',str(notes)], check=True)
          subprocess.run(['gh','release','upload',manifest['releaseTag'],str(video),'--repo',repository], check=True)
          if manifest.get('audio'):
              audio_manifest = manifest['audio']
              audio = pathlib.Path(audio_manifest['sourcePath'])
              assert audio.stat().st_size == audio_manifest['size']
              assert hashlib.sha256(audio.read_bytes()).hexdigest() == audio_manifest['sha256']
              subprocess.run(['gh','release','upload',manifest['releaseTag'],str(audio),'--repo',repository], check=True)
          verification = directory / 'download-verification'
          verification.mkdir()
          subprocess.run(['gh','release','download',manifest['releaseTag'],'--repo',repository,'--pattern',manifest['name'],'--dir',str(verification)], check=True)
          downloaded = verification / manifest['name']
          assert downloaded.stat().st_size == manifest['size']
          assert hashlib.sha256(downloaded.read_bytes()).hexdigest() == manifest['sha256']
          if manifest.get('audio'):
              subprocess.run(['gh','release','download',manifest['releaseTag'],'--repo',repository,'--pattern',audio_manifest['name'],'--dir',str(verification)], check=True)
              downloaded_audio = verification / audio_manifest['name']
              assert downloaded_audio.stat().st_size == audio_manifest['size']
              assert hashlib.sha256(downloaded_audio.read_bytes()).hexdigest() == audio_manifest['sha256']
          subprocess.run(['gh','release','edit',manifest['releaseTag'],'--repo',repository,'--draft=false','--latest'], check=True)
          release = json.loads(subprocess.check_output(['gh','api','repos/'+repository+'/releases/tags/'+manifest['releaseTag']], text=True))
          assert release['draft'] is False
          asset = next(asset for asset in release['assets'] if asset['name'] == manifest['name'])
          assert asset['size'] == manifest['size'] and asset['state'] == 'uploaded'
          if asset.get('digest'):
              assert asset['digest'] == 'sha256:' + manifest['sha256']
          print('Verified release asset:', asset['browser_download_url'])
          print('Artifact SHA256:', manifest['sha256'])
          print('Final source commit:', manifest['sourceCommit'])
          RELEASE
'''.replace("BRANCH_NAME",branch)
    temporary = ROOT / "qa/temp/publication"
    temporary.mkdir(parents=True, exist_ok=True)
    temporary.joinpath("artifact-manifest.json").write_bytes(manifest_data)
    temporary.joinpath("publish-artifact.yml").write_text(workflow)
    manifest_sha, workflow_sha = blob(manifest_data), blob(workflow.encode())
    base = api("git/commits/"+args.source_commit)
    tree = api("git/trees", {"base_tree":base["tree"]["sha"], "tree":[
        {"path":".publication/artifact-manifest.json","mode":"100644","type":"blob","sha":manifest_sha},
        {"path":".github/workflows/publish-artifact.yml","mode":"100644","type":"blob","sha":workflow_sha}]})
    commit = api("git/commits", {"message":"Publish checksum-verified reviewed Cell Injury video release",
                                 "tree":tree["sha"], "parents":[args.source_commit]})
    if api("git/ref/heads/main")["object"]["sha"] != args.source_commit:
        raise ValueError("Remote main advanced during artifact transfer")
    api("git/refs", {"ref":"refs/heads/"+branch,"sha":commit["sha"]})
    print("Temporary artifact workflow branch:",branch,flush=True)
    print("Remote main remains:",args.source_commit,flush=True)
    print("Expected artifact SHA256:",digest,flush=True)


if __name__ == "__main__":
    main()
