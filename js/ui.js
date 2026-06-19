/* 共用 UI：DOM 工具、Toast、彈窗、提示、HUD 碎片欄 */
import { state, save } from "./state.js";
import { sfx } from "./audio.js";

/* ---- 迷你 DOM 工具 ---- */
export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined && v !== false) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
  }
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);

/* ---- Toast ---- */
let toastTimer = null;
export function toast(msg, kind = "") {
  const t = $("#toast");
  t.className = "toast " + kind + " show";
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 2200);
}

/* ---- 彈窗 ---- */
export function modal(buildBody, { title = "", dismissable = true } = {}) {
  const overlay = $("#overlay");
  overlay.innerHTML = "";
  const card = h("div", { class: "panel modal" });
  if (title) card.appendChild(h("h3", {}, title));
  const body = h("div", {});
  buildBody(body, close);
  card.appendChild(body);
  overlay.appendChild(card);
  overlay.classList.remove("hidden");
  if (dismissable) {
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
  } else {
    overlay.onclick = null;
  }
  function close() { overlay.classList.add("hidden"); overlay.innerHTML = ""; overlay.onclick = null; }
  return close;
}

/* ---- 漸進式提示 ---- */
export function openHints(scene) {
  const id = scene.id;
  const hints = scene.hints || [];
  modal((body) => {
    const shown = () => state.hints[id] || 0;
    const list = h("ul", { class: "hint-list" });
    const moreBtn = h("button", { class: "btn ghost small" });

    function render() {
      list.innerHTML = "";
      const n = Math.min(shown(), hints.length);
      for (let i = 0; i < n; i++) {
        list.appendChild(h("li", {}, h("span", { class: "n" }, `提示 ${i + 1}`), hints[i]));
      }
      if (n === 0) list.appendChild(h("li", { class: "muted" }, "還沒揭開任何提示。真的卡住了再看吧 ;)"));
      moreBtn.textContent = (n >= hints.length) ? "沒有更多提示了" : `揭開下一個提示（${n}/${hints.length}）`;
      moreBtn.disabled = n >= hints.length;
    }
    moreBtn.onclick = () => { state.hints[id] = Math.min(shown() + 1, hints.length); save(); sfx.tap(); render(); };

    body.appendChild(h("p", { class: "muted" }, "提示會一個一個揭開，看你需要多少。"));
    body.appendChild(list);
    body.appendChild(moreBtn);
    render();
  }, { title: "🔮 需要一點提示？" });
}

/* ---- HUD 碎片欄 ---- */
const FRAG_ICON = { main: "✦", A: "❂", B: "❖" };
export function renderFragbar() {
  const bar = $("#fragbar");
  if (!bar) return;
  bar.innerHTML = "";
  for (const key of ["A", "main", "B"]) {
    const earned = state.fragments[key];
    bar.appendChild(h("div", { class: "frag " + (earned ? "earned" : ""), title: earned ? "已取得符文碎片" : "尚未取得" }, earned ? FRAG_ICON[key] : "·"));
  }
}
export function showHud(on) { $("#hud").classList.toggle("hidden", !on); }
