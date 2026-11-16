import { words } from './words.js';

const STORAGE_KEY = 'wordwild-impossible-printer-v1';
const $ = (selector) => document.querySelector(selector);
const home = $('#home-screen');
const game = $('#game-screen');
const finish = $('#finish-screen');
const input = $('#answer-input');
const objectWrap = $('#object-wrap');
let voiceOn = false;
let clueAudio = null;
let state = loadState();

function newState() {
  return { theme: 'bot', order: words.map((_, i) => i), cursor: 0, results: {}, misses: {}, assisted: {}, mode: 'main', started: false };
}

function isValidState(value) {
  return value && ['bot', 'garden', 'tower'].includes(value.theme) && Array.isArray(value.order)
    && value.order.every((i) => Number.isInteger(i) && i >= 0 && i < words.length)
    && Number.isInteger(value.cursor) && value.cursor >= 0 && value.cursor <= value.order.length
    && value.results && typeof value.results === 'object'
    && ['main', 'review'].includes(value.mode);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return newState();
    const saved = JSON.parse(raw);
    return isValidState(saved) ? { ...newState(), ...saved } : newState();
  } catch { return newState(); }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Game remains playable without storage. */ }
}

function show(which) {
  home.hidden = which !== 'home';
  game.hidden = which !== 'game';
  finish.hidden = which !== 'finish';
}

function currentIndex() { return state.order[state.cursor]; }
function currentWord() { return words[currentIndex()]; }
function plural(n, one, many = `${one}s`) { return `${n} ${n === 1 ? one : many}`; }

function refreshHome() {
  const button = $('#start-button');
  button.innerHTML = `${state.started && state.cursor < state.order.length ? 'Continue printing' : 'Start printing'} <span aria-hidden="true">→</span>`;
  document.querySelectorAll('.blueprint').forEach((buttonEl) => {
    const chosen = buttonEl.dataset.theme === state.theme;
    buttonEl.classList.toggle('selected', chosen);
    buttonEl.setAttribute('aria-pressed', String(chosen));
    buttonEl.disabled = state.started && state.cursor < state.order.length;
  });
}

function setFeedback(message, kind = 'idle') {
  const el = $('#feedback');
  el.textContent = message;
  el.dataset.state = kind;
}

function stopClueAudio() {
  if (clueAudio) {
    clueAudio.pause();
    clueAudio.currentTime = 0;
    clueAudio = null;
  }
  $('#stop-audio-button').disabled = true;
}

function hearClue() {
  if (!voiceOn) { setFeedback('Voice is off. The written clue is always here to read.', 'idle'); return; }
  if (typeof window.Audio !== 'function') { setFeedback('Audio is unavailable in this browser. You can read the clue instead.', 'idle'); return; }
  stopClueAudio();
  const clip = `assets/audio/clues/clue-${String(currentIndex() + 1).padStart(2, '0')}.wav`;
  const audio = new Audio(clip);
  clueAudio = audio;
  const stopButton = $('#stop-audio-button');
  stopButton.disabled = false;
  const finishPlayback = () => {
    if (clueAudio !== audio) return;
    clueAudio = null;
    stopButton.disabled = true;
  };
  const failPlayback = () => {
    if (clueAudio !== audio) return;
    finishPlayback();
    setFeedback('This clue audio could not play. You can read the clue instead.', 'idle');
  };
  audio.addEventListener('ended', finishPlayback, { once: true });
  audio.addEventListener('error', failPlayback, { once: true });
  audio.play().catch(failPlayback);
}

