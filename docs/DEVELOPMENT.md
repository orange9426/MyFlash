# StaircaseTrial 开发记忆

> 楼道暴露挑战（StaircaseTrial）— 混凝土楼道中的羞耻审判模拟。玩家从起始层出发，交替完成楼内任务与上楼任务，管理积分与衣物，抵达顶层后按得分结算结局。全站中文。

本文档为项目的持久记忆，供后续迭代时快速恢复上下文。代码是唯一事实来源，本文档描述意图与约定。

---

## 1. 快速开始

```bash
npm install
npm run dev      # http://localhost:5173/StaircaseTrial/
npm run build    # tsc -b && vite build -> dist/
npm run preview
npm run lint
```

无测试。推送至 `main` 触发 `.github/workflows/deploy.yml` 部署到 GitHub Pages，Vite `base: '/StaircaseTrial/'`。

---

## 2. 技术栈

- Vite 7 + React 19 + TypeScript 5.8
- Tailwind v4 (`@tailwindcss/vite`) + shadcn/ui (new-york, zinc)
- Zustand 5（无持久化中间件，手写 `storage.ts`）
- Sonner（通知）、Tabler Icons + Lucide
- localStorage 持久化

---

## 3. 架构：游戏逻辑与 UI 分离

**关键约定**：所有规则与状态变更只写在 `src/lib/game/`，React 仅做薄渲染。

```
src/lib/game/
  types.ts      # GameState, Task, ClothingItem("上衣"|"长裤"|"内裤"|"短袜"|"护膝"), AppView, GameHistoryRecord, ShopItem
  constants.ts  # 任务池 tasks.A/B/C/上楼任务、endings、shopItems、楼层映射、纯函数
  storage.ts    # gameState / staircaseGameHistory（最多 10 条）
  store.ts      # Zustand useGameStore（state/view/history/confirmRequest + 全部 actions）
```

### 状态机

`GameState.gamePhase: initial → shop → adventure → ended`，另有独立 `view: start|rules|shop|game|end|history` 供 `App.tsx` 路由。

- **楼层**：`currentFloor` 为相对 floor（1–10），显示用 `getDisplayFloor(floor, startingFloor)`。8 层需完成 2 个任务（`eighthFloorFirstTaskCompleted`）。
- **商店**：积分随机 0–22（语义 5–27，`createInitialGameState` 中地狱模式额外 -3），`startGame` 进店即自动扣除长裤价格（`shopItems:长裤=5`，不足则扣至 0）并标记 `clothing.长裤=true`；`buyItem/returnItem` 仍受 `canBuyItem` 约束且长裤 `required` 不可退；`startAdventure` 仍校验长裤（已自动满足）。开始页不再显示「将进入商店，长裤为必购项 / 地狱模式：初始积分 -3…」提示，相关说明仅保留于本文档。
- **任务**：1–2F 池 A、4–5F 池 B、7–8F 池 C；`TASK_FLOORS=[1,2,4,5,7,8]`，`CLIMBING_DECISION_FLOORS=[2,5,8]`，`NEXT_FLOOR_MAP={1:2,4:5,7:8}`，`CLIMBING_TARGET_MAP={2:4,5:7,8:10}`。8F 特殊二次抽取。
- **计分**：`calculateTaskScore = baseScore + (4 - 已穿关键衣物数)`，关键衣物 `KEY_CLOTHING_ITEMS=[上衣,长裤,内裤,短袜]`。完成后骰子 1–3 触发脱衣，可 5 分赎回；无衣可脱则直接 -5。
- **进度**：`progressStepsCompleted / TOTAL_PROGRESS_STEPS(10)` 驱动 `StairProgress`，到 10 触发 `endGame` → `getEnding(score)` 按 35/25/15/6/0 分档，写入历史。
- **确认**：`requestConfirm(message, options)` 的 Promise 桥接 `ConfirmDialog`。

`store.ts` 另导出 `getGameControls(state)` 与 `getActiveTaskDisplay(state)` 供 `GameSection` 使用。每次 mutation 后显式 `persist()`。

### 组件

```
src/components/
  AppHeader.tsx         # 56px 极简头，仅标题 + DEBUG 标记 + 导航
  WardrobeFigurine.tsx  # 克制线稿人形 + WardrobeStrip 胶囊条
  StairProgress.tsx     # 10 阶楼梯，无发光，仅 foreground 实心
  ConfirmDialog.tsx     # 轻量确认
  DebugTerminal.tsx     # 抽屉式调试面板（详见 §7）
  sections/ Start|Rules|Shop|Game|End|History
  ui/  shadcn 基础组件
```

`@/` → `src/`（`vite.config.ts` + `tsconfig.json`）。

---

## 4. 设计系统（2026-08-19 克制版）

**哲学**：删繁就简。删除所有英文副标题、渐变徽章与艳色填充，移动端优先，信息密度服务于“羞耻换积分”的对赌感。

