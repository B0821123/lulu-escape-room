/* 故事與場景定義 —— 主線 M1–M5、支線 A、支線 B、終局。
   謎題答案多由 config 推導，改 config 不會破壞謎題。 */
import { config } from "./config.js";

/* 主線四章的「數字符文」與四宮，M5 需依序組合 */
export const PALACE = {
  m1: { name: "白虎", digit: 2 },
  m2: { name: "玄武", digit: 8 },
  m3: { name: "朱雀", digit: 5 },
  m4: { name: "青龍", digit: 1 },
};
export const M5_ORDER = ["m2", "m4", "m1", "m3"];          // 由暗至明
export const M5_CODE = M5_ORDER.map(k => PALACE[k].digit).join(""); // "8125"

/* 路徑與完成後給予的碎片 */
export const PATHS = {
  main: { ids: ["m1", "m2", "m3", "m4", "m5"], fragment: "main", title: "主線 · 星盤大典", icon: "✦" },
  A:    { ids: ["a1", "a2"],                   fragment: "A",    title: "支線一 · 時之沙漏", icon: "❂" },
  B:    { ids: ["b1", "b2"],                   fragment: "B",    title: "支線二 · 回聲迴廊", icon: "❖" },
};

export const COVER = {
  crest: "📖",
  title: "光陰魔法圖書館",
  sub: `一座為 ${config.hero} 而開的圖書館`,
  lines: [
    "傳說在時間的夾縫裡，有一座只為「最會解謎的人」敞開的圖書館。",
    "它收藏著一本本用記憶寫成的書。而其中最深處的那一本——《告白之書》——被封印了。",
    "三枚符文碎片散落在大典與兩條迴廊之中。集齊它們，書頁才會為你翻開。",
  ],
  begin: "推開圖書館的大門",
};

export const HUB = {
  title: "光陰圖書館 · 大廳",
  intro: [
    "穹頂上流轉著星河，三道光廊自大廳延伸而出。",
    "完成每一道試煉可獲得一枚符文碎片；三枚到齊，《告白之書》的封印將會解開。",
  ],
};