function renderChallenge(focus = true) {
  stopClueAudio();
  if (state.cursor >= state.order.length) return completeRound();
  const word = currentWord();
  $('#clue-text').textContent = word.clue;
  $('#sentence-text').textContent = word.sentence;
  $('#word-index').textContent = `${String(state.cursor + 1).padStart(2, '0')} / ${String(state.order.length).padStart(2, '0')}`;
  $('#progress-count').textContent = state.mode === 'review' ? `Review ${state.cursor + 1}` : `Layer ${currentIndex() + 1}`;
  const built = Object.values(state.results).filter((r) => r === 'independent' || r === 'assisted').length;
  $('.progress-track').setAttribute('aria-valuemax', String(state.order.length));
  $('.progress-track').setAttribute('aria-valuenow', String(state.mode === 'review' ? state.cursor : state.cursor));
  $('#progress-fill').style.width = `${(state.cursor / state.order.length) * 100}%`;
  $('#review-badge').hidden = !word.list13Review;
  $('#theme-label').textContent = `YOUR ${themeNames[state.theme]} IS PRINTING`;
  $('#layer-caption').textContent = state.mode === 'review' ? 'TRICKY LAYER' : `LAYER ${String(currentIndex() + 1).padStart(2, '0')}`;
  $('#built-count').textContent = String(built);
  $('#layer-status').textContent = built ? `${plural(built, 'layer')} added to your creation.` : 'Nothing built yet—your first layer is next.';
  objectWrap.dataset.theme = state.theme;
  objectWrap.className = `object-wrap built-${Math.min(built, 7)}`;
  objectWrap.style.setProperty('--progress', String(.63 + .37 * Math.min(built, 20) / 20));
  $('#study-panel').hidden = true;
  $('#study-word').hidden = true;
  $('#peek-button').hidden = false;
  $('#ready-button').hidden = true;
  $('#next-button').hidden = true;
  $('#skip-button').hidden = false;
  $('#answer-form').hidden = false;
  input.disabled = false;
  input.value = '';
  setFeedback(state.misses[currentIndex()] ? 'Take a breath and try a different way of spelling it.' : 'Your word is your key. Take your time.');
  save();
  if (focus) setTimeout(() => input.focus({ preventScroll: true }), 30);
}

const themeNames = { bot: 'MOON-BOT', garden: 'MOON GARDEN', tower: 'UPSIDE-DOWN TOWER' };

function begin() {
  state.started = true;
  if (!state.order.length || state.cursor >= state.order.length) state = newState();
  save();
  show('game');
  renderChallenge();
}

function submitAnswer(event) {
  event.preventDefault();
  if ($('#answer-form').hidden) return;
  const index = currentIndex();
  const answer = input.value.trim().toLowerCase();
  if (!answer) { setFeedback('Type your best guess, or skip for now.', 'error'); input.focus(); return; }
  stopClueAudio();
  if (answer === words[index].word) {
    const assisted = Boolean(state.assisted[index]);
    state.results[index] = assisted ? 'assisted' : 'independent';
    save();
    $('#answer-form').hidden = true;
    $('#skip-button').hidden = true;
    $('#next-button').hidden = false;
    const built = Object.values(state.results).filter((r) => r === 'independent' || r === 'assisted').length;
    const nudge = built > 0 && built % 5 === 0 && built < words.length ? ' Five layers down—save and pause or keep going.' : '';
    setFeedback((assisted ? 'You used a practice peek, then spelled it again from memory. Nice work.' : 'That’s it! Your printer knows exactly what to make.') + nudge, 'success');
    objectWrap.className = `object-wrap built-${Math.min(built, 7)}`;
    objectWrap.style.setProperty('--progress', String(.63 + .37 * Math.min(built, 20) / 20));
    $('#built-count').textContent = String(built);
    $('#layer-caption').textContent = 'LAYER PRINTED!';
    $('#layer-status').textContent = assisted ? 'Practice peek, then a fresh recall—layer printed!' : 'You worked it out—layer printed!';
    $('.printer-card').classList.remove('printing');
    void $('.printer-card').offsetWidth;
    $('.printer-card').classList.add('printing');
    $('#next-button').focus();
  } else {
    state.misses[index] = (state.misses[index] || 0) + 1;
    if (!state.results[index]) state.results[index] = 'needs-help';
    save();
    const count = state.misses[index];
    const responses = [words[index].hint, 'Still tricky—and that’s okay. Use the clue again, or take a practice peek.'];
    setFeedback(responses[Math.min(count - 1, 1)], 'error');
    if (count >= 2) {
      $('#study-word').hidden = true;
      $('#study-panel').hidden = false;
      setFeedback('Want a quick practice peek? The word will hide before your next try.', 'help');
      $('#peek-button').focus();
    } else input.select();
  }
}

function nextWord() {
  state.cursor += 1;
  save();
  renderChallenge();
}

function skipWord() {
  const index = currentIndex();
  if (!state.results[index] || state.results[index] === 'needs-help') state.results[index] = 'skipped';
  save();
  state.cursor += 1;
  renderChallenge();
}

