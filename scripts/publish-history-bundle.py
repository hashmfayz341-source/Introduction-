"""Publish exact local main via a verified incremental Git bundle/Actions runner.

For environments where Git HTTPS fails but GitHub API/Actions writes work. Only
the permanent repository is allowed. No local files/refs/commits are rewritten;
main updates are ordinary fast-forwards and require the expected remote base.
"""
import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
REPO = "hashmfayz341-source/Introduction-"


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


def blob(content):
    expected = hashlib.sha1(b"blob "+str(len(content)).encode()+b"\0"+content).hexdigest()
    result = api("git/blobs", {"content":base64.b64encode(content).decode(), "encoding":"base64"})
    if result["sha"] != expected:
        raise ValueError("Transferred Git blob differs from local bytes")
    return expected


def main():
    if git("branch", "--show-current") != "main" or git("status", "--porcelain"):
        raise ValueError("Publish committed, clean local main only")
    if git("remote", "get-url", "origin").removesuffix(".git") != f"https://github.com/{REPO}":
        raise ValueError("Origin differs from the authorized permanent repository")
    target = git("rev-parse", "HEAD")
    baseline = api("git/ref/heads/main")["object"]["sha"]
    if baseline == target:
        print("Remote main already verified:", target)
        return
    subprocess.run(["git", "merge-base", "--is-ancestor", baseline, target], cwd=ROOT, check=True)
    branch = f"publication/history-{target[:12]}"
    temporary = ROOT / "qa/temp/publication"
    temporary.mkdir(parents=True, exist_ok=True)
    bundle = temporary / f"history-{target[:12]}.bundle"
    subprocess.run(["git", "bundle", "create", str(bundle), "main", "^"+baseline], cwd=ROOT, check=True)
    subprocess.run(["git", "bundle", "verify", str(bundle)], cwd=ROOT, check=True)
    content = bundle.read_bytes()
    chunks = [content[i:i+2_000_000] for i in range(0, len(content), 2_000_000)]

    def upload(item):
        index, chunk = item
        sha = blob(chunk)
        print(f"Verified history part {index+1}/{len(chunks)}: {len(chunk):,} bytes", flush=True)
        return {"sha":sha, "size":len(chunk)}

    with ThreadPoolExecutor(max_workers=2) as pool:
        parts = list(pool.map(upload, enumerate(chunks)))
    manifest = {"target":target, "expectedBase":baseline,
                "sha256":hashlib.sha256(content).hexdigest(), "size":len(content),
                "commitCount":int(git("rev-list", "--count", "main")),
                "commits":git("rev-list", "--reverse", "main").splitlines(), "parts":parts}
    manifest_bytes = (json.dumps(manifest, indent=2)+"\n").encode()
    workflow = '''name: Publish exact Cell Injury main history
on:
  push:
    branches:
      - BRANCH_NAME
permissions:
  contents: write
concurrency:
  group: cell-injury-exact-history-publication
  cancel-in-progress: false
jobs:
  publish:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Verify bundle and fast-forward the existing main
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          python3 - <<'TRANSFER'
          import base64, hashlib, json, os, pathlib, subprocess
          manifest = json.loads(pathlib.Path('.publication/history-manifest.json').read_text())
          destination = pathlib.Path(os.environ['RUNNER_TEMP']) / 'cell-injury-current-history.bundle'
          repository = os.environ['GITHUB_REPOSITORY']
          with destination.open('wb') as output:
              for part in manifest['parts']:
                  result = subprocess.run(['gh','api','repos/'+repository+'/git/blobs/'+part['sha']], check=True, capture_output=True, text=True, timeout=90)
                  data = json.loads(result.stdout)
                  content = base64.b64decode(data['content'])
                  assert data['sha'] == part['sha'] and len(content) == part['size']
                  output.write(content)
          assert destination.stat().st_size == manifest['size']
          assert hashlib.sha256(destination.read_bytes()).hexdigest() == manifest['sha256']
          subprocess.run(['git','bundle','verify',str(destination)], check=True)
          subprocess.run(['git','fetch',str(destination),'refs/heads/main:refs/remotes/publication/main'], check=True)
          target = subprocess.check_output(['git','rev-parse','refs/remotes/publication/main'], text=True).strip()
          assert target == manifest['target']
          commits = subprocess.check_output(['git','rev-list','--reverse',target], text=True).splitlines()
          assert commits == manifest['commits'] and len(commits) == manifest['commitCount']
          subprocess.run(['git','fsck','--full','--no-reflogs'], check=True)
          current = subprocess.check_output(['git','ls-remote','origin','refs/heads/main'], text=True).split()[0]
          assert current == manifest['expectedBase'], 'Remote main changed; refusing publication'
          subprocess.run(['git','merge-base','--is-ancestor',current,target], check=True)
          subprocess.run(['git','push','origin','refs/remotes/publication/main:refs/heads/main'], check=True)
          remote = subprocess.check_output(['git','ls-remote','origin','refs/heads/main'], text=True).split()[0]
          assert remote == manifest['target']
          print('Verified remote main:', remote)
          print('Exact history preserved:', len(commits), 'commits')
          TRANSFER
'''.replace("BRANCH_NAME", branch)
    temporary.joinpath(f"history-manifest-{target[:12]}.json").write_bytes(manifest_bytes)
    temporary.joinpath(f"transfer-history-{target[:12]}.yml").write_text(workflow)
    base = api("git/commits/"+baseline)
    tree = api("git/trees", {"base_tree":base["tree"]["sha"], "tree":[
        {"path":".publication/history-manifest.json","mode":"100644","type":"blob","sha":blob(manifest_bytes)},
        {"path":".github/workflows/transfer-history.yml","mode":"100644","type":"blob","sha":blob(workflow.encode())}]})
    commit = api("git/commits", {"message":"Transfer verified exact Cell Injury history to existing main",
                                 "tree":tree["sha"],"parents":[baseline]})
    if api("git/ref/heads/main")["object"]["sha"] != baseline:
        raise ValueError("Remote main changed during transfer; no ref has been updated")
    api("git/refs", {"ref":"refs/heads/"+branch,"sha":commit["sha"]})
    print("Temporary history workflow branch:", branch, flush=True)
    print("Expected remote main after successful workflow:", target, flush=True)
    print("Full existing commit count:", manifest["commitCount"], flush=True)


if __name__ == "__main__":
    main()
