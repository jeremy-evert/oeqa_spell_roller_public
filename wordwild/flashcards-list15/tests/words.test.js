import test from "node:test";
import assert from "node:assert/strict";
import { WORDS } from "../words.js";
import { sceneSVG } from "../art.js";
import { CardRun, OUTCOME, Progress, blankState, normalize, rounds } from "../engine.js";
import { cardView, flipFrontView, flipBackView, homeView } from "../views.js";
import { KEY } from "../storage.js";

const expected = ["puzzle","bundle","table","apple","able","single","title","pebble","maple","bottle","simple","kettle","uncle","people","gentle","eagle","understand","over","until","o’clock"];
test("List 15 has all 20 words in school order", () => {
  assert.deepEqual(WORDS.map(w=>w.word), expected);
  assert.equal(new Set(expected).size,20);
  assert.deepEqual(rounds().map(x=>x.length),[5,5,5,5]);
  assert.deepEqual(WORDS.filter(w=>w.review).map(w=>w.word),["understand","over"]);
});
test("word clues and illustrations do not leak answers", () => {
 for (const w of WORDS) {
  assert.equal(w.chunks.join(""),w.word);
  assert.ok(w.clue.includes("______"),w.word);
  assert.ok(w.sentence.toLowerCase().includes(w.word),w.word);
  const art=sceneSVG(w.art,w.alt);
  assert.ok(art.startsWith("<svg"));
  for(const text of [w.clue,w.alt,art,cardView({w,run:new CardRun(w.word),index:0,total:20}),flipFrontView({w,index:0,total:20})])
    assert.equal(text.toLowerCase().includes(w.word),false,"answer leak: "+w.word);
  assert.ok(flipBackView({w,index:0,total:20}).includes(w.word),"back shows answer");
 }
});
test("first try and after-study outcomes remain separate",()=>{
 const w=WORDS[0].word,run=new CardRun(w);
 assert.equal(run.submit(w).correct,true);
 assert.equal(run.outcome,OUTCOME.INDEPENDENT);
 const studied=new CardRun(w,{studied:true});
 studied.submit(w);assert.equal(studied.outcome,OUTCOME.AFTER_REVEAL);
});
test("typed straight apostrophe matches o’clock while spelling still requires punctuation",()=>{
 assert.equal(normalize("O'CLOCK"),"o’clock");
 const right=new CardRun("o’clock");right.submit("O'Clock");assert.equal(right.outcome,OUTCOME.INDEPENDENT);
 const wrong=new CardRun("o’clock");assert.equal(wrong.submit("oclock").correct,false);
});
test("List 14 and List 15 progress are independent",()=>{
 assert.equal(KEY,"wordwild.flashcards.list15.v1");
 const p=new Progress(blankState());p.record(WORDS[0].word,OUTCOME.INDEPENDENT);
 assert.equal(p.summary().independentNow,1);
 assert.ok(homeView(p,{muted:false,reducedMotion:false,accessible:false},false).includes("List 15"));
});
