#!/usr/bin/env python3
"""Copy a private text file into the public tree with names, hosts and paths replaced. The child-name list is read
from the untracked WW_NAMES_FILE (never committed). Always follow with scripts/public_audit.py and a human read.
    python3 scripts/scrub_copy.py SRC DEST"""
import os, re, sys, pathlib
nf = pathlib.Path(os.environ.get("WW_NAMES_FILE", "~/.wordwild_scrub_names.txt")).expanduser()
lines = [l.strip() for l in nf.read_text().splitlines() if l.strip()]
names = [l for l in lines if not l.startswith("host:")]
hosts = [l[5:].split("=>") for l in lines if l.startswith("host:")]  # host:Name=>replacement, kept in the untracked file
s = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
s = re.sub("|".join(re.escape(n) for n in sorted(names, key=len, reverse=True)), "the child", s, flags=re.I)
for a, b in [(r"/srv/[\w-]+/models/tts/kokoro", "/path/to/kokoro"), (r"/data/git/[\w.-]+", "<local clone>"),
             (r"/home/[\w]+/[\w./~-]*", "<local path>"), (r"~/\.venvs/[\w-]+", "<venv>"), (r"~/git/[\w./-]+", "<local path>"),
            
             (r"git@github\.com:jeremy-evert/wordwild\.git", "<private repo>"), (r"jeremy-evert/wordwild", "<private repo>"),
             (r"\bthe child's\b the child", "the child")]:
    s = re.sub(a, b, s)
for h, r in hosts: s = re.sub(r"\b%s\b" % re.escape(h), r, s)
d = pathlib.Path(sys.argv[2]); d.parent.mkdir(parents=True, exist_ok=True); d.write_text(s, encoding="utf-8")
