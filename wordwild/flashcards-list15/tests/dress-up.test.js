import test from "node:test";
import assert from "node:assert/strict";
import { WORDS } from "../words.js";
import {
  OUTCOME, CardRun, Progress, blankState, migrate,
  HAT_STYLES, ACCESSORY_STYLES, POTATO_COLORS, BACKGROUND_THEMES,
} from "../engine.js";
import { potatoSVG, setPotatoStyle } from "../art.js";
import { homeView, cardView } from "../views.js";

test("four cosmetic categories offer easy and aspirational rewards", () => {
  assert.equal(HAT_STYLES.length, 10);
  assert.equal(ACCESSORY_STYLES.length, 6);
  assert.equal(POTATO_COLORS.length, 5);
  assert.equal(BACKGROUND_THEMES.length, 9);
  assert.equal(HAT_STYLES.find(x => x.id === "classic").unlockAt, 0);
  assert.equal(HAT_STYLES.find(x => x.id === "bluecap").unlockAt, 2);
  for (const id of ["dino", "tiara", "crown", "wizard", "space"]) {
    assert.ok(HAT_STYLES.some(x => x.id === id));
  }
  for (const id of ["pink", "blue", "green", "yellow", "rainbow"]) {
    assert.ok(BACKGROUND_THEMES.some(x => x.id === id));
  }
});

test("old points and hat choices survive the upgrade", () => {
  const old = blankState();
  old.practicePoints = 28;
  old.settings.hatStyle = "starlight";
  delete old.settings.accessoryStyle;
  delete old.settings.potatoColor;
  delete old.settings.backgroundTheme;
  const copy = migrate(JSON.parse(JSON.stringify(old)));
  assert.equal(copy.practicePoints, 28);
  assert.equal(copy.settings.hatStyle, "starlight");
  assert.equal(copy.settings.accessoryStyle, "none");
  assert.equal(copy.settings.backgroundTheme, "original");
});

test("all costume unlocks use cumulative points, never spend them", () => {
  const p = new Progress(blankState());
  assert.equal(p.chooseHatStyle("dino"), false);
  assert.equal(p.chooseHatStyle("classic"), true);
  p.record(WORDS[0].word, OUTCOME.AFTER_HINT);
  assert.equal(p.state.practicePoints, 2);
  assert.equal(p.chooseHatStyle("bluecap"), true);
  assert.equal(p.chooseBackground("pink"), true);
  assert.equal(p.chooseAccessory("glasses"), false);
  assert.equal(p.state.practicePoints, 2);
  p.state.practicePoints = 70;
  assert.equal(p.chooseHatStyle("dino"), true);
  assert.equal(p.chooseAccessory("wings"), true);
  assert.equal(p.choosePotatoColor("mint"), true);
  assert.equal(p.chooseBackground("rainbow"), true);
  assert.equal(p.state.practicePoints, 70);
  const restored = migrate(JSON.parse(JSON.stringify(p.state)));
  assert.equal(restored.settings.hatStyle, "dino");
  assert.equal(restored.settings.accessoryStyle, "wings");
  assert.equal(restored.settings.potatoColor, "mint");
  assert.equal(restored.settings.backgroundTheme, "rainbow");
});

test("dressing up is visible and easy to access from the main menu", () => {
  const p = new Progress(blankState());
  const html = homeView(p, p.state.settings, true, "hatStyle");
  assert.match(html, /href="#dressup-closet"/);
  assert.match(html, /Dress-Up Closet/);
  assert.match(html, /Dinosaur hood/);
  assert.match(html, /Crystal tiara/);
  assert.match(html, /Royal crown/);
  assert.match(html, /Background colors/);
  assert.match(html, /Dressing up is optional/);
});

test("every hat, accessory and body color renders in the Potato avatar", () => {
  for (const h of HAT_STYLES) {
    for (const a of ACCESSORY_STYLES) {
      setPotatoStyle({hatStyle:h.id, accessoryStyle:a.id, potatoColor:"classic"});
      assert.match(potatoSVG("happy"), /^<svg /);
    }
  }
  for (const color of POTATO_COLORS) {
    setPotatoStyle({hatStyle:"dino", accessoryStyle:"wings", potatoColor:color.id});
    assert.match(potatoSVG("oops"), /^<svg /);
  }
  setPotatoStyle();
});

test("custom costumes do not reveal spellings or alter spelling accuracy", () => {
  setPotatoStyle({hatStyle:"crown", accessoryStyle:"glasses", potatoColor:"rose"});
  for (const word of WORDS) {
    const run = new CardRun(word.word);
    const hidden = cardView({w:word, run, index:word.n-1, total:20}).toLowerCase();
    assert.equal(hidden.includes(word.word), false, word.word);
    assert.equal(run.submit(word.word).correct, true);
    assert.equal(run.outcome, OUTCOME.INDEPENDENT);
  }
  setPotatoStyle();
});
