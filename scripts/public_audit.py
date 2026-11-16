#!/usr/bin/env python3
"""Pre-publish audit. Prints COUNTS only ("N hits in M files"), never the matched names.

    python3 scripts/public_audit.py [path ...]          (default: wordwild/)
    WW_NAMES_FILE=~/.wordwild_scrub_names.txt            (one name per line; NEVER commit this file)

Checks text files for: names from the local names file (case-insensitive), private paths and host names,
email addresses, and credential-looking strings. Also lists binary/media file types so a human can confirm
each has a license line in wordwild/ASSETS.md. Exit code 1 if any hit. Spoken audio is checked separately by
scripts/audio_transcript_audit.py. Review matches by running with --show-locations (file:line only, no text).
"""
import os, re, sys, pathlib, collections
show = "--show-locations" in sys.argv
paths = [a for a in sys.argv[1:] if not a.startswith("--")] or ["wordwild"]
nf = pathlib.Path(os.environ.get("WW_NAMES_FILE", "~/.wordwild_scrub_names.txt")).expanduser()
lines = [l.strip() for l in nf.read_text().splitlines() if l.strip()] if nf.is_file() else []
names = [l for l in lines if not l.startswith("host:")]
hosts = [l[5:].split("=>")[0] for l in lines if l.startswith("host:")]  # host names live in the untracked file too
if not names: print("WARNING: names file missing or empty; name check NOT run", file=sys.stderr)
name_re = re.compile("|".join(re.escape(n) for n in names), re.I) if names else None
CATS = {
  "private_path": re.compile(r"(/home/[a-z]|/data/git|/srv/|/Users/|C:\\Users|~/git|\.venvs/)"),
  "email": re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"),
  "credential": re.compile(r"(ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY|Bearer\s+[A-Za-z0-9._-]{20,}|\b(api[_-]?key|client_secret|secret_key|password|passwd|access_token)\b\s*[:=]\s*['\"][^'\"]{8,})", re.I),
}
TEXT = {".html",".js",".mjs",".css",".json",".md",".py",".sh",".txt",".svg",".yml",".yaml",""}
host_re = re.compile(r"\b(" + "|".join(re.escape(h) for h in hosts) + r")\b") if hosts else None
CATS_EXTRA = {"host_or_user": host_re} if host_re else {}
CATS.update(CATS_EXTRA)
hits = collections.defaultdict(lambda: collections.defaultdict(list)); media = collections.Counter(); scanned = 0
for root in paths:
    for p in sorted(pathlib.Path(root).rglob("*")):
        if not p.is_file() or ".git" in p.parts: continue
        if p.suffix.lower() not in TEXT: media[p.suffix.lower()] += 1; continue
        try: lines = p.read_text(encoding="utf-8").splitlines()
        except UnicodeDecodeError: media["(undecodable)"] += 1; continue
        scanned += 1
        for n, line in enumerate(lines, 1):
            if name_re and name_re.search(line): hits["child_or_private_name"][str(p)].append(n)
            for c, rx in CATS.items():
                if rx.search(line): hits[c][str(p)].append(n)
total = 0
print(f"scanned {scanned} text files under {', '.join(paths)}; names loaded: {len(names)}")
for c in ["child_or_private_name", *CATS]:
    files = hits.get(c, {}); count = sum(len(v) for v in files.values()); total += count
    print(f"{c}: {count} hits in {len(files)} files")
    if show:
        for f, ls in files.items(): print(f"    {f}: lines {ls[:12]}")
print("non-text files by type (each needs a license line in ASSETS.md):", dict(media))
sys.exit(1 if total else 0)
