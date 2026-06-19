/* 支線B · B2 — 光徑迷宮
   旋轉每塊導光磚（點擊轉 90°），把左側泉源的魔法光導到右側的門。
   只比對「連通性」，多解皆可。保證可解（打亂的只是旋轉角）。 */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

const N = 1, E = 2, S = 4, W = 8;
const OPP = { 1: 4, 4: 1, 2: 8, 8: 2 };
const rotCW = (c) => ((c << 1) | (c >> 3)) & 15;
const SRC = 4, DOOR = 11, COLS = 4;

export function lightMaze(host, params, ctx) {
  // base 連接型態（含解的路徑磚），rot 起始隨機打亂
  const base = [3,10,11,12, 10,12,10,6, 9,3,10,10, 6,5,3,9];
  const rot = base.map(() => Math.floor(Math.random() * 4));
  let solved = false;

  const eff = (i) => { let c = base[i]; for (let k = 0; k < rot[i]; k++) c = rotCW(c); return c; };

  function litSet() {
    const lit = new Set();
    if (!(eff(SRC) & W)) return lit;       // 泉源從西邊注入 SRC
    const stack = [SRC]; lit.add(SRC);
    while (stack.length) {
      const i = stack.pop(), r = Math.floor(i / COLS), c = i % COLS, cur = eff(i);
      const tries = [[N, i - COLS, r > 0], [S, i + COLS, r < 3], [E, i + 1, c < 3], [W, i - 1, c > 0]];
      for (const [d, j, ok] of tries) {
        if (!ok || !(cur & d) || lit.has(j)) continue;
        if (eff(j) & OPP[d]) { lit.add(j); stack.push(j); }
      }
    }
    return lit;
  }

  const S0 = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cv = h("canvas", { width: S0 * dpr, height: S0 * dpr });
  const g = cv.getContext("2d"); g.scale(dpr, dpr);
  const M = 20, CELL = (S0 - 2 * M) / COLS;
  const center = (i) => ({ x: M + (i % COLS) * CELL + CELL / 2, y: M + Math.floor(i / COLS) * CELL + CELL / 2 });

  function draw() {
    const lit = litSet();
    g.clearRect(0, 0, S0, S0);
    for (let i = 0; i < 16; i++) {
      const r = Math.floor(i / COLS), c = i % COLS, x = M + c * CELL, y = M + r * CELL;
      g.fillStyle = "rgba(255,255,255,.03)"; g.strokeStyle = "rgba(201,162,94,.18)";
      roundRect(g, x + 2, y + 2, CELL - 4, CELL - 4, 8); g.fill(); g.stroke();
      const ce = center(i), conn = eff(i), on = lit.has(i);
      g.strokeStyle = on ? "#ffe6a0" : "#6f5fb0";
      g.lineWidth = 8; g.lineCap = "round";
      if (on) { g.shadowColor = "#e8c178"; g.shadowBlur = 14; }
      const ends = [[N, 0, -1], [E, 1, 0], [S, 0, 1], [W, -1, 0]];
      for (const [d, dx, dy] of ends) if (conn & d) {
        g.beginPath(); g.moveTo(ce.x, ce.y); g.lineTo(ce.x + dx * CELL / 2, ce.y + dy * CELL / 2); g.stroke();
      }
      g.shadowBlur = 0;
      g.beginPath(); g.arc(ce.x, ce.y, 5, 0, Math.PI * 2);
      g.fillStyle = on ? "#fff3cf" : "#3a2c5e"; g.fill();
    }
    // 泉源（左）與門（右）
    const sc = center(SRC), dc = center(DOOR);
    g.fillStyle = "#b9a7ff"; g.beginPath(); g.arc(M / 2, sc.y, 7, 0, Math.PI * 2); g.fill();
    const open = lit.has(DOOR) && (eff(DOOR) & E);
    g.fillStyle = open ? "#7fe3a3" : "#ff9ec4";
    if (open) { g.shadowColor = "#7fe3a3"; g.shadowBlur = 18; }
    roundRect(g, S0 - M + 2, dc.y - 16, 10, 32, 4); g.fill(); g.shadowBlur = 0;
  }

  function check() {
    if (solved) return;
    const lit = litSet();
    if (lit.has(DOOR) && (eff(DOOR) & E)) {
      solved = true; sfx.unlock(); draw();
      toast("光芒貫通，石門應聲開啟！", "ok");
      setTimeout(() => ctx.solve(), 1100);
    }
  }

  cv.addEventListener("pointerdown", (e) => {
    if (solved) return;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * S0, y = (e.clientY - r.top) / r.height * S0;
    const c = Math.floor((x - M) / CELL), rr = Math.floor((y - M) / CELL);
    if (c < 0 || c >= COLS || rr < 0 || rr >= 4) return;
    const i = rr * COLS + c; rot[i] = (rot[i] + 1) % 4; sfx.tap(); draw(); check();
  });

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "光之導引"),
      h("p", {}, "左側星泉湧出魔法之光，卻被打亂的導光磚截斷。點擊每塊磚旋轉它，鋪出一條從星泉通往右側石門的光路。"),
    ),
    h("div", { class: "puzzle-stage" }, h("div", { class: "canvas-stage" }, cv)),
    h("div", { class: "note" }, "點一下磚塊可旋轉 90°。光接通到右側門即過關。"),
  ));
  draw();
}

function roundRect(g, x, y, w, hh, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r);
  g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