function practicePeek() {
  state.assisted[currentIndex()] = true;
  $('#study-panel').hidden = false;
  $('#answer-form').hidden = true;
  $('#skip-button').hidden = true;
  $('#study-word').textContent = currentWord().word;
  $('#study-word').hidden = false;
  $('#study-message').textContent = 'Take a good look. When you’re ready, try typing it from memory.';
  $('#peek-button').hidden = true;
  $('#ready-button').hidden = false;
  setFeedback('Look closely, then hide it and try again from memory.', 'help');
}

function readyToTry() {
  $('#study-panel').hidden = true;
  $('#study-word').hidden = true;
  $('#answer-form').hidden = false;
  $('#skip-button').hidden = false;
  input.value = '';
  input.focus();
  setFeedback('The word is hidden. Type it from memory when you’re ready.', 'help');
}

function completeRound() {
  stopClueAudio();
  save();
  if (state.mode === 'main') showFinish();
  else showFinish(true);
}

function showFinish(reviewCompleted = false) {
  const values = Object.values(state.results);
  const built = values.filter((r) => r === 'independent' || r === 'assisted').length;
  const independent = values.filter((r) => r === 'independent').length;
  const tricky = words.reduce((n, _, i) => n + (state.results[i] !== 'independent' ? 1 : 0), 0);
  $('#finish-built').textContent = String(built);
  $('#finish-independent').textContent = String(independent);
  $('#finish-review').textContent = String(tricky);
  $('#finish-title').textContent = reviewCompleted ? 'You came back for more!' : built === words.length ? 'Look what you made!' : 'Look what you made!';
  $('#finish-message').textContent = built === words.length
    ? 'Twenty words turned into something impossible.'
    : `${built} ${built === 1 ? 'layer is' : 'layers are'} printed. Your ${themeNames[state.theme].toLowerCase()} is one of a kind.`;
  $('#review-button').hidden = tricky === 0;
  $('#review-button').textContent = `Try tricky words again (${tricky}) →`;
  $('#finish-art').dataset.theme = state.theme;
  finish.dataset.partial = String(built < words.length);
  show('finish');
  save();
}

function startReview() {
  const retry = words.map((_, i) => i).filter((i) => state.results[i] !== 'independent');
  if (!retry.length) return;
  retry.forEach((i) => { state.assisted[i] = false; });
  state.order = retry;
  state.cursor = 0;
  state.mode = 'review';
  save();
  show('game');
  renderChallenge();
}

function reset() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Reset still clears in-memory state. */ }
  stopClueAudio();
  state = newState();
  document.querySelectorAll('.blueprint').forEach((el) => el.disabled = false);
  $('.finish-art').dataset.theme = 'bot';
  refreshHome();
  show('home');
}

document.querySelectorAll('.blueprint').forEach((button) => button.addEventListener('click', () => {
  if (state.started && state.cursor < state.order.length) return;
  state.theme = button.dataset.theme;
  refreshHome();
  save();
}));
$('#start-button').addEventListener('click', begin);
$('#answer-form').addEventListener('submit', submitAnswer);
$('#next-button').addEventListener('click', nextWord);
$('#skip-button').addEventListener('click', skipWord);
$('#ready-button').addEventListener('click', readyToTry);
$('#peek-button').addEventListener('click', practicePeek);
$('#pause-button').addEventListener('click', () => { stopClueAudio(); save(); refreshHome(); show('home'); });
$('#reset-button').addEventListener('click', reset);
$('#play-again-button').addEventListener('click', reset);
$('#review-button').addEventListener('click', startReview);
$('#hear-button').addEventListener('click', hearClue);
$('#stop-audio-button').addEventListener('click', () => {
  stopClueAudio();
  setFeedback('Audio stopped. You can keep reading the clue.', 'idle');
});
$('#sound-toggle').addEventListener('click', (event) => {
  voiceOn = !voiceOn;
  event.currentTarget.setAttribute('aria-pressed', String(voiceOn));
  event.currentTarget.innerHTML = voiceOn ? '🔊 <span>Voice on</span>' : '🔈 <span>Voice off</span>';
  event.currentTarget.setAttribute('aria-label', voiceOn ? 'Turn clue voice off' : 'Turn clue voice on');
  if (voiceOn && !sayAvailable) { voiceOn = false; event.currentTarget.setAttribute('aria-pressed', 'false'); event.currentTarget.innerHTML = '🔈 <span>No voice here</span>'; setFeedback('This browser has no speech voice. The written clues work the same way.'); }
  if (!voiceOn) stopClueAudio();
});

refreshHome();
if (state.started && state.order.length && state.cursor >= state.order.length) showFinish(state.mode === 'review');
else show('home');
