/* M3 — 星盤對齊（視覺/空間）
   三圈可旋轉星環，把線索指定的符號各自轉到頂端指針。
   params: { rings:[{symbols:[..], target:idx}, x3], reveal: "5" } */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

export function astrolabe(host, params, ctx) {
  const S = 340, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cv = h("canvas", { width: S * dpr, height: S * dpr });
  const g = cv.getContext("2d"); g.scale(dpr, dpr);
  const cx = S / 2, cy = S / 2;
  const bands = [138, 100, 62];          // 三圈半徑
  const hit = [[118, 158], [80, 118], [34, 80]]; // 命中半徑帶
  let solved = false;

  const rings = params.rings.map((r, i) => {
    const n = r.symbols.length, step = (Math.PI * 2) / n;
    // 隨機起始角（避免一開始就對齊）
    let start = (Math.floor(Math.random() * (n - 1)) + 1) * step;
    return { ...r, n, step, angle: start, top: 0 };
  });

  const norm = (a) => { a %= Math.PI * 2; if (a > Math.PI) a -= Math.PI * 2; if (a < -Math.PI) a += Math.PI * 2; return a; };
  function topIndex(ring) {
    let best = 0, bd = Infinity;
    for (let j = 0; j < ring.n; j++) {
      const d = Math.abs(norm(j * ring.step + ring.angle));
      if (d < bd) { bd = d; best = j; }
    }
    return best;
  }
  function snap(ring) { const j = topIndex(ring); ring.angle = norm(-j * ring.step); ring.top = j; }

  function draw() {
    g.clearRect(0, 0, S, S);
    // 底盤
    g.beginPath(); g.arc(cx, cy, 160, 0, Math.PI * 2);
    g.fillStyle = "rgba(20,14,40,.6)"; g.fill();
    g.strokeStyle = "#c9a25e"; g.lineWidth = 2; g.stroke();

    rings.forEach((ring, ri) => {
      g.beginPath(); g.arc(cx, cy, bands[ri], 0, Math.PI * 2);
      g.strokeStyle = "rgba(201,162,94,.45)"; g.lineWidth = 1; g.stroke();
      for (let j = 0; j < ring.n; j++) {
        const ang = -Math.PI / 2 + j * ring.step + ring.angle;
        const x = cx + Math.cos(ang) * bands[ri], y = cy + Math.sin(ang) * bands[ri];
        const atTop = j === topIndex(ring);
        g.save(); g.translate(x, y);
        g.font = "20px 'Noto Serif TC', serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillStyle = atTop ? "#fff3cf" : "#b9a7ff";
        if (atTop) { g.shadowColor = "#e8c178"; g.shadowBlur = 12; }
        g.fillText(ring.symbols[j], 0, 0); g.restore();
      }
    });

    // 指針
    g.fillStyle = "#ff9ec4";
    g.beginPath(); g.moveTo(cx, cy - 166); g.lineTo(cx - 8, cy - 150); g.lineTo(cx + 8, cy - 150); g.closePath(); g.fill();

    // 中央寶石
    const ok = rings.every(r => topIndex(r) === r.target);
    g.beginPath(); g.arc(cx, cy, 30, 0, Math.PI * 2);
    g.fillStyle = ok ? "rgba(127,227,163,.95)" : "rgba(143,123,255,.3)";
    if (ok) { g.shadowColor = "#7fe3a3"; g.shadowBlur = 20; }
    g.fill(); g.shadowBlur = 0;
    if (ok) {
      g.fillStyle = "#0d0a1f"; g.font = "700 26px Cinzel, serif";
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(params.reveal, cx, cy);
    }
  }

  function check() {
    if (solved) return;
    if (rings.every(r => topIndex(r) === r.target)) {
      solved = true; sfx.unlock();
      toast(`星盤對齊！中央浮現符數「${params.reveal}」`, "ok");
      setTimeout(() => ctx.solve(), 1400);
    }
  }

  // 拖曳：依半徑判斷操作哪一圈
  let drag = null, lastAng = 0;
  const pos = (e) => { const r = cv.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return { x: (p.clientX - r.left) / r.width * S, y: (p.clientY - r.top) / r.height * S }; };
  cv.addEventListener("pointerdown", (e) => {
    const p = pos(e); const d = Math.hypot(p.x - cx, p.y - cy);
    const ri = hit.findIndex(b => d >= b[0] && d <= b[1]);
    if (ri < 0) return;
    drag = ri; lastAng = Math.atan2(p.y - cy, p.x - cx); cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", (e) => {
    if (drag === null) return;
    const p = pos(e); const a = Math.atan2(p.y - cy, p.x - cx);
    rings[drag].angle += (a - lastAng); lastAng = a; draw();
  });
  cv.addEventListener("pointerup", () => {
    if (drag === null) return;
    snap(rings[drag]); drag = null; sfx.tap(); draw(); check();
  });

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "puzzle-stage" }, h("div", { class: "canvas-stage" }, cv)),
    h("div", { class: "note" }, "用手指轉動三圈星環，依石碑線索讓正確的星象停在頂端粉色指針。"),
  ));
  draw();
}
