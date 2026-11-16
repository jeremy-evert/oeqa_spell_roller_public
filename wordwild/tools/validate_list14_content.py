#!/usr/bin/env python3
"""Validate content/list14_words_v1.json (WordWild List 14 final content package).

No third-party dependencies. Exit code 1 on any ERROR; WARN lines are advisory.
Usage: python3 tools/validate_list14_content.py [path/to/list14_words_v1.json]

What this CAN check: schema, canonical list and order, target-letter positions, answer
leaks in the two PRE-answer clues, post-answer narration contains the word, mini-check
answers, unique versioned joke IDs, rule labeling.
What it CANNOT check (needs a human or a browser): whether a joke is funny, whether a
phoneme claim is true, ambiguity of a clue, or leaks through pictures, alt text or ARIA.
"""
import json
import re
import sys

CANON = ["supper", "number", "over", "ladder", "sister", "spider", "soccer", "thunder", "tiger", "chapter",
         "afternoon", "scattering", "whispered", "understand", "newspaper", "butterfly", "upstairs", "staring",
         "animal", "another"]
REVIEW = {"upstairs", "staring"}
MODES = {"visual_letter", "sound_chunk", "rhyme_family", "letter_swap", "build_transform"}
CLAIMS = {"MNEMONIC", "WORD_OBSERVATION", "RULE_CANDIDATE"}
TARGET_KINDS = {"letter_count", "letter_pair", "single_letter", "word_part", "word_ending"}
TARGET_STATUS = {"word_observation", "mnemonic_only", "rule_candidate_unreviewed"}
ANSWER_KINDS = {"whole_word", "feature", "build", "count"}
NUM = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5}
ID_RE = re.compile(r"^list14-([a-z]+)-(primary|alternate|extra)-v(\d+)$")
PLACEHOLDER_RE = re.compile(r"REPLACE|TODO|TBD|lorem|XXX", re.I)

errors, warns = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warns.append(msg)


def text_ok(where, value):
    if not isinstance(value, str) or not value.strip():
        err(f"{where}: missing or empty text")
        return False
    if PLACEHOLDER_RE.search(value):
        err(f"{where}: contains placeholder text")
    return True


def squash(s):
    return re.sub(r"[^a-z]", "", s.lower())


def windows(word, n=4):
    return {word[i:i + n] for i in range(len(word) - n + 1)}


