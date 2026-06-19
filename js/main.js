/* 啟動、hash 路由、場景渲染、Hub、終局、HUD、dev 面板 */
import { config } from "./config.js";
import { state, save, isSolved, markSolved, grantReward, earnFragment, allFragments, reset } from "./state.js";
import { h, $, toast, modal, openHints, renderFragbar, showHud } from "./ui.js";
import { sfx, ensureAudio } from "./audio.js";
import { PUZZLES } from "./puzzles/index.js";
import { SCENES, PATHS, PALACE, M5_ORDER, COVER, HUB, FINALE, fmtDate } from "./scenes.js";

const app = () => $("#app");
const DEV = new URLSearchParams(location.search).has("dev");

/* ---------- 導覽 ---------- */
function go(id) { if (location.hash.slice(1) === id) route(); else location.hash = id; }

function pathOf(id) {
  for (const [key, p] of Object.entries(PATHS)) if (p.ids.includes(id)) return { key, ...p };
  return null;
}

window.addEventListener("hashchange", route);

function route() {
  const id = location.hash.slice(1);
  window.scrollTo(0, 0);
  if (!state.started && id !== "intro") return renderCover();
  if (id === "" || id === "intro") return state.started ? renderHub() : renderCover();
  if (id === "hub") return renderHub();
  if (id === "finale") return renderFinale();
  if (SCENES[id]) return renderScene(id);
  return renderHub();
}

/* ---------- 封面 ---------- */
function renderCover() {
  showHud(false);
  const a = app(); a.innerHTML = "";
  a.appendChild(h("div", { class: "cover fade-in" },
    h("div", { class: "crest" }, COVER.crest),
    h("h1", {}, COVER.title),
    h("div", { class: "sub" }, COVER.sub),
    h("div", { class: "panel", style: { textAlign: "left", marginBottom: "22px" } },
      ...COVER.lines.map(t => h("p", { class: "story", html: t }))),
    h("button", { class: "btn", onclick: () => { ensureAudio(); state.started = true; save(); go("hub"); } }, COVER.begin),
    state.started ? h("button", { class: "btn ghost", style: { marginTop: "10px" }, onclick: () => go("hub") }, "繼續上次進度") : null,
  ));
  renderDev();
}

/* ---------- 大廳 Hub ---------- */
function renderHub() {
  showHud(true); renderFragbar();
  const a = app(); a.innerHTML = "";
  a.appendChild(h("div", { class: "fade-in" },
    h("div", { class: "kicker" }, "光陰圖書館"),
    h("h2", { class: "scene-title" }, HUB.title),
    h("div", { class: "story" }, ...HUB.intro.map(t => h("p", {}, t))),
  ));

  const paths = h("div", { class: "paths" });
  for (const key of ["main", "A", "B"]) {
    const p = PATHS[key];
    const solved = p.ids.filter(isSolved).length;
    const done = state.fragments[p.fragment];
    const firstUnsolved = p.ids.find(id => !isSolved(id)) || p.ids[0];
    const detail = done ? "已尋回符文碎片" : (p.ids.length > 1 ? `進度 ${solved} / ${p.ids.length}` : "尚未尋回");
    paths.appendChild(h("button", { class: "path-card " + (done ? "done" : ""), onclick: () => go(firstUnsolved) },
      h("div", { class: "icon" }, p.icon),
      h("div", { class: "meta" },
        h("div", { class: "t" }, p.title),
        h("div", { class: "d" }, detail)),
      h("div", { class: "status" }, done ? "✓ 完成" : "進入 →"),
    ));
  }
  // 終局卡
  const unlocked = allFragments();
  paths.appendChild(h("button", { class: "path-card finale " + (unlocked ? "" : "locked"),
    onclick: () => unlocked ? go("finale") : toast("集齊三枚符文碎片後才會解鎖。") },
    h("div", { class: "icon" }, unlocked ? "📖" : "🔒"),
    h("div", { class: "meta" },
      h("div", { class: "t" }, "終局 · 告白之書"),
      h("div", { class: "d" }, unlocked ? "封印已鬆動，翻開它" : "需要三枚符文碎片")),
    h("div", { class: "status" }, unlocked ? "開啟 →" : `${[...Object.values(state.fragments)].filter(Boolean).length}/3`),
  ));
  a.appendChild(paths);
  renderDev();
}

