import test from "node:test";
import assert from "node:assert/strict";
import { WORDS } from "../words.js";
import {
  OUTCOME, CardRun, Progress, blankState, migrate, itemPrice,
  HAT_STYLES, ACCESSORY_STYLES, POTATO_COLORS, BACKGROUND_THEMES,
} from "../engine.js";
import { potatoSVG, setPotatoStyle } from "../art.js";
import { homeView, shopView, lockerView, profileView, cardView, flipFrontView, letterCount } from "../views.js";

test("shop has even-priced colored caps, fancy caps, themed hats, and seasonal LAST", () => {
  const colors = ["redcap","bluecap","greencap","pinkcap","purplecap","orangecap"];
  for (const id of colors) assert.equal(HAT_STYLES.find(x=>x.id===id)?.price, 5, id);
  for (const id of ["sunshine","silvercap","rainbowcap"]) assert.equal(HAT_STYLES.find(x=>x.id===id)?.price, 15, id);
  for (const id of ["tiara","crown","dino","wizard","space"]) assert.equal(HAT_STYLES.find(x=>x.id===id)?.price, 20, id);
  for (const id of ["turkey","pumpkin","santa","heart","easter"]) assert.ok(HAT_STYLES.find(x=>x.id===id)?.seasonMonths, id);
  const p = new Progress(blankState());
  const html = shopView(p,11);
  assert.ok(html.indexOf("Standard graduation caps") < html.indexOf("Gold, silver and rainbow caps"));
  assert.ok(html.indexOf("Gold, silver and rainbow caps") < html.indexOf("Costume hats and hoods"));
  assert.ok(html.indexOf("Seasonal celebrations") > html.indexOf("Background colors"));
  assert.ok(html.includes("Need 5 more points")); // Everyone sees locked choices
});

test("seasonal hats cost more during their months, stay available all year", () => {
  assert.equal(itemPrice(HAT_STYLES.find(x=>x.id==="santa"),11),18);
  assert.equal(itemPrice(HAT_STYLES.find(x=>x.id==="pumpkin"),11),18);
  assert.equal(itemPrice(HAT_STYLES.find(x=>x.id==="turkey"),11),18);
  assert.equal(itemPrice(HAT_STYLES.find(x=>x.id==="santa"),5),10);
  assert.equal(itemPrice(HAT_STYLES.find(x=>x.id==="heart"),2),18);
  assert.equal(itemPrice(HAT_STYLES.find(x=>x.id==="easter"),4),18);
});

test("shop purchases deduct once; permanent locker equipment is free", () => {
  const p = new Progress(blankState());
  p.state.pointBalance = 25;
  p.state.practicePoints = 25;
  const first = p.purchase("hatStyle","bluecap",11);
  assert.equal(first.ok,true);
  assert.equal(first.price,5);
  assert.equal(p.state.pointBalance,20);
  assert.equal(p.purchase("hatStyle","bluecap",11).ok,false);
  assert.equal(p.state.pointBalance,20);
  assert.equal(p.equip("hatStyle","bluecap"),true);
  assert.equal(p.equip("hatStyle","classic"),true);
  assert.equal(p.equip("hatStyle","bluecap"),true);
  assert.equal(p.state.pointBalance,20);
  assert.equal(p.equip("hatStyle","crown"),false);
  const locker=lockerView(p);
  assert.match(locker,/Blue graduation cap/);
  assert.doesNotMatch(locker,/Royal crown/);
  const restored=migrate(JSON.parse(JSON.stringify(p.state)));
  assert.equal(restored.pointBalance,20);
  assert.ok(restored.ownedCosmetics.hatStyle.includes("bluecap"));
  assert.equal(restored.settings.hatStyle,"bluecap");
});

test("existing points and previously unlocked items are gifted on migration", () => {
  const old = blankState();
  old.shopVersion = undefined;
  old.practicePoints = 28;
  old.settings.hatStyle = "starlight";
  const upgraded = migrate(JSON.parse(JSON.stringify(old)));
  assert.equal(upgraded.shopVersion,2);
  assert.equal(upgraded.pointBalance,28);
  assert.equal(upgraded.practicePoints,28);
  assert.ok(upgraded.ownedCosmetics.hatStyle.includes("starlight"));
  assert.ok(upgraded.ownedCosmetics.hatStyle.includes("dino"));
  assert.equal(upgraded.settings.hatStyle,"starlight");
  assert.equal(migrate(JSON.parse(JSON.stringify(upgraded))).pointBalance,28);
});

test("profile and navigation keep private progress separate from purchases", () => {
  const p = new Progress(blankState());
  p.record(WORDS[0].word, OUTCOME.AFTER_HINT);
  p.recordStudy(WORDS[1].word);
  assert.equal(p.state.pointBalance,3);
  assert.equal(p.state.practicePoints,3);
  const profile = profileView(p,p.state.settings,true);
  assert.match(profile,/My Profile/);
  assert.match(profile,/Points to spend/);
  assert.match(profile,/Total points earned/);
  assert.match(profile,/Only saved in this browser/);
  assert.match(homeView(p,p.state.settings,true),/List 15 Menu/);
});

test("all costumes draw; no answer leaks across all 20 spelling clues", () => {
  for(const hat of HAT_STYLES) {
    setPotatoStyle({hatStyle:hat.id,accessoryStyle:"none",potatoColor:"classic"});
    assert.match(potatoSVG("happy"),/^<svg /);
  }
  for(const accessory of ACCESSORY_STYLES) {
    for(const color of POTATO_COLORS) {
      setPotatoStyle({hatStyle:"dino",accessoryStyle:accessory.id,potatoColor:color.id});
      assert.match(potatoSVG("oops"),/^<svg /);
    }
  }
  setPotatoStyle({hatStyle:"rainbowcap",accessoryStyle:"glasses",potatoColor:"mint"});
  assert.match(potatoSVG("happy"),/potato-rainbow-grad/);
  for (const w of WORDS) {
    const run = new CardRun(w.word);
    const card = cardView({w,run,index:w.n-1,total:20});
    const front = flipFrontView({w,index:w.n-1,total:20});
    assert.equal(card.toLowerCase().includes(w.word),false,w.word);
    assert.equal(front.toLowerCase().includes(w.word),false,w.word);
    const count = letterCount(w.word);
    assert.match(card,new RegExp('aria-label="'+count+' letters">_{'+count+'}</span>'));
    assert.equal(run.submit(w.word).correct,true);
    assert.equal(run.outcome,OUTCOME.INDEPENDENT);
  }
  assert.equal(letterCount("over"),4);
  assert.equal(letterCount("understand"),10);
  assert.equal(letterCount("o’clock"),6);
  setPotatoStyle();
});
