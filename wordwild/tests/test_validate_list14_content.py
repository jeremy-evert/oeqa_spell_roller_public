"""Unit tests for tools/validate_list14_content.py. Run: python3 -m unittest tests.test_validate_list14_content -v
(or python3 -m unittest discover -s tests -p 'test_validate_list14*.py')."""
import copy, json, os, subprocess, sys, tempfile, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VALIDATOR = os.path.join(ROOT, "tools", "validate_list14_content.py")
CONTENT = os.path.join(ROOT, "content", "list14_words_v1.json")


def run(doc):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False)
        path = f.name
    try:
        p = subprocess.run([sys.executable, VALIDATOR, path], capture_output=True, text=True)
    finally:
        os.unlink(path)
    return p.returncode, p.stdout


def load():
    with open(CONTENT, encoding="utf-8") as f:
        return json.load(f)


def word(doc, wid):
    return next(w for w in doc["words"] if w["id"] == wid)


class Validator(unittest.TestCase):
    def test_real_package_passes(self):
        code, out = run(load())
        self.assertEqual(code, 0, out)
        self.assertIn("20 words, 42 joke variants, 0 errors", out)

    def expect_fail(self, mutate, needle):
        doc = copy.deepcopy(load())
        mutate(doc)
        code, out = run(doc)
        self.assertEqual(code, 1, out)
        self.assertIn(needle, out)

    def test_missing_word_fails(self):
        self.expect_fail(lambda d: d["words"].pop(), "expected exactly 20 words")

    def test_wrong_order_fails(self):
        self.expect_fail(lambda d: d["words"].reverse(), "canonical List 14 order")

    def test_clue_leak_fails(self):
        self.expect_fail(lambda d: word(d, "tiger")["clues"].__setitem__("primary", "A tiger is a big cat."), "exact target word")

    def test_clue_piece_leak_fails(self):
        self.expect_fail(lambda d: word(d, "afternoon")["clues"].__setitem__("primary", "The time after lunch."), "4+ letter piece")

    def test_other_word_in_clue_fails(self):
        self.expect_fail(lambda d: word(d, "ladder")["clues"].__setitem__("secondary", "Reach the upstairs window."), "another List 14 word")

    def test_bad_target_index_fails(self):
        self.expect_fail(lambda d: word(d, "supper")["spellingTargets"][0].__setitem__("zeroBasedStart", 3), "is not at index")

    def test_narration_missing_word_fails(self):
        self.expect_fail(lambda d: word(d, "animal")["jokes"][0].__setitem__("narration", "Penguins slid into a pond yelling loudly."), "narration does not contain")

    def test_duplicate_joke_id_fails(self):
        def m(d):
            word(d, "over")["jokes"][1]["id"] = word(d, "over")["jokes"][0]["id"]
        self.expect_fail(m, "duplicate joke id")

    def test_one_joke_fails(self):
        self.expect_fail(lambda d: word(d, "number")["jokes"].pop(), "needs at least two jokes")

    def test_bad_mini_check_fails(self):
        self.expect_fail(lambda d: word(d, "scattering")["miniCheck"].__setitem__("correctIndex", 0), "count answer is wrong")

    def test_approved_rule_fails(self):
        self.expect_fail(lambda d: d["generalRuleBank"][0].__setitem__("status", "approved"), "must be review_only")

    def test_placeholder_text_fails(self):
        self.expect_fail(lambda d: word(d, "spider")["jokes"][0].__setitem__("tapAction", "REPLACE WITH A PAYOFF"), "placeholder text")

    def test_missing_art_marker_fails(self):
        self.expect_fail(lambda d: word(d, "soccer")["jokes"][0].__setitem__("artPlaceholder", "a sock"), "[ART TODO")

    def test_wrong_review_flag_fails(self):
        self.expect_fail(lambda d: word(d, "supper").__setitem__("isReview", True), "isReview must be")


if __name__ == "__main__":
    unittest.main()