/* ---------- 一般謎題場景 ---------- */
function renderScene(id) {
  const scene = { id, ...SCENES[id] };
  showHud(true); renderFragbar();
  const a = app(); a.innerHTML = "";
  const wrap = h("div", { class: "fade-in" });

  wrap.appendChild(h("div", { class: "kicker" }, scene.kicker));
  wrap.appendChild(h("h2", { class: "scene-title", html: scene.title }));
  if (scene.intro) wrap.appendChild(h("div", { class: "story" }, ...scene.intro.map(t => h("p", { html: t }))));
  if (scene.parchment) wrap.appendChild(h("div", { class: "parchment" },
    h("h3", {}, scene.parchment.title), h("p", {}, scene.parchment.body)));
  if (scene.extra) renderExtra(scene.extra, wrap);

  if (scene.hints) wrap.appendChild(h("button", { class: "btn ghost small", style: { marginTop: "10px" }, onclick: () => openHints(scene) }, "🔮 需要提示"));

  const host = h("div", {});
  wrap.appendChild(host);
  a.appendChild(wrap);

  const ctx = { config, scene, solve: () => onSolve(id) };
  PUZZLES[scene.puzzle.name](host, scene.puzzle.params, ctx);
  renderDev(id);
}

function renderExtra(name, host) {
  if (name === "m5digits") {
    const body = h("div", { class: "story" });
    for (const k of M5_ORDER) {
      const got = state.rewards[k];
      body.appendChild(h("p", {}, `${PALACE[k].name}印記：`, h("b", { style: { color: "#e8c178", fontSize: "20px" } }, got != null ? String(got) : "？")));
    }
    host.appendChild(h("div", { class: "parchment" },
      h("h3", {}, "三枚頁角印記"), body,
      h("div", { class: "clue" }, "排列之序：第一頁角 → 第二頁角 → 第三頁角。")));
  }
}

/* ---------- 解開一關 ---------- */
function onSolve(id) {
  const scene = SCENES[id];
  markSolved(id);
  if (scene.reward) grantReward(id, scene.reward.digit);
  sfx.good();

  const p = pathOf(id);
  const idx = p.ids.indexOf(id);
  const last = idx === p.ids.length - 1;
  if (last) {
    earnFragment(p.fragment); renderFragbar();
    setTimeout(() => fragmentModal(p, scene), 600);
  } else if (scene.outro) {
    setTimeout(() => keeperModal(scene, () => go(p.ids[idx + 1])), 400);
  } else {
    setTimeout(() => go(p.ids[idx + 1]), 500);
  }
}

/* 守書人的過場旁白（謎題之間的故事銜接） */
function keeperModal(scene, cb) {
  modal((body, close) => {
    (scene.outro || []).forEach(t => body.appendChild(h("p", { class: "story", html: t })));
    if (scene.reward) body.appendChild(h("p", { class: "center", style: { color: "#e8c178", marginTop: "8px" } }, `（書頁浮現 ${scene.reward.name}印記「${scene.reward.digit}」）`));
    body.appendChild(h("div", { class: "spacer" }));
    body.appendChild(h("button", { class: "btn", onclick: () => { close(); cb(); } }, "繼續 →"));
  }, { title: "📖 守書人", dismissable: false });
}

function fragmentModal(p, scene) {
  modal((body, close) => {
    if (scene && scene.outro) scene.outro.forEach(t => body.appendChild(h("p", { class: "story", html: t })));
    body.appendChild(h("div", { class: "center", style: { fontSize: "48px" } }, p.icon));
    body.appendChild(h("p", { class: "center story" }, "這段記憶凝成了一枚符文碎片。"));
    body.appendChild(h("p", { class: "center muted" }, allFragments() ? "三段記憶到齊——《告白之書》的封印鬆動了。" : `已尋回 ${[...Object.values(state.fragments)].filter(Boolean).length} / 3 段`));
    const btn = h("button", { class: "btn", onclick: () => { close(); allFragments() ? go("finale") : go("hub"); } }, allFragments() ? "前往終局 📖" : "回到大廳");
    body.appendChild(h("div", { class: "spacer" })); body.appendChild(btn);
  }, { title: "✦ 符文碎片", dismissable: false });
}

