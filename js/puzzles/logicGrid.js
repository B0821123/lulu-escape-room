/* M2 — 邏輯推理（愛因斯坦式網格）
   params: { story, clues:[...], questions:[{label, key, options:[...]}], answer:{key:val} } */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

export function logicGrid(host, params, ctx) {
  const selects = {};
  const qWrap = h("div", {});
  for (const q of params.questions) {
    const sel = h("select", { class: "magic" },
      h("option", { value: "" }, "— 請選擇 —"),
      ...q.options.map(o => h("option", { value: o }, o)));
    selects[q.key] = sel;
    qWrap.appendChild(h("div", {}, h("div", { class: "field-label" }, q.label), sel));
  }

  const clueList = h("ol", { class: "story", style: { paddingLeft: "20px", margin: "6px 0" } },
    ...params.clues.map(c => h("li", { style: { marginBottom: "6px" } }, c)));

  const submit = h("button", { class: "btn", onclick: () => {
    let ok = true;
    for (const [k, v] of Object.entries(params.answer)) {
      if ((selects[k].value || "").trim() !== String(v)) ok = false;
    }
    if (ok) ctx.solve();
    else { sfx.bad(); toast("推理還不完全正確，再檢查一次線索。", "bad"); }
  }}, "提交推理");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "守書人的試煉"),
      h("p", {}, params.story),
      h("div", { class: "clue" }, clueList),
    ),
    qWrap,
    submit,
    h("div", { class: "note" }, "提示：拿張紙畫格子用消去法，會快很多。"),
  ));
}
