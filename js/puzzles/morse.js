/* 支線B · B1 — 回聲摩斯
   守書精靈用光與聲拼出一個你專屬的暱稱（config.nickname）。
   玩家對照摩斯表解碼後輸入。 */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

const MORSE = { A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--.." };

export function morse(host, params, ctx) {
  const answer = (ctx.config.nickname || "LULU").toUpperCase().replace(/[^A-Z]/g, "") || "LULU";
  const code = answer.split("").map(c => MORSE[c]).join(" ");
  const lamp = h("div", { class: "morse-lamp" });
  const input = h("input", { class: "answer-input", maxlength: answer.length + 2, placeholder: "輸入解出的字", autocapitalize: "characters", autocomplete: "off" });

  // 播放：閃燈 + 嗶聲
  let playing = false;
  function play() {
    if (playing) return; playing = true;
    const unit = 280; let t = 0;
    const on = (d) => { setTimeout(() => { lamp.classList.add("on"); sfx.beep(d === 3); }, t); t += d * unit; setTimeout(() => lamp.classList.remove("on"), t); t += unit; };
    for (const ch of code) {
      if (ch === ".") on(1);
      else if (ch === "-") on(3);
      else if (ch === " ") t += unit * 2; // 字母間額外間隔
    }
    setTimeout(() => { playing = false; }, t + 200);
  }

  const chart = h("div", { class: "morse-chart" });
  Object.entries(MORSE).forEach(([k, v]) => chart.appendChild(h("div", {}, h("b", {}, k + " "), v.replace(/\./g, "·").replace(/-/g, "—"))));

  const submit = h("button", { class: "btn", onclick: () => {
    if ((input.value || "").toUpperCase().replace(/[^A-Z]/g, "") === answer) ctx.solve();
    else { sfx.bad(); toast("回聲不符…再聽一次，對照摩斯表。", "bad"); }
  }}, "回應暗號");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "回聲迴廊"),
      h("p", {}, "迴廊深處有一盞會說話的燈，用古老的點與劃，一遍遍呼喚著一個名字。聽懂它在叫誰。"),
      h("div", { class: "cipher-text", style: { fontSize: "22px", letterSpacing: ".1em" } }, code.replace(/\./g, "·").replace(/-/g, "—")),
    ),
    h("div", { class: "puzzle-stage" }, lamp),
    h("div", { class: "btn-row" },
      h("button", { class: "btn ghost small", onclick: play }, "▶ 重播光訊"),
    ),
    h("details", { style: { marginTop: "12px" } },
      h("summary", { class: "muted", style: { cursor: "pointer" } }, "攤開摩斯密碼表"),
      chart),
    h("div", { class: "field-label" }, "它呼喚的名字是？"),
    input, h("div", { class: "spacer" }), submit,
  ));
}