- **色彩**：`--background 0.975` / `--foreground 0.2` 为基，`--primary 0.52 0.19 26`（审讯红）仅用于主按钮与分数，`--secondary` 仅作点缀。深色 `background 0.14`。无纸张噪点，仅保留顶部 4% 光晕（`src/index.css:154`）。
- **排版**：`--font-sans: Inter/Geist`，`--font-dossier: Instrument Serif + 宋体` 仅用于印章，`--font-mono: Geist Mono` 用于分数。标题 `tracking-tight`，正文 `text-muted-foreground`。
- **圆角**：`--radius 0.75rem`，卡片 `rounded-xl`，胶囊 `rounded-full`。
- **布局**：`max-w-[720px]` 居中单列，`AppHeader 56px sticky + backdrop-blur`，内容 `px-4 / pt-4`，页脚单行免责。所有网格默认单列，`sm` 起分栏。
- **动效**：`view-enter 0.32s / task-enter 0.36s`，尊重 `prefers-reduced-motion`。
- **图标**：`size-8` 头部图标（`IconStairs`），`size-4` 内联，触区 ≥44px。
- **Human figure**：`WardrobeFigurine` 为 1.15px 细线 + `foreground/[0.08]` 淡填充，虚线空心+细叉表示已脱；商店改用 `WardrobeStrip` 五枚胶囊，避免大插画抢视觉。

---

## 5. Favicon

`public/favicon.svg`（32×32，`rx=7`）：深色方底 `#0d0f16` + 三级楼梯白色折线（`stroke 1.8, round`），与头部 `IconStairs` 同构，极简且在深浅背景下均可识别。`index.html:5` 引用，`theme-color` 保持 `#f6f2ea / #0d0f16`。

---

## 6. 商店与游戏页要点

- **商店**：顶部仅积分 + `WardrobeStrip` + 单行说明；商品为极简行布局（名称/描述左，价格+按钮右），衣物 `sm:grid-cols-2`，道具同。长裤标记 `必选`，已购态为 `border-foreground/20 bg-muted/30`。
- **游戏**：`GameSection` 合并为人形 + 分数/楼层 + `StairProgress` 的首卡，库存仅在有道具时显示；任务卡为唯一焦点（编号 `text-[11px]`、标题 `text-lg font-semibold`、描述 `text-sm text-muted`、计分 `text-xs`），主按钮 `h-12 font-semibold` 全宽。

---

## 7. Debug 模式

- **入口**：标题 „楼道暴露挑战“ 连续点击 5 次（`src/hooks/useDebugMode.ts:4`），`toast` 提示，已激活后单击切换面板显隐。持久化 `localStorage: staircase-debug`。
- **面板**：`DebugTerminal` 为底部抽屉（`Dialog` 居中但限高），分两区：日志（`h-56` 滚动，`Copy/Clear`）与状态快照（floor/score/clothing/inventory/task），另提供快捷操作：+5 分、随机脱一件、清空存档。猴补 `console.*` 仅在激活后追加，避免噪音。
- **原则**：默认不可见，不干扰普通用户；入口克制但可发现；面板信息分层，日志与状态分离。

---

## 8. 持久化与历史

- `storage.ts`：`gameState` 存整局状态，`staircaseGameHistory` 存 `GameHistoryRecord[]`（时间/得分/最高层/完成数/剩余衣物/ending）。
- `normalizeLoadedState` 兼容旧 key（如 `白袜 → 短袜`），并补齐新增字段。

---

## 9. 约定

- 内容即数据：新增任务/商品/结局改 `constants.ts`，价格与分档在同一文件。
- 中文面向用户，代码与注释中英皆可但保持克制。
- 不直接改 `legacy/`（仅参考）。
- 添加 shadcn 组件：`npx shadcn@latest add <name>`。
- 移动端优先：所有新 UI 以 360px 视口验证触区与行长。

---

## 10. 近期变更备忘（2026-08）

- 全站重构为 React+TS v2，保留 `legacy/`。
- 2026-08-19：极简克制版 — 移除副标题/英文徽章/渐变与大插画，重做 `AppHeader(56px)`、`WardrobeFigurine/WardrobeStrip`、`Start/Shop/Game` 单列布局，`StairProgress` 去发光，`public/favicon.svg` 换为极简楼梯，`useDebugMode` 简化为 5 击 + 抽屉面板。
- 2026-08-20：开始页文案 — 标题「用羞耻换积分」→「怎么藏着一只全裸的贱狗？」；模式副标题「10 步·终点 N+9」→「第一次尝试吗？从普通开始吧。」、「12 步·初始 -3·电梯厅」→「变成无脑的暴露贱狗吧」；移除「将进入商店，长裤为必购项 / 地狱模式：初始积分 -3…」提示，改为 `store.startGame` 自动购入长裤（见 §3 商店），并配套地狱入口特效（`hell-select-card` 门缝光/REC/警示条纹 + `hell-start-btn` 扫光，`src/index.css`）。
