/* M1 — 符文密碼盤（凱撒位移變體）
   ciphertext = 咒語以固定位移加密；玩家旋轉內盤找出位移，解出咒語。
   params: { shift }  （ctx.config.spell 為答案） */
import { h } from "../ui.js";
import { sfx } from "../audio.js";

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const enc = (txt, s) => txt.toUpperCase().replace(/[^A-Z]/g, "").split("")
  .map(c => A[(A.indexOf(c) + s) % 26]).join("");
const dec = (txt, off) => txt.split("")
  .map(c => A[(A.indexOf(c) - off + 26) % 26]).join("");

export function cipherWheel(host, params, ctx) {
  const spell = (ctx.config.spell || "FOREVER").toUpperCase().replace(/[^A-Z]/g, "") || "FOREVER";
  const shift = ((params.shift ?? 5) % 26 + 26) % 26;
  const cipher = enc(spell, shift);
  let offset = 0; // 玩家目前的解碼位移

  const S = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cv = h("canvas", { width: S * dpr, height: S * dpr });
  const c2 = cv.getContext("2d");
  c2.scale(dpr, dpr);

  const decoded = h("div", { class: "cipher-text cipher-decoded" });
  const cipherLine = h("div", { class: "cipher-text", title: "石板上的符文" }, cipher);

  function draw() {
    c2.clearRect(0, 0, S, S);
    const cx = S / 2, cy = S / 2;
    // 外環底
    c2.beginPath(); c2.arc(cx, cy, 150, 0, Math.PI * 2);
    c2.strokeStyle = "#c9a25e"; c2.lineWidth = 2; c2.stroke();
    c2.beginPath(); c2.arc(cx, cy, 104, 0, Math.PI * 2); c2.stroke();
    c2.beginPath(); c2.arc(cx, cy, 60, 0, Math.PI * 2);
    c2.strokeStyle = "rgba(143,123,255,.5)"; c2.stroke();

    const step = (Math.PI * 2) / 26;
    // 外圈：密文字母（固定）
    for (let i = 0; i < 26; i++) {
      const ang = -Math.PI / 2 + i * step;
      const x = cx + Math.cos(ang) * 127, y = cy + Math.sin(ang) * 127;
      c2.save(); c2.translate(x, y); c2.rotate(ang + Math.PI / 2);
      c2.fillStyle = "#e8c178"; c2.font = "600 15px Cinzel, serif";
      c2.textAlign = "center"; c2.textBaseline = "middle";
      c2.fillText(A[i], 0, 0); c2.restore();
    }
    // 內圈：明文字母（隨 offset 轉動）
    for (let i = 0; i < 26; i++) {
      const ang = -Math.PI / 2 + (i - offset) * step;
      const x = cx + Math.cos(ang) * 82, y = cy + Math.sin(ang) * 82;
      c2.save(); c2.translate(x, y); c2.rotate(ang + Math.PI / 2);
      c2.fillStyle = "#b9a7ff"; c2.font = "600 14px Cinzel, serif";
      c2.textAlign = "center"; c2.textBaseline = "middle";
      c2.fillText(A[i], 0, 0); c2.restore();
    }
    // 頂端指針
    c2.fillStyle = "#ff9ec4";
    c2.beginPath(); c2.moveTo(cx, cy - 156); c2.lineTo(cx - 7, cy - 142); c2.lineTo(cx + 7, cy - 142); c2.closePath(); c2.fill();
    // 中央寶石
    c2.beginPath(); c2.arc(cx, cy, 26, 0, Math.PI * 2);
    c2.fillStyle = offset === shift ? "rgba(127,227,163,.9)" : "rgba(143,123,255,.35)"; c2.fill();
  }

  function refresh() { decoded.textContent = dec(cipher, offset); draw(); }
  function rotate(d) { offset = (offset + d + 26) % 26; sfx.tap(); refresh(); }

  // 拖曳旋轉內盤
  let dragging = false, lastAng = 0;
  const angAt = (e) => {
    const r = cv.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return Math.atan2(p.clientY - (r.top + r.height / 2), p.clientX - (r.left + r.width / 2));
  };
  cv.addEventListener("pointerdown", (e) => { dragging = true; lastAng = angAt(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const a = angAt(e); let d = a - lastAng;
    if (Math.abs(d) > (Math.PI * 2) / 26) { rotate(d > 0 ? -1 : 1); lastAng = a; }
  });
  cv.addEventListener("pointerup", () => { dragging = false; });

  const submit = h("button", { class: "btn", onclick: () => {
    if (dec(cipher, offset) === spell) ctx.solve();
    else { sfx.bad(); import("../ui.js").then(m => m.toast("符文仍是亂碼…再轉轉看。", "bad")); }
  }}, "詠唱咒語");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "封印的咒語"),
      h("p", {}, "石板上刻著一串扭曲的符文。轉動內側的星環，讓它們重新排列成可讀的咒語。"),
      cipherLine,
      h("div", { class: "note" }, "解讀結果："),
      decoded,
    ),
    h("div", { class: "puzzle-stage" }, h("div", { class: "wheel-wrap" }, cv)),
    h("div", { class: "wheel-ctrls" },
      h("button", { class: "btn ghost small", onclick: () => rotate(1) }, "◀ 轉"),
      h("span", { class: "muted", style: { minWidth: "70px", textAlign: "center" } }, "旋轉星環"),
      h("button", { class: "btn ghost small", onclick: () => rotate(-1) }, "轉 ▶"),
    ),
    submit,
  ));
  refresh();
}
