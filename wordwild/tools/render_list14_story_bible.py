#!/usr/bin/env python3
"""Render content/list14_words_v1.json into the human-readable story bible (Markdown).
The JSON is the single source of truth; never edit the rendered file by hand.
Usage: python3 tools/render_list14_story_bible.py [--table] > out.md
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLAIM = {"MNEMONIC": "silly mnemonic only", "WORD_OBSERVATION": "verified word observation",
         "RULE_CANDIDATE": "touches a review-only rule"}


def load():
    with open(os.path.join(ROOT, "content", "list14_words_v1.json"), encoding="utf-8") as f:
        return json.load(f)


def table(doc):
    out = ["| # | Word | Default (technique) | Alternate (technique) | Letter focus | Status | Flag |", "|---|---|---|---|---|---|---|"]
    for n, w in enumerate(doc["words"], 1):
        j = w["jokes"]
        extra = f" (+{j[2]['mode']})" if len(j) > 2 else ""
        focus = ", ".join(f"`{t['letters']}`" for t in w["spellingTargets"][:3])
        claims = "/".join(sorted({CLAIM[x["claimType"]] for x in j}))
        flag = (w["editorialNote"] or "").split(". ")[0]
        out.append(f"| {n} | {w['word']}{' *(List 13)*' if w['isReview'] else ''} | {j[0]['mode']} ({j[0]['provenance'].split(';')[0][:48]}) | {j[1]['mode']}{extra} | {focus} | {claims} | {flag} |")
    return "\n".join(out)


def render(doc):
    o = []
    a = o.append
    a("# WordWild List 14 Final Story Bible (candidate)\n")
    a("> **Generated from `content/list14_words_v1.json` by `tools/render_list14_story_bible.py`. Do not edit by hand.**")
    a("> Status: **candidate_parent_review**. No child has laughed at these specific variants yet, no mnemonic here has been shown to improve spelling, and no general spelling rule here is approved. Needs Jeremy's editorial approval.\n")
    a("## How to read an entry\n")
    a("- **Before the answer** only the two *clues* may appear (plus the spoken word on demand). Everything else is shown or spoken **after** the child asks for help, studies, or answers, and any letter exposure marks the attempt **assisted**.")
    a("- Each joke is labeled **silly mnemonic only**, **verified word observation**, or **touches a review-only rule**. Rule candidates live in a separate review-only bank (end of this file) and must not be shown as approved rules.")
    a("- **Help ladder:** listen again, clue, how to say it, pattern hint, partial letters (assisted), Help A joke, Try another joke, mini-check, show it then hide it then spell again, skip.")
    a("- Doubled letters are **written** letters, not doubled sounds. Letter names (P, D, C) are used only as jokes.\n")
    a("## Corrections to earlier material (read before building)\n")
    for c in doc["corrections"]:
        a(f"- **{c['where']}**: said \"{c['claim']}\". Fact: {c['fact']}")
    a("")
    for n, w in enumerate(doc["words"], 1):
        a(f"---\n\n## {n:02d}. {w['word']}{' (also List 13 review)' if w['isReview'] else ''}\n")
        a(f"**Meaning:** {w['meaning']}.\n")
        a("**Letter focus:** " + "; ".join(f"`{t['letters']}` at position {t['zeroBasedStart'] + 1} ({t['kind'].replace('_', ' ')})" for t in w["spellingTargets"]) + "\n")
        c = w["clues"]
        a("**Pre-answer clues**\n")
        a(f"1. {c['primary']}")
        a(f"2. {c['secondary']}")
        if c["spokenWordDisambiguates"]:
            a(f"\n*The spoken word disambiguates: {c['note']}.*")
        a("")
        for j, label in zip(w["jokes"], ["Help A (default)", "Help B (alternate)", "Help C (optional third)"]):
            a(f"### {label}: `{j['id']}` ({j['mode'].replace('_', ' ')}; {CLAIM[j['claimType']]})\n")
            a(f"> **Funny sentence (narrated after the attempt):** {j['narration']}\n")
            a(f"- **Spelling cue:** {j['spellingCue']}")
            a(f"- **Picture:** {j['accessibleDescription']}")
            a(f"- **Placeholder:** `{j['artPlaceholder']}`")
            a(f"- **Tap / build action:** {j['tapAction']}")
            a(f"- **Why this one:** {j['whyThisVersion']}")
            a(f"- **Caveat:** {j['caveat']}")
            a(f"- **Source:** {j['provenance']}\n")
        h = w["help"]
        a("**Help ladder text**\n")
        a(f"- How to say it: {h['pronunciationNote']}")
        a(f"- Pattern hint: {h['patternHint']}")
        a(f"- Partial letters (assisted): `{h['partialLetterHint']}` (first letter `{h['firstLetter']}`)\n")
        m = w["miniCheck"]
        opts = " / ".join(f"**{o}**" if i == m["correctIndex"] else o for i, o in enumerate(m["options"]))
        a(f"**Mini-check (word-specific, assisted, not a rule quiz):** {m['question']}\n\nOptions: {opts}\n\n*{m['feedback']}*\n")
        r = w["reviewStatus"]
        a("**Review labels:** observations: " + ("; ".join(r["observations"]) or "none") + ". Mnemonic only: " + ("; ".join(r["mnemonicOnly"]) or "none") + ". Review-only rules: " + (", ".join(r["unreviewedRules"]) or "none") + ".")
        if w["editorialNote"]:
            a(f"\n**Editorial flag:** {w['editorialNote']}")
        a("")
    a("---\n\n## Review-only general rule bank\n")
    a("None of these may be shown to a child as an approved rule or used in a scored rule quiz until an educator approves the statement, scope and counterexamples (Mission 004).\n")
    for r in doc["generalRuleBank"]:
        a(f"- **{r['id']} {r['title']}** (`{r['status']}`): {r['statement']} Examples: {', '.join(r['examples'])}. Counterexamples: {', '.join(r['counterexamples'])}. Needs: {r['needsReview']}")
    a("")
    return "\n".join(o)


if __name__ == "__main__":
    d = load()
    print((table(d) if "--table" in sys.argv else render(d)).rstrip("\n"))
