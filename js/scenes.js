/* 故事與場景定義：同一本《告白之書》的三段記憶。
   六個指定答案分別作為必解印記，三段記憶完成後開啟終局。 */
import { config } from "./config.js";

const answers = config.answers || {};
const LULU_PIGGY = answers.luluPiggy || config.spell || "LULU PIGGY";
const BOBO = answers.bobo || config.nickname || "BOBO";
const RABBIT_FOOD = answers.rabbitFood || "RABBIT FOOD";
const LOGIC_SEAL = answers.logicSeal || "493";
const FIRST_DATE = answers.firstDate || config.metDate || "20250214";

export function fmtDate(value) {
  const s = String(value || "").replace(/\D/g, "");
  if (s.length === 8) return `${+s.slice(0, 4)} 年 ${+s.slice(4, 6)} 月 ${+s.slice(6)} 日`;
  const mmdd = s.padStart(4, "0");
  return `${+mmdd.slice(0, 2)} 月 ${+mmdd.slice(2)} 日`;
}

/* 主線前四關給出的頁角印記，依序串成 1455436。 */
export const PALACE = {
  m1: { name: "第一頁角", digit: "14" },
  m2: { name: "第二頁角", digit: "55" },
  m3: { name: "第三頁角", digit: "4" },
  m4: { name: "第四頁角", digit: "36" },
};
export const M5_ORDER = ["m1", "m2", "m3", "m4"];
export const M5_CODE = answers.mainSeal || "1455436";

export const PATHS = {
  main: { ids: ["m1", "m2", "m3", "m4", "m5"], fragment: "main", title: "告白之書 · 此刻的星圖", icon: "✦" },
  A:    { ids: ["a1", "a2"],                    fragment: "A",    title: "告白之書 · 第一頁的日期", icon: "❂" },
  B:    { ids: ["b1", "b2", "b3"],              fragment: "B",    title: "告白之書 · 心意的回聲", icon: "❖" },
};

export const COVER = {
  crest: "📖",
  title: "光陰魔法圖書館",
  sub: `一座只為 ${config.hero} 而開的圖書館`,
  lines: [
    `「歡迎，<em>${config.hero}</em>。我是光陰圖書館的守書人。」`,
    "今晚，圖書館只開一盞燈：它照著一本被時間封住的《告白之書》。",
    "書頁沒有消失，只是散成三段記憶、六個頁面印記。每解開一個印記，故事就會往你靠近一點。",
    "「把它讀回來吧。讀到最後，那段真正想對你說的話，就會自己翻開。」",
  ],
  begin: "推開圖書館的大門",
};

export const HUB = {
  title: "光陰圖書館 · 大廳",
  intro: [
    "穹頂的星河像書籤一樣緩緩轉動，三道光廊延伸向同一本書的不同章節。",
    "「第一段是此刻的星圖，記著你一路收集到的頁角；第二段是第一頁的日期，記著故事從哪天開始；第三段是心意的回聲，記著那些還想好好說出口的話。」",
    "「三段記憶都回到書脊，《告白之書》就會替寫下它的人，把最後一頁交給你。」",
  ],
};

