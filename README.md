# 🪄 光陰魔法圖書館 · Lulu 的生日密室逃脫

一個**手機瀏覽器就能玩**的高難度密室逃脫網頁遊戲，為 Lulu 的生日量身打造。
純靜態網頁（HTML + CSS + 原生 JS，零相依、零建置），可直接用 GitHub Pages 上線。

> 線上遊玩：**https://B0821123.github.io/lulu-escape-room/**

---

## 🎮 遊戲架構

| 線 | 名稱 | 內容 |
|---|---|---|
| 主線 | 星盤大典（5 章） | 符文密碼盤 → 邏輯推理網格 → 星盤對齊 → 圖形矩陣 → 四宮合鑰 |
| 支線一 | 時之沙漏（2 章） | 紀念日謎題 → 記憶滑塊拼圖 |
| 支線二 | 回聲迴廊（2 章） | 摩斯密碼 → 光徑迷宮 |
| 終局 | 告白之書 | 集齊三枚符文碎片 → 解開生日告白 |

每條線完成可得一枚**符文碎片**；三枚到齊才能開啟終局的《告白之書》。
進度自動存在瀏覽器（`localStorage`），關掉重開也不會遺失。

---

## ✏️ 如何客製化（只要改一個檔案）

打開 **`js/config.js`**，裡面每一項都有註解，改完存檔、重新整理網頁即可生效。
謎題答案會自動跟著你的設定走，**改了不會把遊戲弄壞**。

可改的東西：
- `hero` / `author`：壽星與你的稱呼
- `birthday`：生日（終局開鎖密碼，格式 `MMDD`，例如 `0622`）
- `metDate`：你們「故事開始的那一天」（支線一答案，格式 `MMDD`）
- `spell`：主線咒語（M1 密碼答案，**限英文字母 A–Z**）
- `nickname`：你對她的暱稱（支線二摩斯碼答案，**限英文字母 A–Z**）
- `finale.message`：終局《告白之書》的內容（想寫多長都可以）

### 放入你們的照片
1. 把照片放到 `assets/photos/` 資料夾。
2. 在 `config.js` 的 `finale.photos` 填入檔名，例如：
   ```js
   photos: ["assets/photos/us1.jpg", "assets/photos/us2.jpg"],
   ```
3. 第一張照片也會自動變成支線一「記憶滑塊拼圖」的圖片。

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
js/puzzles/           八種謎題元件
assets/photos/        放你們的照片
```

獻給最會解謎的人，生日快樂。 ✦