/* ---------- 終局 ---------- */
function renderFinale() {
  showHud(true); renderFragbar();
  const a = app(); a.innerHTML = "";
  if (!allFragments()) {
    a.appendChild(h("div", { class: "fade-in" },
      h("h2", { class: "scene-title" }, "封印尚未鬆動"),
      h("p", { class: "story" }, "你還需要集齊三枚符文碎片，才能翻開《告白之書》。"),
      h("button", { class: "btn", onclick: () => go("hub") }, "回到大廳")));
    return renderDev();
  }
  const wrap = h("div", { class: "fade-in finale-book" });
  wrap.appendChild(h("div", { class: "kicker" }, FINALE.kicker));
  wrap.appendChild(h("h2", { class: "scene-title", style: { textAlign: "center" } }, h("span", { class: "glow" }, FINALE.title)));
  wrap.appendChild(h("div", { class: "story" }, ...FINALE.intro.map(t => h("p", { html: t }))));

  // 三道凹槽
  const socketEls = FINALE.sockets.map(lb => h("div", { class: "socket" },
    h("span", { class: "socket-glyph" }, ""), h("div", { class: "socket-label" }, lb)));
  wrap.appendChild(h("div", { class: "socket-row" }, ...socketEls));
  wrap.appendChild(h("div", { class: "note" }, "輕觸下方的符文碎片，把它們一一放回書台。"));

  // 三枚碎片，依序嵌入任一空槽
  const seated = FINALE.sockets.map(() => null);
  let placed = 0, done = false;
  const tokenRow = h("div", { class: "token-row" });
  FINALE.fragments.forEach(f => {
    const tok = h("button", { class: "frag-token" }, f.glyph);
    tok.onclick = () => {
      if (done || tok.disabled) return;
      const slot = seated.findIndex(x => x === null);
      if (slot < 0) return;
      seated[slot] = f.glyph;
      socketEls[slot].querySelector(".socket-glyph").textContent = f.glyph;
      socketEls[slot].classList.add("filled");
      tok.disabled = true; tok.classList.add("used");
      sfx.tap(); placed++;
      if (placed === FINALE.fragments.length) { done = true; sfx.unlock(); setTimeout(revealLetter, 1000); }
    };
    tokenRow.appendChild(tok);
  });
  wrap.appendChild(tokenRow);
  a.appendChild(wrap);
  renderDev();
}

function revealLetter() {
  state.finished = true; save();
  sfx.unlock();
  const a = app(); a.innerHTML = "";
  const f = config.finale;
  const letter = h("div", { class: "letter fade-in" });
  letter.appendChild(h("h2", {}, f.title));
  letter.appendChild(h("p", {}, "三枚符文碎片嵌回書脊後，散落的頁碼終於排成完整的一章。"));
  letter.appendChild(h("p", {}, "守書人把書推到你面前，微笑著退到星光裡：「故事到這裡，該交給寫下它的人了。」"));
  const editable = h("div", { class: "editable-letter" });
  for (const para of f.message) editable.appendChild(h("p", {}, para));
  letter.appendChild(editable);
  letter.appendChild(h("p", {}, "讀完最後一行時，圖書館沒有關門。它只是把燈留著，等你們一起把下一頁寫下去。"));
  letter.appendChild(h("p", { style: { textAlign: "right", marginTop: "18px" } }, "— " + (f.signature || config.author)));

  const wrap = h("div", { class: "finale-book" },
    h("div", { class: "hearts fade-in" }, "🎉  ✦  🎂  ✦  🎉"),
    letter);

  if (f.photos && f.photos.length) {
    const ph = h("div", { class: "photos fade-in" });
    f.photos.forEach(src => ph.appendChild(h("img", { src, alt: "我們的回憶", loading: "lazy" })));
    wrap.appendChild(ph);
  } else {
    wrap.appendChild(h("div", { class: "hearts fade-in" }, "❤  ❤  ❤"));
  }
  wrap.appendChild(h("p", { class: "center", style: { color: "#e8c178", marginTop: "16px", fontSize: "18px" } }, `🎂 ${fmtDate(config.birthday)} · 生日快樂`));
  if (f.finalNote) wrap.appendChild(h("p", { class: "center muted", style: { marginTop: "6px" } }, f.finalNote));
  wrap.appendChild(h("button", { class: "btn ghost", style: { marginTop: "18px" }, onclick: () => go("hub") }, "回到圖書館"));
  app().appendChild(wrap);
  showHud(true); renderFragbar();
}

/* ---------- dev 面板（網址加 ?dev） ---------- */
function renderDev(currentId) {
  const old = $("#dev"); if (old) old.remove();
  if (!DEV) return;
  const panel = h("div", { id: "dev" },
    h("button", { onclick: () => { ["main","A","B"].forEach(k => earnFragment(k)); renderFragbar(); toast("DEV：已給予三碎片"); } }, "碎片×3"),
    currentId && SCENES[currentId] ? h("button", { onclick: () => onSolve(currentId) }, "解此關") : null,
    h("button", { onclick: () => { if (confirm("重置全部進度？")) { reset(); location.hash = "intro"; route(); } } }, "重置"),
  );
  document.body.appendChild(panel);
}

/* ---------- HUD 按鈕 ---------- */
$("#hud-home").addEventListener("click", () => go("hub"));
$("#hud-mute").addEventListener("click", (e) => {
  state.muted = !state.muted; save();
  e.currentTarget.textContent = state.muted ? "🔇" : "♪";
  e.currentTarget.style.opacity = state.muted ? .5 : 1;
  if (!state.muted) sfx.tap();
});
if (state.muted) { $("#hud-mute").textContent = "🔇"; $("#hud-mute").style.opacity = .5; }

/* ---------- 啟動 ---------- */
if (DEV) { window.__solve = onSolve; window.__state = state; window.__go = go; }
route();
