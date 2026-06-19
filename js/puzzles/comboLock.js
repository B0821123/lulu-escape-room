/* 通用數字鎖。params: { length, expected, prompt } */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

export function comboLock(host, params, ctx) {
  const len = params.length || String(params.expected).length;
  const expected = String(params.expected);
  let buf = "";

  const slots = h("div", { class: "code-display" });
  const renderSlots = () => {
    slots.innerHTML = "";
    for (let i = 0; i < len; i++) {
      slots.appendChild(h("div", { class: "code-slot " + (i < buf.length ? "filled" : "") }, buf[i] || ""));
    }
  };

  function press(d) {
    if (buf.length >= len) return;
    buf += d; sfx.tap(); renderSlots();
    if (buf.length === len) setTimeout(check, 180);
  }
  function del() { buf = buf.slice(0, -1); sfx.tap(); renderSlots(); }
  function check() {
    if (buf === expected) { ctx.solve(); }
    else { sfx.bad(); toast("鎖紋沒有回應…數字不對。", "bad"); buf = ""; renderSlots(); }
  }

  const keypad = h("div", { class: "keypad" });
  ["1","2","3","4","5","6","7","8","9","⌫","0","✓"].forEach(k => {
    const b = h("button", {}, k);
    b.onclick = () => { if (k === "⌫") del(); else if (k === "✓") check(); else press(k); };
    keypad.appendChild(b);
  });

  host.appendChild(h("div", { class: "puzzle" },
    params.prompt ? h("div", { class: "field-label center" }, params.prompt) : null,
    slots, keypad,
  ));
  renderSlots();
}
