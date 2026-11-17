const grid = document.querySelector("#game-grid");
const note = document.querySelector("#availability-note");
const refreshButton = document.querySelector("#refresh-games");

const artMarks = {
  potato: "🥔",
  sevens: "7",
  printer: "▧",
  "printer-v2": "✳",
  illustrated: "✎",
  lab: "⚗"
};

function isLocalPath(path) {
  const url = new URL(path, window.location.href);
  return url.origin === window.location.origin && url.pathname.startsWith("/");
}

async function checkGame(game) {
  if (!isLocalPath(game.href) || !isLocalPath(game.entry)) return false;
  try {
    const response = await fetch(game.entry, {
      method: "HEAD",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      credentials: "same-origin",
      redirect: "error"
    });
    return response.ok && new URL(response.url).origin === window.location.origin;
  } catch {
    return false;
  }
}

function makeCard(game, available) {
  const article = document.createElement("article");
  article.className = `game-card hue-${game.hue}${available ? " is-ready" : " is-workshop"}`;
  article.dataset.gameId = game.id;

  const art = document.createElement("div");
  art.className = `card-art art-${game.art}`;
  art.setAttribute("aria-hidden", "true");
  art.innerHTML = `<span class="art-mark">${artMarks[game.art] ?? "✦"}</span><span class="art-squiggle"></span>`;

  const content = document.createElement("div");
  content.className = "card-content";
  const edition = document.createElement("p");
  edition.className = "edition-label";
  edition.textContent = game.edition;
  const title = document.createElement("h3");
  title.textContent = game.title;
  const invitation = document.createElement("p");
  invitation.className = "invitation";
  invitation.textContent = game.invitation;
  const action = available ? document.createElement("a") : document.createElement("span");
  action.className = available ? "card-action" : "card-action workshop-label";
  if (available) {
    action.href = game.href;
    action.textContent = "Play →";
    action.setAttribute("aria-label", `Play ${game.title}, ${game.edition.toLowerCase()}`);
  } else {
    action.textContent = "In the workshop";
    action.setAttribute("aria-label", `${game.title}: in the workshop, not available in this copy`);
  }

  content.append(edition, title, invitation, action);
  article.append(art, content);
  return article;
}

async function renderGames() {
  refreshButton.disabled = true;
  grid.setAttribute("aria-busy", "true");
  note.textContent = "Checking which game doors are open…";
  try {
    const response = await fetch("arcade/games.json", { cache: "no-store", credentials: "same-origin" });
    if (!response.ok || new URL(response.url).origin !== window.location.origin) throw new Error("Arcade list unavailable");
    const config = await response.json();
    if (config.version !== 1 || !Array.isArray(config.games) || config.games.length !== 5) throw new Error("Arcade list is incomplete");
    const availability = await Promise.all(config.games.map(checkGame));
    const entries = config.games.map((game, index) => ({ game, available: availability[index] }));
    entries.sort((a, b) => Number(b.available) - Number(a.available));
    grid.replaceChildren(...entries.map(({ game, available }) => makeCard(game, available)));
    const readyCount = entries.filter(({ available }) => available).length;
    note.textContent = readyCount === 1 ? "One game door is open. The rest are being built." : `${readyCount} game doors open. ${entries.length - readyCount} worlds are still in the workshop.`;
  } catch {
    grid.replaceChildren();
    note.textContent = "The game list could not load. Check your local server, then try again.";
  } finally {
    grid.setAttribute("aria-busy", "false");
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", renderGames);
renderGames();
