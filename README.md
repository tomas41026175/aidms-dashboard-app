# AIDMS System Monitor — DashboardApp

> 麗臺科技前端實作題 Task 1：系統監控儀表板

## 技術棧

- **前端**：React 18 + TypeScript + Vite
- **後端**：Node.js + Express（`server.js`）
- **UI**：`@mui/material` + `@mui/x-charts`
- **圖表套件**：`@aidms/chart-components`（Task 2 自製套件）
- **推播**：Server-Sent Events（SSE）

---

## 安裝

```bash
# 在 DashboardApp/ 目錄下
npm install
```

---

## 啟動

```bash
# 啟動後端服務
node server.js

# 啟動前端服務（另開一個終端機）
npm start
```

開啟瀏覽器：<http://localhost:5173>

---

## 建置（Production）

```bash
npm run build
node server.js   # server.js 會同時服務 dist/ 靜態檔案
```

---

## 測試

```bash
npm test
```

**測試覆蓋：33 個測試 / 3 個場景**

| 場景 | 描述 |
|------|------|
| 場景 1 | 正常渲染：收到 SSE 資料後正確顯示指標 |
| 場景 2 | 錯誤處理：SSE 斷線 + ErrorBoundary |
| 場景 3 | 資料更新：即時數值更新、告警觸發 |

---

## 架構說明

```
DashboardApp/
├── server.js          ← Node.js 後端（Express + SSE + systeminformation）
├── src/
│   ├── types/         ← TypeScript 型別（SystemMetrics 等）
│   ├── utils/         ← 告警邏輯、格式化工具（純函式）
│   ├── hooks/         ← useSystemMetrics（SSE hook）
│   └── components/    ← React 元件（Dashboard、MetricCards 等）
└── dist/              ← Production build（npm run build 後產生）
```

### 後端 SSE 設計

- 啟動時立即收集一次資料放入 ring buffer（maxLen=150）
- 連線時先送 `history` event（150 筆），頁面立即有圖
- 每 2 秒送 `metrics` event（即時更新）
- 每 15 秒送心跳 comment（防 Nginx 60s timeout 斷線）

### 告警邏輯

| 指標 | Warning | Critical |
|------|---------|----------|
| CPU | > 70% | > 85% |
| 記憶體 | > 75% | > 90% |
| 磁碟 | > 80% | > 90% |

**連續 3 點**才觸發告警（過濾單點 spike，避免 alert storm）

### 響應式設計

| 斷點 | 裝置 | 顯示內容 |
|------|------|---------|
| < 600px | 手機 | MetricCards（2×2） |
| ≥ 600px | 平板 | + 趨勢折線圖 |
| ≥ 900px | 桌面 | + Per-Core + 磁碟分區 |

使用條件渲染（非 CSS hidden），避免 MUI x-charts SVG 在隱藏狀態下的 width=0 問題。