export const SCENES = {
  /* ───────────── 主線 ───────────── */
  m1: {
    chapter: "main", kicker: "主線 · 其一", title: "封印的<span class='glow'>咒語</span>",
    intro: ["大典的銅門深鎖，門前立著一座刻滿符號的石製密碼筒。", "轉對每一道滾輪、拼出失落的咒語，門才會為你而開。"],
    puzzle: { name: "cryptex", params: {} },
    reward: PALACE.m1,
    hints: [
      "石筒上方的符號是古老的『鴿籠密碼』(Pigpen)：字母被放進『井』字格與『X』格，符號＝格子的牆，多一個點代表第二組。",
      "翻開下方的「符文對照表」，照著系統圖把每個符號逐一還原成字母。",
      `把滾輪轉到對應字母，拼出的咒語是：${config.spell}`,
    ],
  },
  m2: {
    chapter: "main", kicker: "主線 · 其二", title: "守書人的<span class='glow'>試煉</span>",
    intro: ["門後是五座高塔，五位守書人各自鎮守。星之鑰 ★ 藏在其中一人手中。"],
    puzzle: { name: "logicGrid", params: {
      story: "五位守書人：晨、暮、霜、燼、曜，由左至右鎮守第 1～5 座塔。燈色有 紅、橙、黃、綠、藍；符文有 ☀日、☾月、★星(星之鑰)、✦輝、❖淵。依下列線索，找出誰握有星之鑰、又在第幾座塔。",
      clues: [
        "晨 鎮守最左邊（第 1 座）的塔。",
        "霜 站在正中央那座塔。",
        "曜 就在 霜 的左手邊（緊鄰）。",
        "暮 在 燼 的左側（不一定相鄰）。",
        "正中央的塔燃著紅燈。",
        "最右邊的塔燃著橙燈。",
        "藍燈就在紅燈的左邊（緊鄰）。",
        "綠燈在黃燈的右側（不一定相鄰）。",
        "霜 持有月亮符文 ☾。",
        "曜 持有深淵符文 ❖。",
        "星之鑰 ★ 的塔，與 霜 的塔相鄰。",
        "持有輝光符文 ✦ 的人，燈色是橙。",
      ],
      questions: [
        { label: "星之鑰 ★ 由誰保管？", key: "holder", options: ["晨", "暮", "霜", "燼", "曜"] },
        { label: "他鎮守第幾座塔？", key: "tower", options: ["1", "2", "3", "4", "5"] },
      ],
      answer: { holder: "暮", tower: "4" },
    }},
    reward: PALACE.m2,
    hints: [
      "先用『晨在最左、霜在中央、曜緊鄰霜左側』把人排好。",
      "燈色：中央紅、最右橙、藍緊鄰紅左側，再用『綠在黃右側』補完。",
      "答案：星之鑰在『暮』手中，他鎮守第 4 座塔。",
    ],
  },
  m3: {
    chapter: "main", kicker: "主線 · 其三", title: "星盤<span class='glow'>對齊</span>",
    intro: ["穿過高塔，一面巨大的青銅星盤橫在眼前。三圈星環錯位轉動，唯有歸位才會吐露數字。"],
    puzzle: { name: "astrolabe", params: {
      reveal: String(PALACE.m3.digit),
      rings: [
        { symbols: ["☉", "☾", "✦", "❂", "☆", "✧", "✶", "✷"], target: 0 }, // 外：白晝給光者 ☉
        { symbols: ["✧", "☽", "✦", "✶", "☆", "❂", "✷", "☉"], target: 1 }, // 中：夜裡盈虧者 ☽
        { symbols: ["✦", "✶", "★", "☆", "✧", "❂", "✷", "☽"], target: 2 }, // 內：旅人指北者 ★
      ],
    }},
    reward: PALACE.m3,
    parchment: { title: "星盤銘文", body: "「外環獻給白晝給光者；中環屬於夜裡盈虧之物；內環，指引迷途旅人歸航。」" },
    hints: [
      "外環＝太陽 ☉、中環＝月亮 ☽、內環＝北極星 ★。",
      "用手指轉動對應的環，把那個符號停到頂端的粉色指針。",
      `三環全部對齊後，中央寶石會亮起並浮現數字 ${PALACE.m3.digit}。`,
    ],
  },
  m4: {
    chapter: "main", kicker: "主線 · 其四", title: "殘缺的<span class='glow'>符文陣</span>",
    intro: ["星盤之後是一道符文牆，九宮之中缺了一格。補上正確的符文，封印才會繼續鬆動。"],
    puzzle: { name: "patternMatrix", params: {} },
    reward: PALACE.m4,
    hints: [
      "把每個圓點想成開/關；觀察『第三格＝前兩格的某種疊加』。",
      "規則是 XOR：兩格同位置都有或都沒有點→空；只有一邊有→亮。橫列、直行都成立。",
      "正確圖形：右上與左下兩點亮起，其餘為空。",
    ],
  },
  m5: {
    chapter: "main", kicker: "主線 · 終章", title: "四宮<span class='glow'>合鑰</span>",
    intro: ["大典中央升起一座石鎖。一路走來，你在四章各得到一枚數字符文，分屬四方星宮。"],
    extra: "m5digits", // 由 main.js 動態渲染收集到的數字
    puzzle: { name: "comboLock", params: { length: 4, expected: M5_CODE, prompt: "依『由暗至明』之序，輸入四宮之數" } },
    hints: [
      "白虎、玄武、朱雀、青龍——你在 M1～M4 各得一數。",
      "排列順序是『由暗至明』：玄武 → 青龍 → 白虎 → 朱雀。",
      `依序輸入即為：${M5_CODE}`,
    ],
  },

  /* ───────────── 支線一 · 時之沙漏 ───────────── */
  a1: {
    chapter: "A", kicker: "支線一 · 其一", title: "時之<span class='glow'>沙漏</span>",
    intro: [
      "側廳裡懸著一只巨大的沙漏，沙粒逆流而上，凝成一行字：",
      "<em>「要喚醒這段時光，請寫下——我們故事開始的那一天。」</em>",
    ],
    parchment: { title: "沙漏的低語", body: `${config.metDatePoetic}。以四位數寫下那一天（月月日日 MMDD）。` },
    puzzle: { name: "comboLock", params: { length: config.metDate.length, expected: config.metDate, prompt: "我們開始的那一天（MMDD）" } },
    hints: [
      "想想，我們的故事是從哪個季節、哪個月份開始的？",
      `月份是 ${config.metDate.slice(0, 2)} 月。`,
      `完整答案是 ${config.metDate}（MMDD）。`,
    ],
  },
  a2: {
    chapter: "A", kicker: "支線一 · 其二", title: "破碎的<span class='glow'>記憶</span>",
    intro: ["沙漏裂開，一段回憶碎成九片，散落一地。把它拼回原狀，碎片便會成形。"],
    puzzle: { name: "slidingPuzzle", params: {} },
    hints: [
      "先把四個角落歸位，再處理邊與中間。",
      "點一下空格『相鄰』的方塊，它就會滑進空格。",
      "卡住時，整排整排地推，比單塊亂移有效。",
    ],
  },

  /* ───────────── 支線二 · 回聲迴廊 ───────────── */
  b1: {
    chapter: "B", kicker: "支線二 · 其一", title: "回聲<span class='glow'>暗號</span>",
    intro: ["迴廊深處，一盞古燈忽明忽滅，用點與劃，一遍遍呼喚著某個名字。"],
    puzzle: { name: "morse", params: {} },
    hints: [
      "·＝點(短)、—＝劃(長)；用下方摩斯密碼表逐字對照。",
      "它呼喚的是一個名字，全是英文字母。",
      `答案是：${config.nickname}`,
    ],
  },
  b2: {
    chapter: "B", kicker: "支線二 · 其二", title: "光之<span class='glow'>導引</span>",
    intro: ["名字喚醒了迴廊盡頭的星泉，光卻被打亂的導光磚截斷。鋪出一條光路，推開石門。"],
    puzzle: { name: "lightMaze", params: {} },
    hints: [
      "先鎖定『一定會用到』的磚：左側星泉那列、與右側石門那列。",
      "從星泉出發，一段段把光接過去；接通的磚會發亮。",
      "讓光抵達最右側、使門那格亮起綠色即可。",
    ],
  },
};

/* 終局 */
export const FINALE = {
  kicker: "終局", title: "告白之書",
  intro: [
    "三枚符文碎片在你掌心匯聚，升入半空，化作一道鑰匙的形狀。",
    "中央的書台上，《告白之書》微微震動——它認得你了。",
    "<em>「最後一道封印，是今天的主角最重要的那個日子。」</em>",
  ],
  lock: { length: config.birthday.length, expected: config.birthday, prompt: "屬於今天的日子（MMDD）" },
  hints: [
    "開書的鑰匙，是今天壽星最重要的日子。",
    "格式是 MMDD。",
    `就是 ${config.birthday}。`,
  ],
};
