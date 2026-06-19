/* M4 — 圖形矩陣推理（規則：第三＝前兩者的 XOR，行與列皆成立）
   bottom-right 缺空，從六個選項挑出正確圖形。 */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

const xor = (a, b) => a.map((v, i) => v ^ b[i]);
const eq = (a, b) => a.every((v, i) => v === b[i]);

function glyph(mask, accent) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 30 30");
  for (let i = 0; i < 9; i++) {
    const cxv = 6 + (i % 3) * 9, cyv = 6 + Math.floor(i / 3) * 9;
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", cxv); c.setAttribute("cy", cyv);
    c.setAttribute("r", mask[i] ? 3.4 : 1.1);
    c.setAttribute("fill", mask[i] ? (accent || "#e8c178") : "rgba(185,167,255,.25)");
    svg.appendChild(c);
  }
  return svg;
}

export function patternMatrix(host, params, ctx) {
  const r0c0 = [1,0,0, 0,1,0, 0,0,1];
  const r0c1 = [0,1,0, 0,1,0, 0,1,0];
  const r1c0 = [1,1,1, 0,0,0, 0,0,0];
  const r1c1 = [0,0,0, 0,0,0, 1,1,1];
  const r0c2 = xor(r0c0, r0c1), r1c2 = xor(r1c0, r1c1);
  const r2c0 = xor(r0c0, r1c0), r2c1 = xor(r0c1, r1c1);
  const answer = xor(r2c0, r2c1);

  const cells = [r0c0, r0c1, r0c2, r1c0, r1c1, r1c2, r2c0, r2c1, null];
  const distract = [
    [1,0,0, 0,0,0, 0,0,1],
    [0,0,1, 0,1,0, 1,0,0],
    [0,1,0, 0,0,0, 0,1,0],
    [1,0,1, 0,0,0, 1,0,1],
    [0,0,0, 0,1,0, 0,0,0],
  ];
  const options = shuffle([answer, ...distract]);
  let picked = null;

  const grid = h("div", { class: "matrix-grid" },
    ...cells.map(m => m
      ? h("div", { class: "matrix-cell" }, glyph(m))
      : h("div", { class: "matrix-cell missing" }, h("span", { style: { color: "#e8c178", fontSize: "26px" } }, "?"))));

  const opts = h("div", { class: "options-row" });
  options.forEach((m, idx) => {
    const cell = h("div", { class: "opt-cell" }, glyph(m, "#b9a7ff"));
    cell.onclick = () => {
      picked = idx; sfx.tap();
      [...opts.children].forEach((c, i) => c.classList.toggle("sel", i === idx));
    };
    opts.appendChild(cell);
  });

  const submit = h("button", { class: "btn", onclick: () => {
    if (picked === null) return toast("先選一個圖形。");
    if (eq(options[picked], answer)) ctx.solve();
    else { sfx.bad(); toast("規律不符，再觀察每一行與每一列的變化。", "bad"); }
  }}, "嵌入符文");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "殘缺的符文陣"),
      h("p", {}, "牆上的九宮符文陣缺了最後一格。看穿每一橫列、每一直行的生成規律，找出應當補上的符文。"),
    ),
    h("div", { class: "puzzle-stage" }, grid),
    h("div", { class: "field-label center" }, "選擇要補上的符文"),
    h("div", { class: "puzzle-stage" }, opts),
    submit,
  ));
}

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
