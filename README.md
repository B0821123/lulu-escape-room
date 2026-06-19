# 🪄 光陰魔法圖書館 · Lulu 的生日密室逃脫

一個**手機瀏覽器就能玩**的高難度密室逃脫網頁遊戲，為 Lulu 的生日量身打造。
純靜態網頁（HTML + CSS + 原生 JS，零相依、零建置），可直接用 GitHub Pages 上線。

> 線上遊玩：**https://B0821123.github.io/lulu-escape-room/**

---

## 🎮 遊戲架構

由「守書人」貫穿全程的連貫故事：一座圖書館裡，屬於你們的《告白之書》被封住、書頁散成三段記憶與六個頁面印記，Lulu 要把它們一一尋回。每道謎題機制都不重複。

| 線 | 名稱（象徵） | 謎題 |
|---|---|---|
| 主線 | 告白之書 · 此刻的星圖 | 咒語密碼筒(`LULU PIGGY`) → 邏輯推理印記(`493`) → 星盤對齊 → 圖形矩陣(XOR) → 七位頁角合鑰(`1455436`) |
| 支線一 | 告白之書 · 第一頁的日期 | 日期門(`20250214`) → 記憶滑塊拼圖（可放你們的真實照片） |
| 支線二 | 告白之書 · 心意的回聲 | 摩斯光訊(`BOBO`) → 光徑迷宮 → 兔兔食庫暗語(`RABBIT FOOD`) |
| 終局 | 告白之書 | 集齊三枚符文碎片、放回書台 → 生日告白 |

每條線完成可得一枚**符文碎片**；三枚到齊才能開啟終局的《告白之書》。
進度自動存在瀏覽器（`localStorage`），關掉重開也不會遺失。

---

## ✏️ 如何客製化（只要改一個檔案）

打開 **`js/config.js`**，裡面每一項都有註解，改完存檔、重新整理網頁即可生效。
謎題答案集中放在 `answers`，**英文片語可含空格**；遊戲驗證會忽略英文大小寫與空格，數字鎖則精準比對。

可改的東西：
- `hero` / `author`：壽星與你的稱呼
- `birthday`：生日（終局翻開《告白之書》時顯示的生日標記，格式 `MMDD`，例如 `0622`）
- `metDate`：你們「故事開始的那一天」（格式 `YYYYMMDD`）
- `answers.luluPiggy`：咒語密碼筒答案，目前是 `LULU PIGGY`
- `answers.bobo`：摩斯光訊答案，目前是 `BOBO`
- `answers.rabbitFood`：兔兔食庫英文暗語，目前是 `RABBIT FOOD`
- `answers.logicSeal`：推理印記，目前是 `493`
- `answers.mainSeal`：七位頁角合鑰，目前是 `1455436`
- `answers.firstDate`：日期門答案，目前是 `20250214`
- `finale.message`：終局《告白之書》的內容（想寫多長都可以）

### 放入你們的照片
1. 把照片放到 `assets/photos/` 資料夾。
2. 在 `config.js` 的 `finale.photos` 填入檔名，例如：
   ```js
   photos: ["assets/photos/us1.jpg", "assets/photos/us2.jpg"],
   ```
3. 第一張照片也會自動變成支線一「記憶滑塊拼圖」的圖片（拼回你們相遇的那一刻）。

---

## 💻 本地預覽（選用）

需要本機有 [Node.js](https://nodejs.org/)。在專案資料夾執行：

```bash
npx serve .
# 或
python -m http.server 8000
```

然後用瀏覽器開啟顯示的網址（手機可連同一個 Wi-Fi 用電腦 IP 測試）。

> 開發小撇步：網址加上 `?dev`（例如 `.../index.html?dev`）會出現測試面板，可一鍵給碎片、跳關、重置進度。把這個網址留給自己測試就好，不要傳給 Lulu 😉

---

## 🚀 部署到 GitHub Pages

本專案已是純靜態網站，根目錄含 `.nojekyll`，直接用「branch 部署」即可：

1. 推上 GitHub（公開 repo）。
2. Repo → **Settings → Pages → Build and deployment**：Source 選 **Deploy from a branch**，Branch 選 `main` / `/ (root)`。
3. 等 1～2 分鐘，網址即生效。

---

## 📁 專案結構

```
index.html            殼層
css/styles.css        行動優先樣式（魔法書風）
js/config.js          ★ 個人化設定（改這個）
js/main.js            路由 / 場景渲染 / 大廳 / 終局
js/state.js           進度存讀（localStorage）
js/scenes.js          故事與謎題定義
js/ui.js  js/audio.js 共用 UI 與音效
js/puzzles/           謎題元件
assets/photos/        放你們的照片
```

獻給最會解謎的人，生日快樂。 ✦
