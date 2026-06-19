/* B3 — 食材字磚拼字鎖（Anagram tile lock）
   食庫的門牌碎成一地食材字磚（答案字母打散）。
   點字磚 → 放入門牌最左側空格；點已填的格子 → 把字磚收回字磚盤。
   依單字切成數段門牌，字與字之間留視覺間隔；空格只作分隔，不需字磚。 */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

const normalize = value => String(value || "").toUpperCase().replace(/[^A-Z]/g, "");

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function tileLock(host, params, ctx) {
  const phrase = String(params.answer || ctx.config.answers?.rabbitFood || "RABBIT FOOD").toUpperCase();
  const words = phrase.split(/\s+/).filter(Boolean);   // ["RABBIT", "FOOD"]
  const letters = normalize(phrase).split("");         // ["R","A","B","B","I","T","F","O","O","D"]
  const expected = letters.join("");

  // 打散字磚；避免剛好排成答案
  let pool = shuffle(letters);
  for (let guard = 0; pool.join("") === expected && letters.length > 1 && guard < 24; guard++) pool = shuffle(letters);

  const slotEls = [];          // 依字母順序的格子 DOM（不含空格）
  const placed = [];           // placed[slotIndex] = poolIndex | null
  const tileEls = [];          // 字磚 DOM
  const tileUsed = [];         // tileUsed[poolIndex] = bool

  // —— 門牌：依單字分段，段與段之間自然留白 ——
  const board = h("div", { class: "tile-board" });
  words.forEach(word => {
    const group = h("div", { class: "tile-word" });
    for (let k = 0; k < word.length; k++) {
      const idx = slotEls.length;
      const slot = h("div", { class: "tile-slot", onclick: () => pullBack(idx) });
      slotEls.push(slot);
      placed.push(null);
      group.appendChild(slot);
    }
    board.appendChild(group);
  });

  // —— 字磚盤 ——
  const tray = h("div", { class: "tile-tray" });
  pool.forEach((ch, pi) => {
    tileUsed.push(false);
    const tile = h("button", { class: "tile", onclick: () => placeTile(pi) }, ch);
    tileEls.push(tile);
    tray.appendChild(tile);
  });

  const firstEmpty = () => placed.findIndex(v => v === null);

  function placeTile(pi) {
    if (tileUsed[pi]) return;
    const slot = firstEmpty();
    if (slot === -1) return;
    placed[slot] = pi;
    tileUsed[pi] = true;
    sfx.tap();
    refresh();
  }

  function pullBack(slotIdx) {
    const pi = placed[slotIdx];
    if (pi === null || pi === undefined) return;
    placed[slotIdx] = null;
    tileUsed[pi] = false;
    sfx.tap();
    refresh();
  }

  function clearAll() {
    placed.forEach((pi, i) => { if (pi !== null) { tileUsed[pi] = false; placed[i] = null; } });
    sfx.tap();
    refresh();
  }

  function refresh() {
    placed.forEach((pi, i) => {
      slotEls[i].textContent = pi === null ? "" : pool[pi];
      slotEls[i].classList.toggle("filled", pi !== null);
    });
    tileEls.forEach((t, pi) => t.classList.toggle("used", tileUsed[pi]));
  }

  const current = () => placed.map(pi => (pi === null ? "" : pool[pi])).join("");

  function check() {
    if (firstEmpty() !== -1) { sfx.bad(); toast("還有空格沒填上字磚。", "bad"); return; }
    if (current() === expected) {
      sfx.unlock();
      board.classList.add("solved");
      ctx.solve();
    } else {
      sfx.bad();
      board.classList.add("shake");
      setTimeout(() => board.classList.remove("shake"), 440);
      toast("字磚拼錯了，再排排看。", "bad");
    }
  }

  const submit = h("button", { class: "btn", onclick: check }, params.submit || "拼合暗語");
  const clearBtn = h("button", { class: "btn ghost", onclick: clearAll }, "清空重排");

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, params.title || "兔兔食庫"),
      h("p", {}, params.body || "食庫的門牌碎成了食材字磚，散了一地。把字磚拼回門牌上的暗語——兩個英文單字：誰住在這座食庫，牠每天又等著什麼？"),
      h("p", { class: "muted", style: { fontSize: "13px" } }, `提示：${words.map(w => w.length).join(" + ")} 個字母。點字磚放進門牌，點門牌上的格子可取回字磚。`),
    ),
    h("div", { class: "puzzle-stage" }, board),
    h("div", { class: "field-label" }, params.label || "散落的食材字磚"),
    tray,
    h("div", { class: "btn-row" }, clearBtn, submit),
  ));
  refresh();
}