export const SCENES = {
  m1: {
    chapter: "main", kicker: "此刻的星圖 · 印記一", title: "封印的<span class='glow'>咒語</span>",
    intro: [
      "你走進星圖廊，第一扇銅門上刻著一排像迷宮般的符號。",
      "守書人說：「這不是普通咒語，是那本書第一個記得的稱呼。把它拼回來，頁角就會亮起。」",
    ],
    puzzle: { name: "cryptex", params: { answer: LULU_PIGGY } },
    reward: PALACE.m1,
    outro: [
      `銅門聽見「${LULU_PIGGY}」後輕輕打開，頁角浮出第一段數字。`,
      "「有些稱呼很可愛，因為只有特定的人說出口時，才真的算數。」",
    ],
    hints: [
      "石筒上方的符號是鴿籠密碼：井字格與 X 格代表字母位置，加點代表第二組。",
      "空白不是要轉的字母，只是把兩個詞分開。",
      `拼出的咒語是：${LULU_PIGGY}`,
    ],
  },
  m2: {
    chapter: "main", kicker: "此刻的星圖 · 印記二", title: "守書人的<span class='glow'>試煉</span>",
    intro: [
      "第二間大廳裡，三座書塔各自亮著一盞燈，燈影在地上排成三個空位。",
      "「這一關不問回憶，問推理，」守書人笑著說，「找出三位數印記，書才會承認你真的走到這裡。」",
    ],
    puzzle: { name: "logicGrid", params: {
      story: "三位守書塔分別對應百位、十位、個位。三個數字皆為 1～9，且不重複。依線索推出完整三位數印記。",
      clues: [
        "百位是偶數。",
        "百位不是三個數字中最大，也不是最小。",
        "十位是三個數字中最大，且比百位多 5。",
        "個位比百位少 1。",
        "由左到右讀出百位、十位、個位，即為本關印記。",
      ],
      questions: [
        { label: "百位印記", key: "hundreds", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] },
        { label: "十位印記", key: "tens", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] },
        { label: "個位印記", key: "ones", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] },
      ],
      answer: { hundreds: LOGIC_SEAL[0], tens: LOGIC_SEAL[1], ones: LOGIC_SEAL[2] },
    }},
    reward: PALACE.m2,
    outro: [
      `三座書塔依序亮起，地面浮出「${LOGIC_SEAL}」。`,
      "「推理不是把答案猜中，是讓每一條線索都願意點頭。」",
    ],
    hints: [
      "先找十位：它比百位多 5，而且是最大值。",
      "百位是偶數，又剛好比個位多 1。",
      `三位數印記是：${LOGIC_SEAL}`,
    ],
  },
  m3: {
    chapter: "main", kicker: "此刻的星圖 · 印記三", title: "星盤<span class='glow'>對齊</span>",
    intro: [
      "塔後懸著一面青銅星盤，三圈星環映出日、月與指路的星。",
      "「把它們轉回該在的位置，」守書人說，「星星會吐出下一枚頁角。」",
    ],
    puzzle: { name: "astrolabe", params: {
      reveal: String(PALACE.m3.digit),
      rings: [
        { symbols: ["☉", "☾", "✦", "❂", "☆", "✧", "✶", "✷"], target: 0 },
        { symbols: ["✧", "☽", "✦", "✶", "☆", "❂", "✷", "☉"], target: 1 },
        { symbols: ["✦", "✶", "★", "☆", "✧", "❂", "✷", "☽"], target: 2 },
      ],
    }},
    reward: PALACE.m3,
    parchment: { title: "星盤銘文", body: "「外環獻給白晝給光者；中環屬於夜裡盈虧之物；內環，指引迷途旅人歸航。」" },
    outro: [
      "三環歸位，星盤中央亮起一顆溫柔的綠光。",
      "「有些方向不需要地圖，因為心會一直記得要往哪裡走。」",
    ],
    hints: [
      "外環＝太陽 ☉、中環＝月亮 ☽、內環＝北極星 ★。",
      "用手指轉動星環，讓指定符號停在頂端粉色指針。",
      `全部對齊後，中央會浮現數字 ${PALACE.m3.digit}。`,
    ],
  },
  m4: {
    chapter: "main", kicker: "此刻的星圖 · 印記四", title: "殘缺的<span class='glow'>符文陣</span>",
    intro: [
      "星盤之後，一面九宮符文牆擋住去路，最後一格被誰悄悄擦掉了。",
      "「把規律補回來，」守書人說，「這一頁的四個角就會完整。」",
    ],
    puzzle: { name: "patternMatrix", params: {} },
    reward: PALACE.m4,
    outro: [
      "缺口被補上，整面牆像翻頁般掀起金光。",
      "「四個頁角到齊，星圖廊只剩最後一道合鑰。」",
    ],
    hints: [
      "把每個圓點想成開/關；觀察第三格如何由前兩格產生。",
      "規則是 XOR：同位置同亮或同暗會變空，只有一邊亮才會留下。",
      "正確圖形：右上與左下兩點亮起，其餘為空。",
    ],
  },
  m5: {
    chapter: "main", kicker: "此刻的星圖 · 合鑰", title: "七位<span class='glow'>頁角合鑰</span>",
    intro: [
      "星圖廊盡頭，四枚頁角印記懸在石鎖前。",
      "「照著你拿到它們的順序，把印記串成七位合鑰。這一段『此刻』就會回到書裡。」",
    ],
    extra: "m5digits",
    puzzle: { name: "comboLock", params: { length: M5_CODE.length, expected: M5_CODE, prompt: "依四枚頁角印記輸入七位合鑰" } },
    outro: [
      "石鎖喀地一聲鬆開，星圖廊化作一枚符文碎片，落入你掌心。",
    ],
    hints: [
      "依序讀取前四關取得的頁角印記。",
      "第一頁角 → 第二頁角 → 第三頁角 → 第四頁角。",
      `七位合鑰是：${M5_CODE}`,
    ],
  },

  a1: {
    chapter: "A", kicker: "第一頁的日期 · 印記五", title: "沙漏的<span class='glow'>日期門</span>",
    intro: [
      "你走進時之沙漏，所有沙粒都倒著往上流，像在尋找某一天。",
      "守書人把手放在門上：「故事不是從今天才開始。輸入第一頁真正落筆的日期，記憶才會醒來。」",
    ],
    parchment: { title: "沙漏的低語", body: "以八位數寫下那一天：YYYYMMDD。" },
    puzzle: { name: "comboLock", params: { length: FIRST_DATE.length, expected: FIRST_DATE, prompt: "輸入第一頁日期（YYYYMMDD）" } },
    outro: [
      `沙漏在 ${fmtDate(FIRST_DATE)} 停住，門後傳來紙頁展開的聲音。`,
      "「你看，時間不是只往前走；它也會在重要的地方，替你留一盞燈。」",
    ],
    hints: [
      "日期格式是西元年四碼 + 月兩碼 + 日兩碼。",
      "不是生日，是故事第一頁被寫下的日期。",
      `答案是：${FIRST_DATE}`,
    ],
  },
  a2: {
    chapter: "A", kicker: "第一頁的日期 · 記憶", title: "破碎的<span class='glow'>記憶</span>",
    intro: [
      "日期門打開後，一段畫面從書頁裡散成九片。",
      "「把它拼回來吧，」守書人說，「第一頁的記憶會自己承認你。」",
    ],
    puzzle: { name: "slidingPuzzle", params: {} },
    outro: [
      "畫面重新清晰，時之沙漏凝成第二枚符文碎片。",
      "「一切開始的那一天，已經回到書裡。」",
    ],
    hints: [
      "先把四個角落歸位，再處理邊與中間。",
      "點一下空格相鄰的方塊，它就會滑進空格。",
      "卡住時，整排整排地推，比單塊亂移有效。",
    ],
  },

  b1: {
    chapter: "B", kicker: "心意的回聲 · 印記六", title: "回聲<span class='glow'>暗號</span>",
    intro: [
      "最後一道光廊裡，一盞小燈忽明忽暗，像一句忍住很久的呼喚。",
      "「聽懂它叫的是誰，回聲才會願意往前走。」",
    ],
    puzzle: { name: "morse", params: { answer: BOBO } },
    outro: [
      `你解出「${BOBO}」的瞬間，回聲廊深處所有燈盞一起亮起。`,
      "「有些名字被叫出口時，整條路都會變亮。」",
    ],
    hints: [
      "短亮是點，長亮是劃。",
      "用摩斯表逐字對照，答案是四個英文字母。",
      `答案是：${BOBO}`,
    ],
  },
  b2: {
    chapter: "B", kicker: "心意的回聲 · 光路", title: "光之<span class='glow'>導引</span>",
    intro: [
      "名字喚醒了星泉，但光被打亂的導光磚截斷在半路。",
      "守書人說：「把光接到石門，讓那些還沒說出口的話有路可以抵達。」",
    ],
    puzzle: { name: "lightMaze", params: {} },
    outro: [
      "光抵達石門時，門縫裡傳來一陣像紙袋被打開的聲音。",
      "「最後的暗語很小、很日常，但正因如此，才像你們。」",
    ],
    hints: [
      "先鎖定左側星泉那列，和右側石門那列。",
      "從星泉出發，一段段把光接過去；接通的磚會發亮。",
      "讓光抵達最右側，門那格亮起綠色即可。",
    ],
  },
  b3: {
    chapter: "B", kicker: "心意的回聲 · 最後暗語", title: "兔兔食庫的<span class='glow'>暗語</span>",
    intro: [
      "石門後是一間小小食庫，書頁邊緣畫著一隻正在等晚餐的兔子。",
      "「輸入最後的英文暗語，心意的回聲就會成為第三枚碎片。」",
    ],
    puzzle: { name: "phraseLock", params: {
      answer: RABBIT_FOOD,
      title: "兔兔食庫",
      body: "門牌上只寫著一句英文暗語。大小寫不重要，空格也可以省略。",
      label: "食庫暗語",
      submit: "送出暗語",
    } },
    outro: [
      `食庫聽見「${RABBIT_FOOD}」後慢慢打開，第三枚符文碎片從書頁裡浮起。`,
      "「三段記憶都回來了。現在，輪到《告白之書》自己說話。」",
    ],
    hints: [
      "這是一個兩個英文單字組成的片語。",
      "第一個字是 RABBIT，第二個字和食物有關。",
      `答案是：${RABBIT_FOOD}`,
    ],
  },
};

export const FINALE = {
  kicker: "終局", title: "告白之書",
  intro: [
    "三道光廊都已走盡。你掌心浮著三枚符文碎片：<em>此刻</em>、<em>第一頁</em>、與<em>心意</em>。",
    "書台中央，《告白之書》終於不再沉睡。",
    "「把它們放回原處吧，」守書人輕聲說，「接下來的頁面，會由寫下它的人親自交給你。」",
  ],
  sockets: ["此刻", "第一頁", "心意"],
  fragments: [
    { key: "main", glyph: "✦" },
    { key: "A", glyph: "❂" },
    { key: "B", glyph: "❖" },
  ],
};
