/* 支線A · A2 — 滑塊拼圖（重組「記憶」圖；可用真實照片）
   拼回原圖即取得碎片。若 config.finale.photos[0] 存在則用真實照片。 */
import { h, toast } from "../ui.js";
import { sfx } from "../audio.js";

function defaultImage(hero) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
    <defs><radialGradient id='g' cx='50%' cy='35%'>
      <stop offset='0%' stop-color='#2a1f54'/><stop offset='100%' stop-color='#160f2b'/></radialGradient></defs>
    <rect width='300' height='300' fill='url(#g)'/>
    <g fill='#e8c178' font-family='Cinzel, serif' text-anchor='middle'>
      <text x='150' y='70' font-size='22'>OUR STORY</text>
      <text x='150' y='165' font-size='64'>&#10084;</text>
      <text x='150' y='230' font-size='30' fill='#b9a7ff'>${hero}</text>
      <text x='150' y='265' font-size='14' fill='#efe2c2'>&#10022; 一頁失落的記憶 &#10022;</text>
    </g></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export function slidingPuzzle(host, params, ctx) {
  const img = (ctx.config.finale.photos && ctx.config.finale.photos[0]) || defaultImage(ctx.config.hero || "Lulu");
  const N = 3, BLANK = 8;
  let pos = [...Array(N * N).keys()]; // pos[slot] = piece
  const adj = (i) => { const r = Math.floor(i / N), c = i % N; return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&a<N&&b>=0&&b<N).map(([a,b])=>a*N+b); };

  // 由完成態做隨機合法移動來打亂 → 保證可解
  let blank = pos.indexOf(BLANK);
  for (let k = 0; k < 60; k++) { const o = adj(blank); const t = o[Math.floor(Math.random()*o.length)]; [pos[blank],pos[t]]=[pos[t],pos[blank]]; blank = t; }

  const grid = h("div", { class: "slide-grid" });
  let done = false;

  function render() {
    grid.innerHTML = "";
    pos.forEach((piece, slot) => {
      if (piece === BLANK && !done) { grid.appendChild(h("div", { class: "slide-tile blank" })); return; }
      const tile = h("div", { class: "slide-tile", style: {
        backgroundImage: `url("${img}")`,
        backgroundSize: "300% 300%",
        backgroundPosition: `${(piece % N) * 50}% ${Math.floor(piece / N) * 50}%`,
      }});
      tile.onclick = () => move(slot);
      grid.appendChild(tile);
    });
  }
  function move(slot) {
    if (done) return;
    const b = pos.indexOf(BLANK);
    if (!adj(b).includes(slot)) return;
    [pos[b], pos[slot]] = [pos[slot], pos[b]];
    sfx.tap(); render(); check();
  }
  function check() {
    if (pos.every((p, i) => p === i)) {
      done = true; render(); sfx.unlock();
      toast("記憶重新拼合，碎片浮現！", "ok");
      setTimeout(() => ctx.solve(), 1100);
    }
  }

  host.appendChild(h("div", { class: "puzzle" },
    h("div", { class: "parchment" },
      h("h3", {}, "破碎的記憶"),
      h("p", {}, "一段回憶被拆成九塊，散落在時之沙漏裡。點擊空格旁的方塊讓它滑入，將畫面拼回原狀。"),
    ),
    h("div", { class: "puzzle-stage" }, grid),
    h("div", { class: "note" }, "點一下與空格相鄰的方塊即可滑動。" ),
  ));
  render();
}
