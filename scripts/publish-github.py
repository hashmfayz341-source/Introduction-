"""Publish exact local Git objects through the Git Data API when HTTPS push fails.

The normal gh credential is used. No credential is read or printed. All objects
must retain their Git SHA. Ref updates are fast-forward only; no source or local
commit is rewritten. This script only targets the project's permanent repository.
"""
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import json
import re
import subprocess

REPO = "hashmfayz341-source/Introduction-"


def git(*args):
    return subprocess.check_output(["git", *args])


def api(endpoint, payload=None, method=None):
    args = ["gh", "api", f"repos/{REPO}/{endpoint}"]
    if payload is not None:
        args += ["--method", method or "POST", "--input", "-"]
    result = subprocess.run(args, input=json.dumps(payload) if payload is not None else None,
                            text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return json.loads(result.stdout)


def identity(text):
    match = re.fullmatch(r"(.*) <(.*)> (\d+) ([+-]\d{4})", text)
    if not match:
        raise ValueError("Unsupported Git identity")
    name, email, stamp, offset = match.groups()
    minutes = (int(offset[1:3]) * 60 + int(offset[3:])) * (1 if offset[0] == "+" else -1)
    date = datetime.fromtimestamp(int(stamp), timezone(timedelta(minutes=minutes))).isoformat()
    return {"name": name, "email": email, "date": date}


def upload_blob(entry):
    content = git("cat-file", "blob", entry["sha"])
    result = api("git/blobs", {"content": base64.b64encode(content).decode(), "encoding":"base64"})
    if result["sha"] != entry["sha"]:
        raise ValueError(f"Blob changed: {entry['path']}")
    return entry


def publish_commit(sha):
    raw = git("cat-file", "commit", sha).decode()
    headers, message = raw.split("\n\n", 1)
    if "\ngpgsig " in headers or "\nencoding " in headers:
        raise ValueError("Signed or non-UTF8 commits require a different publishing route")
    fields = {}
    parents = []
    for line in headers.splitlines():
        key, value = line.split(" ", 1)
        if key == "parent":
            parents.append(value)
        else:
            fields[key] = value
    entries = []
    for record in git("ls-tree", "-rz", sha).split(b"\x00"):
        if not record:
            continue
        head, filename = record.split(b"\t", 1)
        mode, kind, object_sha = head.decode().split()
        if kind != "blob":
            raise ValueError("Submodules are not supported by this publishing route")
        entries.append({"path":filename.decode(), "mode":mode, "type":kind, "sha":object_sha})
    with ThreadPoolExecutor(max_workers=4) as pool:
        entries = list(pool.map(upload_blob, entries))
    tree = api("git/trees", {"tree":entries})
    if tree["sha"] != fields["tree"]:
        raise ValueError("Remote tree SHA differs from the complete local tree")
    result = api("git/commits", {"tree":tree["sha"], "parents":parents, "message":message,
                               "author":identity(fields["author"]), "committer":identity(fields["committer"])})
    if result["sha"] != sha:
        raise ValueError(f"Remote commit differs: expected {sha}, received {result['sha']}")
    print(f"Verified exact Git commit: {sha}", flush=True)


def main():
    origin = git("remote", "get-url", "origin").decode().strip()
    if origin.removesuffix(".git") != f"https://github.com/{REPO}":
        raise ValueError("Origin differs from the authorized permanent repository")
    if git("branch", "--show-current").decode().strip() != "main":
        raise ValueError("Only the existing main branch may be published")
    target = git("rev-parse", "HEAD").decode().strip()
    remote = api("git/ref/heads/main")["object"]["sha"]
    if remote == target:
        print(f"Remote already matches: {target}")
        return
    subprocess.run(["git", "merge-base", "--is-ancestor", remote, target], check=True)
    commits = git("rev-list", "--reverse", f"{remote}..{target}").decode().splitlines()
    for commit in commits:
        publish_commit(commit)
    api("git/refs/heads/main", {"sha":target, "force":False}, method="PATCH")
    verified = api("git/ref/heads/main")["object"]["sha"]
    if verified != target:
        raise ValueError("Remote main did not retain the intended commit")
    print(f"Remote main verified: {verified}")


if __name__ == "__main__":
    main()