def main(path):
    try:
        with open(path, encoding="utf-8") as f:
            doc = json.load(f)
    except (OSError, ValueError) as e:
        print(f"ERROR cannot read valid JSON from {path}: {e}")
        return 1

    if doc.get("schemaVersion") != 1:
        err("schemaVersion must be 1")
    if doc.get("listId") != "grade3-list14":
        err("listId must be grade3-list14")
    if doc.get("status") != "candidate_parent_review":
        err("top-level status must be candidate_parent_review")

    rules = {}
    for r in doc.get("generalRuleBank", []):
        rid = r.get("id")
        if not rid or rid in rules:
            err(f"generalRuleBank: missing or duplicate id {rid}")
        rules[rid] = r
        if r.get("status") != "review_only":
            err(f"rule {rid}: status must be review_only (no rule may be promoted without educator review)")
        for k in ("title", "statement", "needsReview"):
            text_ok(f"rule {rid}.{k}", r.get(k))
        if not r.get("counterexamples"):
            err(f"rule {rid}: needs at least one counterexample")

    words = doc.get("words", [])
    if len(words) != 20:
        err(f"expected exactly 20 words, found {len(words)}")
    if [w.get("id") for w in words] != CANON:
        err("word order/ids differ from the canonical List 14 order")

    seen_ids = set()
    total_jokes = 0
    for w in words:
        wid = w.get("id", "?")
        word = (w.get("word") or "").lower()
        where = f"[{wid}]"
        if word != wid:
            err(f"{where}: word '{word}' differs from id")
        if wid in CANON and bool(w.get("isReview")) != (wid in REVIEW):
            err(f"{where}: isReview must be {wid in REVIEW}")
        for k in ("meaning",):
            text_ok(f"{where}.{k}", w.get(k))

        # --- pre-answer clues: no target, no 4+ letter piece, no other List 14 word
        clues = w.get("clues", {})
        if not isinstance(clues.get("spokenWordDisambiguates"), bool):
            err(f"{where}.clues.spokenWordDisambiguates must be true or false")
        elif clues["spokenWordDisambiguates"] and not (clues.get("note") or "").strip():
            err(f"{where}.clues: spokenWordDisambiguates true needs a note naming the competing answer")
        pairs = []
        for name in ("primary", "secondary"):
            c = clues.get(name)
            if not text_ok(f"{where}.clues.{name}", c):
                continue
            low = c.lower()
            squashed = squash(c)
            if re.search(rf"\b{re.escape(word)}\b", low):
                err(f"{where}.clues.{name}: contains the exact target word")
            hits = sorted(x for x in windows(word) if x in squashed)
            if hits:
                err(f"{where}.clues.{name}: contains a 4+ letter piece of the target: {hits[:3]}")
            for other in CANON:
                if other != word and re.search(rf"\b{other}\b", low):
                    err(f"{where}.clues.{name}: contains another List 14 word '{other}'")
            pairs.append(c)
        if len(pairs) == 2 and pairs[0].strip().lower() == pairs[1].strip().lower():
            err(f"{where}: primary and secondary clues are identical")

        # --- audio
        audio = w.get("audio", {})
        if audio.get("word") != word or audio.get("slowWord") != word:
            err(f"{where}.audio: word and slowWord must be the target word")

        # --- spelling targets
        targets = w.get("spellingTargets", [])
        if not targets:
            err(f"{where}: no spellingTargets")
        for i, t in enumerate(targets):
            if t.get("kind") not in TARGET_KINDS:
                err(f"{where}.spellingTargets[{i}]: unknown kind {t.get('kind')}")
            if t.get("status") not in TARGET_STATUS:
                err(f"{where}.spellingTargets[{i}]: unknown status {t.get('status')}")
            letters, start = t.get("letters", ""), t.get("zeroBasedStart")
            if not isinstance(start, int) or not letters or word[start:start + len(letters)] != letters:
                err(f"{where}.spellingTargets[{i}]: '{letters}' is not at index {start} of '{word}'")
            if t.get("kind") == "letter_count" and (len(letters) != 2 or letters[0] != letters[1]):
                err(f"{where}.spellingTargets[{i}]: letter_count must be a doubled letter")

        # --- jokes
        jokes = w.get("jokes", [])
        slots = [j.get("slot") for j in jokes]
        total_jokes += len(jokes)
        if len(jokes) < 2:
            err(f"{where}: needs at least two jokes")
        if "primary" not in slots or "alternate" not in slots:
            err(f"{where}: needs a primary and an alternate joke")
        if len(set(slots)) != len(slots):
            err(f"{where}: duplicate joke slots")
        if len(jokes) >= 2 and len({j.get("mode") for j in jokes}) < 2 and len({j.get("narration") for j in jokes}) < 2:
            err(f"{where}: jokes are not distinct")
        modes_used = [j.get("mode") for j in jokes]
        if len(modes_used) >= 2 and modes_used[0] == modes_used[1]:
            warn(f"{where}: primary and alternate use the same mode '{modes_used[0]}' (should be a different route)")
        word_rules = set(w.get("generalRuleRefs", []))
        for r in word_rules:
            if r not in rules:
                err(f"{where}: generalRuleRefs points to unknown rule {r}")
        for j in jokes:
            jid = j.get("id", "?")
            jw = f"{where}.joke {jid}"
            m = ID_RE.match(jid or "")
            if not m or m.group(1) != word or m.group(2) != j.get("slot") or int(m.group(3)) != j.get("version"):
                err(f"{jw}: id must look like list14-{word}-<slot>-v<version> and match slot/version")
            if jid in seen_ids:
                err(f"{jw}: duplicate joke id")
            seen_ids.add(jid)
            if j.get("mode") not in MODES:
                err(f"{jw}: unknown mode {j.get('mode')}")
            if j.get("claimType") not in CLAIMS:
                err(f"{jw}: unknown claimType {j.get('claimType')}")
            if j.get("status") != "candidate_parent_review":
                err(f"{jw}: status must be candidate_parent_review")
            for k in ("narration", "spellingCue", "accessibleDescription", "tapAction", "provenance", "whyThisVersion", "caveat"):
                text_ok(f"{jw}.{k}", j.get(k))
            art = j.get("artPlaceholder", "")
            if not (isinstance(art, str) and art.startswith("[ART TODO:") and art.endswith("]")):
                err(f"{jw}.artPlaceholder must be an [ART TODO: ...] marker")
            nar = j.get("narration", "")
            if not re.search(rf"\b{re.escape(word)}\b", nar.lower()):
                err(f"{jw}: narration does not contain the full word")
            n_words = len(nar.split())
            if not 8 <= n_words <= 45:
                warn(f"{jw}: narration is {n_words} words (aim 8 to 45 so it survives being heard three times)")
            refs = j.get("targetRefs", [])
            if not refs:
                err(f"{jw}: needs targetRefs")
            cue = squash(j.get("spellingCue", ""))
            for ri in refs:
                if not isinstance(ri, int) or not 0 <= ri < len(targets):
                    err(f"{jw}: targetRef {ri} out of range")
                    continue
                if targets[ri]["letters"] not in cue:
                    err(f"{jw}: spellingCue never mentions target '{targets[ri]['letters']}'")
            if j.get("claimType") == "RULE_CANDIDATE" and not word_rules:
                err(f"{jw}: RULE_CANDIDATE joke but the word has no generalRuleRefs")
            if j.get("claimType") != "RULE_CANDIDATE" and re.search(r"\brule\b", j.get("spellingCue", ""), re.I):
                warn(f"{jw}: spellingCue says 'rule' without RULE_CANDIDATE")

        # --- help
        h = w.get("help", {})
        for k in ("pronunciationNote", "patternHint", "partialLetterHint", "firstLetter"):
            text_ok(f"{where}.help.{k}", h.get(k))
        p = h.get("partialLetterHint", "")
        if len(p) != len(word) or "_" not in p or p == word or any(c != "_" and c != word[i] for i, c in enumerate(p)):
            err(f"{where}.help.partialLetterHint '{p}' must be the word with some letters replaced by _")
        if h.get("firstLetter") != word[:1]:
            err(f"{where}.help.firstLetter must be '{word[:1]}'")

        # --- mini-check
        mc = w.get("miniCheck", {})
        text_ok(f"{where}.miniCheck.question", mc.get("question"))
        text_ok(f"{where}.miniCheck.feedback", mc.get("feedback"))
        opts, ci = mc.get("options", []), mc.get("correctIndex")
        if not (2 <= len(opts) <= 3) or len(set(opts)) != len(opts):
            err(f"{where}.miniCheck: needs 2 or 3 distinct options")
        elif not isinstance(ci, int) or not 0 <= ci < len(opts):
            err(f"{where}.miniCheck: correctIndex out of range")
        else:
            kind, right = mc.get("answerKind"), opts[ci]
            if kind not in ANSWER_KINDS:
                err(f"{where}.miniCheck: unknown answerKind {kind}")
            elif kind == "whole_word" and right.replace(" ", "") != word:
                err(f"{where}.miniCheck: whole_word answer '{right}' is not the word")
            elif kind == "feature" and right.lower() not in word:
                err(f"{where}.miniCheck: feature answer '{right}' is not inside the word")
            elif kind == "build" and re.sub(r"[+\s]", "", right) != word:
                err(f"{where}.miniCheck: build answer '{right}' does not make the word")
            elif kind == "count":
                letter, value = mc.get("countLetter"), mc.get("countValue")
                if not letter or word.count(letter) != value or NUM.get(right) != value:
                    err(f"{where}.miniCheck: count answer is wrong (word has {word.count(letter or '?')} of '{letter}')")
            others = [o for k2, o in enumerate(opts) if k2 != ci]
            if kind in ("whole_word", "build") and any(re.sub(r"[+\s]", "", o) == word for o in others):
                err(f"{where}.miniCheck: a wrong option also makes the word")
        if re.search(r"\brule\b", (mc.get("question") or ""), re.I):
            err(f"{where}.miniCheck: a mini-check must be word-specific, not a rule question")

    if total_jokes < 40:
        err(f"expected at least 40 jokes, found {total_jokes}")

    for w in warns:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{len(words)} words, {total_jokes} joke variants, {len(errors)} errors, {len(warns)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "content/list14_words_v1.json"))
