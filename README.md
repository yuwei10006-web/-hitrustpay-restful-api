# HiTRUSTpay RESTful API 串接測試站

商家後台串接 HiTRUSTpay RESTful API 的測試工具，包含信用卡交易（授權／取消授權／請款／取消請款／退款／取消退款／查詢）、定期定額、LINE Pay、Apple Pay、隨身付(Follow Pay)等功能頁面。

- `backend/`：Node.js + Express，負責簽章、呼叫 HiTRUSTpay API、處理付款結果回傳(`return`/`notify`)
- `frontend/`：React + Vite，提供每支 API 的測試表單

---

## 1. 本機開發

分別開兩個終端機：

```bash
cd backend
npm install
npm run dev      # http://localhost:3000
```

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

前端預設會打 `http://localhost:3000`（見 `frontend/src/api/paymentApi.js` 的 fallback 值），本機不需要另外設定任何環境變數。

`backend/.env` 需要自己建立（不會進版控），內容參考 `backend/.env.example` 的欄位名稱，實際值跟 HiTRUSTpay 申請商店代號時拿到的資料填。

---

## 2. 環境變數說明

都設定在 `backend/.env`（本機）或部署平台的環境變數設定頁（正式／測試站）。

| 變數 | 說明 | 本機範例 | 部署時範例 |
|---|---|---|---|
| `HITRUSTPAY_API_KEY` | 單一商店的 API Key（base64） | 你申請到的值 | 同左 |
| `HITRUSTPAY_API_KEYS` | 多商店時的 API Key 對照表（JSON字串），格式 `{"商店代號":"key", ...}` | 選填 | 選填 |
| `MERID` | 預設商店代號 | `T2672` | 同左 |
| `NODE_ENV` | 決定打 HiTRUSTpay 測試站還是正式站，`production` 才會打正式站 | `test` | **先維持 `test`**，見下方提醒 |
| `FRONTEND_URL` | 前端網址，付款流程的 CORS／連結會用到 | `http://localhost:5173` | `https://你的網域` |
| `BACKEND_URL` | 後端網址，`returnURL`/`updateURL`/`notify` 這些回呼會用到 | `http://localhost:3000` | `https://你的網域` |
| `PORT` | 後端監聽的 port | 不用填，預設 3000 | 通常留給平台自動注入，不用填 |

`frontend/.env.production` 只有一個變數：

| 變數 | 說明 |
|---|---|
| `VITE_BACKEND_URL` | 留空 = 打相對路徑 `/api/...`（前後端同源部署時用），若前後端分開部署在不同網域，才需要填後端完整網址 |

> **`NODE_ENV` 重要提醒**：「把網站部署上線」跟「開始使用 HiTRUSTpay 正式金流」是兩件事。除非已經申請好正式商店代號、要開始收真的錢，否則部署後 `NODE_ENV` 還是建議維持 `test`，避免不小心打到 HiTRUSTpay 正式站。

---

## 3. 部署（單一服務：後端一併 serve 前端打包檔）

`backend/index.js` 已經設定成：正式環境下會把 `frontend/dist`（打包後的靜態檔案）一起 serve 出去，`/api/*` 以外的路徑都導回 `index.html` 讓 React Router 接手。這樣只需要部署**一個服務**，不用另外處理跨網域(CORS)問題。

### Build / Start 指令

```bash
# Build
cd frontend && npm install && npm run build

# Start
cd backend && npm install && npm start
```

大部分平台（Render / Railway / Zeabur 等）會分別有「Build Command」「Start Command」兩個欄位，照上面填。

### 部署前檢查清單

- [ ] `backend/.env` 沒有被提交到 git（`.gitignore` 裡要有 `.env`）
- [ ] 部署平台的環境變數已依照上方表格設定
- [ ] `NODE_ENV` 確認要不要打正式站（預設先用 `test`）
- [ ] 部署成功、拿到平台配發的網址後，回頭把 `FRONTEND_URL` / `BACKEND_URL` 更新成該網址，重新部署一次生效
- [ ] 用「授權」頁面實際測一筆交易，確認能正常導轉到 HiTRUSTpay 並導轉回來

---

## 4. 常見問題

**Q: 部署後打 API 沒反應／404？**
確認 `PORT` 有沒有被寫死。`backend/index.js` 是用 `process.env.PORT || 3000`，如果平台注入的 port 沒被吃到，通常是有另一個地方寫死了 port，檢查有沒有改到別的檔案。

**Q: 部署後付款完成，沒有正確導轉回我的網站？**
檢查 `BACKEND_URL` 環境變數是不是還停在 `localhost`，這個值會直接組進送給 HiTRUSTpay 的 `returnURL`/`updateURL`。

**Q: 前端頁面重新整理後變成 404？**
代表 SPA fallback 沒生效，檢查 `backend/index.js` 裡 `app.get(/^\/(?!api\/).*/, ...)` 這段是否存在，以及 `frontend/dist` 是否真的有被 build 出來、路徑對不對。
