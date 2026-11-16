import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, extname, normalize } from "node:path";

const chromiumPath = process.env.CHROMIUM ?? "/snap/bin/chromium";
const repo = resolve(new URL("..", import.meta.url).pathname);
const profile = await mkdtemp(join(tmpdir(), "wordwild-arcade-chrome-"));
let fixtureEnabled = false;
let server;
let browser;
let socket;
let commandId = 0;
const pending = new Map();
const requestedUrls = new Set();

function mime(file) {
  return ({ ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json" })[extname(file)] ?? "application/octet-stream";
}

server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  if (url.pathname === "/__test/enable-fixture") {
    fixtureEnabled = true;
    response.writeHead(200, { "Content-Type": "text/plain" }).end("enabled");
    return;
  }
  if (url.pathname === "/flashcards/index.html" || url.pathname === "/flashcards/") {
    if (!fixtureEnabled) {
      response.writeHead(404).end();
    } else if (request.method === "HEAD") {
      response.writeHead(200, { "Content-Type": "text/html" }).end();
    } else {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end('<!doctype html><title>Flashcards fixture</title><main><h1>Flashcards fixture</h1><a href="/">Back to WordWild</a></main>');
    }
    return;
  }
  const pathname = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\]*\.\.[/\\])+/, "");
  // PUBLIC COPY: this test models games that are NOT installed yet, but here the real game folders exist.
  // Hide them from the test server so the "absent game" assertions stay meaningful (the fixture above stands in for flashcards).
  if (/^\/(flashcards|game|printer-v2)\//.test(pathname)) { response.writeHead(404).end(); return; }
  const file = resolve(repo, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(`${repo}/`) && file !== repo) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": mime(file), "Cache-Control": "no-store" });
    if (request.method === "HEAD") response.end();
    else response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});

function send(method, params = {}) {
  const id = ++commandId;
  return new Promise((resolvePromise, rejectPromise) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      rejectPromise(new Error(`CDP timeout: ${method}`));
    }, 10000);
    pending.set(id, { resolve: resolvePromise, reject: rejectPromise, timeout, method });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? JSON.stringify(result.exceptionDetails));
  return result.result?.value;
}

async function waitFor(expression, description) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const value = await evaluate(expression);
      if (value) return value;
    } catch { /* page is still navigating */ }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

try {
  await new Promise((resolvePromise, rejectPromise) => {
    server.once("error", rejectPromise);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const debugPortServer = createNetServer();
  await new Promise((resolvePromise, rejectPromise) => {
    debugPortServer.once("error", rejectPromise);
    debugPortServer.listen(0, "127.0.0.1", resolvePromise);
  });
  const debugPort = debugPortServer.address().port;
  await new Promise((resolvePromise) => debugPortServer.close(resolvePromise));
  browser = spawn(chromiumPath, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--no-proxy-server",
    `--user-data-dir=${profile}`, `--remote-debugging-port=${debugPort}`, "--remote-allow-origins=*", "about:blank"
  ], { stdio: "ignore" });

  let targetsResponse;
  const startupDeadline = Date.now() + 15000;
  while (!targetsResponse && Date.now() < startupDeadline) {
    try {
      const candidate = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (candidate.ok) targetsResponse = candidate;
    } catch { await new Promise((resolvePromise) => setTimeout(resolvePromise, 100)); }
  }
  assert.ok(targetsResponse, "Chromium should expose a local DevTools port");
  const targets = await targetsResponse.json();
  const target = targets.find(({ type }) => type === "page");
  assert.ok(target?.webSocketDebuggerUrl, "Chromium should provide a page target");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolvePromise, rejectPromise) => {
    socket.addEventListener("open", resolvePromise, { once: true });
    socket.addEventListener("error", rejectPromise, { once: true });
  });
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Network.requestWillBeSent") requestedUrls.add(message.params.request.url);
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(entry.timeout);
      if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`));
      else entry.resolve(message.result);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `${origin}/` });
  const initial = await waitFor("document.querySelector('#game-grid')?.getAttribute('aria-busy') === 'false'", "initial arcade scan");
  assert.equal(initial, true);
  assert.equal(await evaluate("document.querySelectorAll('.game-card').length"), 5);
  assert.equal(await evaluate("document.querySelectorAll('.card-action[href]').length"), 0, "absent games must not get Play links");
  assert.equal(await evaluate("document.querySelectorAll('.workshop-label').length"), 5);
  assert.match(await evaluate("document.querySelector('#availability-note').textContent"), /0 game doors open/);

  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate("document.activeElement.classList.contains('skip-link')"), true, "first keyboard stop should be skip navigation");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate("document.activeElement.classList.contains('brand')"), true, "brand navigation should follow the skip link");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate("document.activeElement.id"), "refresh-games", "refresh action should be keyboard reachable");

  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.game-grid')).gridTemplateColumns.split(' ').length"), 1, "mobile cards should stack into one column");
  assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true, "mobile layout should not scroll horizontally");
  assert.ok(await evaluate("document.querySelector('#refresh-games').getBoundingClientRect().height >= 44"), "touch refresh control should be at least 44px tall");

  await evaluate("fetch('/__test/enable-fixture')");
  await evaluate("document.querySelector('#refresh-games').click()");
  await waitFor("document.querySelector('.game-card.is-ready')?.dataset.gameId === 'flashcards-original'", "fixture game becoming available");
  assert.equal(await evaluate("document.querySelector('.game-card').dataset.gameId"), "flashcards-original", "playable games should sort first");
  assert.equal(await evaluate("document.querySelectorAll('.card-action[href]').length"), 1);
  assert.equal(await evaluate("new URL(document.querySelector('.card-action[href]').href).origin === location.origin"), true);
  const playUrl = await evaluate("document.querySelector('.game-card.is-ready .card-action').href");
  assert.equal(new URL(playUrl).pathname, "/flashcards/");
  await send("Page.navigate", { url: playUrl });
  await waitFor("location.pathname === '/flashcards/'", "Play navigation");
  assert.equal(await evaluate("location.origin"), origin, "Play should stay on the local origin");
  assert.equal(await waitFor("document.querySelector('h1')?.textContent === 'Flashcards fixture'", "play target load"), true);
  assert.equal(await evaluate("document.querySelector('a').getAttribute('href')"), "/", "fixture should provide an arcade Home link");
  await send("Page.navigate", { url: `${origin}/` });
  await waitFor("location.pathname === '/'", "Home navigation");
  assert.equal(await evaluate("location.origin"), origin, "Home should return to the arcade on the same origin");
  await waitFor("document.querySelector('#game-grid')?.getAttribute('aria-busy') === 'false'", "arcade Home view");

  const remoteRequests = [...requestedUrls].filter((url) => new URL(url).origin !== origin);
  assert.deepEqual(remoteRequests, [], "arcade must make no requests outside its local origin");
  assert.equal(await evaluate("document.querySelectorAll('.game-card').length"), 5);
  console.log("PASS: absent game doors, ready-game detection, keyboard flow, 375px layout/touch size, local Play/Home navigation, and no off-origin requests.");
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  if (browser && browser.exitCode === null) browser.kill("SIGTERM");
  if (server?.listening) await new Promise((resolvePromise) => server.close(resolvePromise));
  await rm(profile, { recursive: true, force: true });
}
