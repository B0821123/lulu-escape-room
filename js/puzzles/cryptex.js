/* M1 — 咒語密碼筒（Cryptex + 鴿籠密碼 Pigpen）
   石筒上方每個符號＝一個字母（鴿籠密碼）。空格只作片語分隔，不需轉動。
   刻意「不顯示每輪對錯」，必須真的把符號讀懂。 */
import { h, modal, toast } from "../ui.js";
import { sfx } from "../audio.js";

const NS = "http://www.w3.org/2000/svg";
const A26 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* 井字格四面牆與 X 對角線座標（30x30 viewBox） */
const WALL = { t: [6, 6, 24, 6], r: [24, 6, 24, 24], b: [6, 24, 24, 24], l: [6, 6, 6, 24] };
const TT = { A: ["r","b"], B: ["l","r","b"], C: ["l","b"], D: ["t","r","b"], E: ["t","r","b","l"], F: ["t","l","b"], G: ["t","r"], H: ["t","l","r"], I: ["t","l"] };
const DIAG = { ul: [6,6,15,15], ur: [24,6,15,15], dl: [6,24,15,15], dr: [24,24,15,15] };
const XS = { S: ["ul","ur"], T: ["ul","dl"], U: ["ur","dr"], V: ["dl","dr"] };

function glyphSpec(L) {
  if (TT[L]) return { lines: TT[L].map(w => WALL[w]), dot: false };
  if ("JKLMNOPQR".includes(L)) return { lines: TT["ABCDEFGHI"["JKLMNOPQR".indexOf(L)]].map(w => WALL[w]), dot: true };
  if (XS[L]) return { lines: XS[L].map(d => DIAG[d]), dot: false };
  if ("WXYZ".includes(L)) return { lines: XS["STUV"["WXYZ".indexOf(L)]].map(d => DIAG[d]), dot: true };
  return { lines: [], dot: false };
}
function svg(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function pigpen(letter, size = 42, color = "#e8c178") {
  const s = glyphSpec(letter), el = svg("svg", { viewBox: "0 0 30 30", width: size, height: size });
  for (const [x1, y1, x2, y2] of s.lines) el.appendChild(svg("line", { x1, y1, x2, y2, stroke: color, "stroke-width": 2.6, "stroke-linecap": "round" }));
  if (s.dot) el.appendChild(svg("circle", { cx: 15, cy: 15, r: 2.3, fill: color }));
  return el;
}

/* 對照表：四張鴿籠系統圖（井字 ×2、X ×2） */
function ttDiagram(letters9, dotted) {
  const el = svg("svg", { viewBox: "0 0 60 60", width: 92, height: 92 });
  [[20,4,20,56],[40,4,40,56],[4,20,56,20],[4,40,56,40]].forEach(([x1,y1,x2,y2]) => el.appendChild(svg("line", { x1,y1,x2,y2, stroke:"#c9a25e", "stroke-width":1.5 })));
  const cx = [11,30,49], cy = [11,30,49];
  letters9.split("").forEach((ch, i) => {
    const x = cx[i%3], y = cy[(i/3)|0];
    const t = svg("text", { x, y: y+1, "text-anchor":"middle", "dominant-baseline":"middle", "font-size":9, fill:"#ece6d3", "font-family":"Cinzel, serif" }); t.textContent = ch; el.appendChild(t);
    if (dotted) el.appendChild(svg("circle", { cx:x, cy:y+7, r:1.3, fill:"#ece6d3" }));
  });
  return el;
}
function xDiagram(letters4, dotted) {
  const el = svg("svg", { viewBox: "0 0 60 60", width: 92, height: 92 });
  [[6,6,54,54],[54,6,6,54]].forEach(([x1,y1,x2,y2]) => el.appendChild(svg("line", { x1,y1,x2,y2, stroke:"#c9a25e", "stroke-width":1.5 })));
  const spots = [[30,15],[15,30],[45,30],[30,45]]; // S 上、T 左、U 右、V 下
  letters4.split("").forEach((ch, i) => {
    const [x, y] = spots[i];
    const t = svg("text", { x, y, "text-anchor":"middle", "dominant-baseline":"middle", "font-size":9, fill:"#ece6d3", "font-family":"Cinzel, serif" }); t.textContent = ch; el.appendChild(t);
    if (dotted) el.appendChild(svg("circle", { cx:x, cy:y+8, r:1.3, fill:"#ece6d3" }));
  });
  return el;
}
function grimoire() {
  const fig = (node, cap) => h("figure", {}, node, h("figcaption", {}, cap));
  return h("div", { class: "grimoire" },
    fig(ttDiagram("ABCDEFGHI", false), "A – I"),
    fig(ttDiagram("JKLMNOPQR", true), "J – R（加點）"),
    fig(xDiagram("STUV", false), "S – V"),
    fig(xDiagram("WXYZ", true), "W – Z（加點）"),
  );
}

function openPicker(cb) {
  modal((body, close) => {
    const grid = h("div", { class: "letter-picker" });
    for (const L of A26) grid.appendChild(h("button", { class: "lp-btn", onclick: () => { cb(L); sfx.tap(); close(); } }, L));
    body.appendChild(grid);
  }, { title: "選擇符文字母" });
}

export function cryptex(host, params, ctx) {
  const phrase = (params.answer || ctx.config.answers?.luluPiggy || ctx.config.spell || "LULU PIGGY").toUpperCase();
  const spell = phrase.replace(/[^A-Z]/g, "") || "LULUPIGGY";
  const tokens = [...phrase].filter(ch => /[A-Z\s]/.test(ch));
  const letters = Array(spell.length).fill("A");
  const letterEls = [];

  const row = h("div", { class: "cryptex" });
  let letterIndex = 0;
  for (const token of tokens) {
    if (token === " ") {
      row.appendChild(h("div", { class: "dial-space", title: "片語空格" }, " "));
      continue;
    }
    const i = letterIndex++;
    const letterEl = h("div", { class: "dial-letter", onclick: () => openPicker(v => { letters[i] = v; refresh(); }) }, "A");
    letterEls.push(letterEl);
    row.appendChild(h("div", { class: "dial" },
      h("div", { class: "dial-glyph", title: "待解的符號" }, pigpen(spell[i])),
      h("button", { class: "dial-arrow", onclick: () => cycle(i, 1) }, "▲"),
      letterEl,
      h("button", { class: "dial-arrow", onclick: () => cycle(i, -1) }, "▼"),
    ));
  }
  function cycle(i, d) { letters[i] = A26[(A26.indexOf(letters[i]) + d + 26) % 26]; sfx.tap(); refresh(); }
  function refresh() { letters.forEach((c, i) => letterEls[i].textContent = c); }

  const submit = h("button", { class: "btn", onclick: () => {
    if (letters.join("") === spell) { sfx.unlock(); ctx.solve(); }
    else { sfx.bad(); toast("石筒紋風不動…字母還不對。", "bad"); }
  }}, "解封咒語");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "咒語密碼筒"),
      h("p", {}, "石筒上方刻著一排古老符號，每個符號代表一個英文字母。轉動下方的滾輪拼出失落的片語，封印就會鬆開。"),
      h("p", { class: "muted", style: { fontSize: "13px" } }, "※ 空白是片語分隔，不用轉。滾輪不會提示對錯；點字母可快速選字。"),
    ),
    h("div", { class: "puzzle-stage" }, row),
    submit,
    h("details", { style: { marginTop: "14px" } },
      h("summary", { class: "muted", style: { cursor: "pointer" } }, "翻開符文對照表（鴿籠密碼）"),
      grimoire()),
  ));
  refresh();
}
