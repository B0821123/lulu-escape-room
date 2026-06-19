/* 回聲摩斯：用光與聲拼出一個英文字答案。 */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
};

const normalize = value => String(value || "").toUpperCase().replace(/[^A-Z]/g, "");

export function morse(host, params, ctx) {
  const answer = normalize(params.answer || ctx.config.answers?.bobo || ctx.config.nickname || "BOBO") || "BOBO";
  const code = answer.split("").map(c => MORSE[c]).join(" ");
  const lamp = h("div", { class: "morse-lamp" });
  const input = h("input", {
    class: "answer-input compact-input",
    maxlength: answer.length + 4,
    placeholder: "輸入聽見的名字",
    autocapitalize: "characters",
    autocomplete: "off",
  });

  let playing = false;
  function play() {
    if (playing) return;
    playing = true;
    const unit = 260;
    let t = 0;
    const on = (d) => {
      setTimeout(() => { lamp.classList.add("on"); sfx.beep(d === 3); }, t);
      t += d * unit;
      setTimeout(() => lamp.classList.remove("on"), t);
      t += unit;
    };
    for (const ch of code) {
      if (ch === ".") on(1);
      else if (ch === "-") on(3);
      else if (ch === " ") t += unit * 2;
    }
    setTimeout(() => { playing = false; }, t + 200);
  }

  const chart = h("div", { class: "morse-chart" });
  Object.entries(MORSE).forEach(([k, v]) => {
    chart.appendChild(h("div", {}, h("b", {}, `${k} `), v.replace(/\./g, "·").replace(/-/g, "—")));
  });

  const submit = h("button", { class: "btn", onclick: () => {
    if (normalize(input.value) === answer) ctx.solve();
    else { sfx.bad(); toast("回聲不符…再聽一次，對照摩斯表。", "bad"); }
  }}, "回應暗號");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "回聲暗號"),
      h("p", {}, "迴廊深處的燈用短亮與長亮呼喚一個名字。聽懂它，把名字輸入下方。"),
    ),
    h("div", { class: "puzzle-stage" }, lamp),
    h("div", { class: "btn-row" },
      h("button", { class: "btn ghost small", onclick: play }, "▶ 播放光訊"),
    ),
    h("details", { style: { marginTop: "12px" } },
      h("summary", { class: "muted", style: { cursor: "pointer" } }, "攤開摩斯密碼表"),
      chart),
    h("div", { class: "field-label" }, "它呼喚的名字是？"),
    input,
    h("div", { class: "spacer" }),
    submit,
  ));
}
