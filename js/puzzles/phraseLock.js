/* 英文片語鎖：大小寫與空格容錯。 */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

const normalize = value => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

export function phraseLock(host, params, ctx) {
  const answer = String(params.answer || ctx.config.answers?.rabbitFood || "RABBIT FOOD").toUpperCase();
  const expected = normalize(answer);
  const input = h("input", {
    class: "answer-input phrase-input",
    maxlength: answer.length + 8,
    placeholder: answer.replace(/[A-Z]/g, "•"),
    autocapitalize: "characters",
    autocomplete: "off",
  });

  const submit = h("button", { class: "btn", onclick: () => {
    if (normalize(input.value) === expected) ctx.solve();
    else { sfx.bad(); toast("暗語沒有對上，再檢查一次拼字。", "bad"); }
  }}, params.submit || "送出暗語");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, params.title || "英文暗語"),
      h("p", {}, params.body || "輸入正確英文片語即可打開這道鎖。"),
    ),
    h("div", { class: "field-label" }, params.label || "英文暗語"),
    input,
    h("div", { class: "note" }, "大小寫不影響答案；空格可以輸入，也可以省略。"),
    h("div", { class: "spacer" }),
    submit,
  ));
}
