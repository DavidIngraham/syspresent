"""Validate the specification using a caller-provisioned native OpenSysML CLI."""
import argparse
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--sysml", default="sysml", help="Path to a pinned OpenSysML executable")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
raise SystemExit(subprocess.run([args.sysml, "-validate", str(root / "model")]).returncode)
