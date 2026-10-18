"""Build declarative examples into an append-only static review catalog."""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from scripts.snapshots import verify


def run(*args, cwd=ROOT):
    subprocess.run([str(arg) for arg in args], cwd=cwd, check=True)


def clean_revision(path, expected=None):
    revision = subprocess.check_output(["git", "-C", str(path), "rev-parse", "HEAD"], text=True).strip()
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        raise ValueError("A full Git commit is required")
    if subprocess.check_output(["git", "-C", str(path), "status", "--porcelain"], text=True).strip():
        raise ValueError(f"Publication input checkout is dirty: {path}")
    if expected and revision != expected:
        raise ValueError(f"Native checkout differs from configured pin: {expected}")
    return revision


def verify_site(path):
    path = Path(path)
    catalog = path / "catalog.json"
    if not catalog.is_file():
        raise ValueError("Previous history must contain catalog.json")
    entries = json.loads(catalog.read_text())["reviews"]
    for snapshot in (path / "snapshots").iterdir():
        if snapshot.is_dir():
            verify(snapshot)
    for entry in entries:
        verify(path / "snapshots" / entry["snapshotId"])
    return entries


def restore_site(source, output):
    source, output = Path(source).resolve(), Path(output).resolve()
    verify_site(source)
    for entry in source.rglob("*"):
        if entry.relative_to(source).parts[0] != ".git" and entry.is_symlink():
            raise ValueError("History symlinks are forbidden")
    if output.exists() and any(output.iterdir()):
        raise ValueError("Restore destination must be empty; never mix or replace history")
    output.mkdir(parents=True, exist_ok=True)
    for child in source.iterdir():
        if child.name == ".git":
            continue
        if child.is_symlink():
            raise ValueError("History symlinks are forbidden")
        if child.is_dir():
            shutil.copytree(child, output / child.name)
        else:
            shutil.copy2(child, output / child.name)
    verify_site(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--example", action="append", required=True, help="Directory containing declarative project.json and story.md (or story-draft.md)")
    parser.add_argument("--output", required=True)
    parser.add_argument("--work", default="build/ci")
    parser.add_argument("--previous-site", help="Previously published pages-history checkout, verified before copying")
    args = parser.parse_args()
    viewer_revision = clean_revision(ROOT)
    native = Path(os.environ["OPENSYSML_SOURCE"]).resolve()
    binary = Path(os.environ["OPENSYSML_BINARY"]).resolve()
    if not binary.is_file():
        raise ValueError("Pinned native binary does not exist")
    examples = []
    for name in args.example:
        directory = (ROOT / name).resolve()
        if not directory.is_relative_to(ROOT / "examples"):
            raise ValueError("Example must be inside the repository examples directory")
        config = json.loads((directory / "project.json").read_text())
        pin = config["nativeToolRevision"]
        if not re.fullmatch(r"[0-9a-f]{40}", pin):
            raise ValueError("project.json must pin the exact 40-character native revision")
        clean_revision(native, pin)
        story = directory / config.get("story", "story.md")
        if not story.is_file() and "story" not in config:
            story = directory / "story-draft.md"
        if not story.is_file():
            raise ValueError(f"Missing declared story in {directory}")
        examples.append((directory, config, story))
    output, work = Path(args.output).resolve(), Path(args.work).resolve()
    if args.previous_site:
        restore_site(args.previous_site, output)
    elif output.exists() and any(output.iterdir()):
        raise ValueError("Use an empty output directory or explicitly restore prior history")
    work.mkdir(parents=True, exist_ok=True)
    browser = work / "browser"
    browser_ready = False
    for directory, config, story in examples:
        exported = work / directory.name
        # Export and shard in the same process: never serialize/reload the large
        # unsharded API tree between these stages.
        run(sys.executable, ROOT / "scripts/native_export.py", "--config", directory / "project.json", "--shard", "--output", exported)
        if not browser_ready:
            run("node", ROOT / "scripts/build_browser.mjs", browser)
            browser_ready = True
        assets = exported / "assets"
        assets.mkdir(exist_ok=True)
        # Include model/evidence content in the review ID, because an external
        # model pin may change independently of this viewer commit.
        bundle = json.loads((exported / "bundle.json").read_text())
        import hashlib
        identity = hashlib.sha256(json.dumps(bundle["provenance"], sort_keys=True, separators=(",", ":")).encode()).hexdigest()[:16]
        review_id = f"{directory.name}-{viewer_revision[:16]}-{identity}"
        run(sys.executable, ROOT / "scripts/package_review.py", "--bundle", exported / "bundle.json",
            "--story", story, "--browser", browser, "--assets", assets, "--output", output,
            "--review-id", review_id, "--status", "draft", "--title", config.get("title", directory.name),
            "--model-root", directory, "--native-binary", binary)
    verify_site(output)
    print(f"Validated immutable review catalog: {output}")


if __name__ == "__main__":
    main()
