import { create } from "zustand";
import { getReplacementCandidates, MAX_TASK_REPLACEMENTS, replacePlannedTask } from "./taskReplacement";
import {
  concretizeTask,
  generateMissionPlan,
  getPlannedClimbingTask,
  getPlannedFloorTask,
  normalizeMissionPlan,
  normalizeOwnedInventory,
  resolveEnding,
  resolveTaskDescription,
} from "./advisor";
import {
  STRIPPABLE_CLOTHING_ITEMS,
  calculateTaskScore,
  createInitialGameState,
  getClimbingDecisionFloors,
  getClimbingTargetMap,
  getDisplayFloor,
  getKeepClothingCost,
  getNextFloorMap,
  getStripDiceThreshold,
  getTaskFloors,
  getTaskPoolForFloor,
  getTotalFloors,
  getTotalProgressSteps,
  MAX_SCORE_REROLLS,
  pickRandomTask,
  rollStartingScore,
  sanitizeClothing,
  shopItems,
  SKIP_TASK_COST,
  getTasks,
} from "./constants";
import {
  appendHistoryRecord,
  clearGameStateStorage,
  loadGameStateFromStorage,
  loadHistoryFromStorage,
  saveGameStateToStorage,
  saveOwnedInventoryToStorage,
  savePersonaToStorage,
} from "./storage";
import type {
  AppView,
  ConfirmOptions,
  GameHistoryRecord,
  GameMode,
  GameState,
  Inventory,
  OwnedInventory,
  Persona,
} from "./types";

interface ConfirmRequest {
  message: string;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface GameStore {
  state: GameState;
  view: AppView;
  history: GameHistoryRecord[];
  confirmRequest: ConfirmRequest | null;
  /** 首页选中地狱时的氛围预览，不入档 */
  hellPreview: boolean;
  setHellPreview: (value: boolean) => void;
  setView: (view: AppView) => void;
  hydrate: () => void;
  startGame: (startingFloor: number, mode?: GameMode, owned?: OwnedInventory, persona?: Persona) => void;
  rerollShopScore: () => boolean;
  buyItem: (itemId: string, price: number) => boolean;
  returnItem: (itemId: string) => boolean;
  startAdventure: () => boolean;
  confirmDepart: () => boolean;
  completeTask: () => Promise<void>;
  replaceTask: () => boolean;
  nextFloor: () => void;
  assignClimbingTask: () => void;
  confirmClimbing: () => void;
  skipTask: () => Promise<void>;
  useRestoreVoucher: () => void;
  forfeitGame: () => Promise<void>;
  restartGame: () => void;
  endGame: (reason: string) => void;
  requestConfirm: (
    message: string,
    options?: ConfirmOptions,
  ) => Promise<boolean>;
  resolveConfirm: (value: boolean) => void;
  canBuyItem: (itemId: string, price: number) => {
    disabled: boolean;
    label: string;
  };
}

function clampScore(v: unknown, fallback: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : fallback;
  return Math.max(0, n);
}

function emptyInventory(): Inventory {
  return { skip: 0, restore: 0, delayStrip: 0, riskDouble: 0 };
}

function normalizeInventory(raw: unknown): Inventory {
  const base = emptyInventory();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<Inventory>;
  return {
    skip: clampScore(data.skip, 0),
    restore: clampScore(data.restore, 0),
    delayStrip: clampScore(data.delayStrip, 0),
    riskDouble: clampScore(data.riskDouble, 0),
  };
}

function normalizeLoadedState(raw: unknown): GameState {
  const base = createInitialGameState();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<GameState>;
  const mode: GameMode = data.mode === "hell" ? "hell" : "normal";
  const selectedMode: GameMode =
    data.selectedMode === "hell" || data.selectedMode === "normal"
      ? data.selectedMode
      : mode;
  const persona: Persona = data.persona === "female" ? "female" : "male";
  const totalFloors = getTotalFloors(mode);
  const totalProgress = getTotalProgressSteps(mode);

  const normalizedStartingFloor =
    typeof data.startingFloor === "number" && Number.isFinite(data.startingFloor) && data.startingFloor >= 1
      ? Math.floor(data.startingFloor)
      : 1;
  const normalizedCurrentFloor =
    typeof data.currentFloor === "number" && Number.isFinite(data.currentFloor)
      ? Math.max(1, Math.min(totalFloors, Math.floor(data.currentFloor)))
      : base.currentFloor;
  const normalizedMaxFloor =
    typeof data.maxFloor === "number" && Number.isFinite(data.maxFloor)
      ? Math.max(normalizedCurrentFloor, Math.min(totalFloors, Math.floor(data.maxFloor)))
      : normalizedCurrentFloor;
  const normalizedProgress =
    typeof data.progressStepsCompleted === "number" && Number.isFinite(data.progressStepsCompleted)
      ? Math.max(0, Math.min(totalProgress, Math.floor(data.progressStepsCompleted)))
      : 0;

  const inferredPhase =
    data.gamePhase ??
    (data.currentFloor && data.currentFloor > 0 ? "adventure" : "initial");

  const inv = normalizeInventory(data.inventory);

  return {
    ...base,
    ...data,
    mode,
    selectedMode,
    persona,
    score: clampScore(data.score, base.score),
    taskReplacementsUsed: Math.min(MAX_TASK_REPLACEMENTS, clampScore(data.taskReplacementsUsed, 0)),
    replacedTaskIds: Array.isArray(data.replacedTaskIds)
      ? data.replacedTaskIds.filter((id): id is string => typeof id === "string") : [],
    currentFloor: normalizedCurrentFloor,
    maxFloor: normalizedMaxFloor,
    startingFloor: normalizedStartingFloor,
    clothing: sanitizeClothing(data.clothing),
    inventory: inv,
    tasksCompleted: clampScore(data.tasksCompleted, 0),
    tasksCompletedInPhase: {
      A: clampScore(data.tasksCompletedInPhase?.A, 0),
      B: clampScore(data.tasksCompletedInPhase?.B, 0),
      C: clampScore(data.tasksCompletedInPhase?.C, 0),
      H: clampScore(data.tasksCompletedInPhase?.H, 0),
    },
    currentTask:
      data.currentTask && typeof data.currentTask === "object" && "id" in (data.currentTask as object)
        ? (data.currentTask as GameState["currentTask"])
        : null,
    assignedClimbingTask:
      data.assignedClimbingTask && typeof data.assignedClimbingTask === "object" && "targetFloor" in (data.assignedClimbingTask as object)
        ? (data.assignedClimbingTask as GameState["assignedClimbingTask"])
        : null,
    taskMessage: typeof data.taskMessage === "string" ? data.taskMessage : null,
    progressStepsCompleted: normalizedProgress,
    gamePhase: (["initial", "shop", "adventure", "ended"] as const).includes(inferredPhase as GameState["gamePhase"])
      ? (inferredPhase as GameState["gamePhase"])
      : base.gamePhase,
    currentPhase:
      typeof data.currentPhase === "string" && ["A", "B", "C", "H"].includes(data.currentPhase)
        ? data.currentPhase
        : base.currentPhase,
    eighthFloorFirstTaskCompleted: !!data.eighthFloorFirstTaskCompleted,
    hasBoughtRestore: !!data.hasBoughtRestore,
    hasBoughtRiskDouble: !!data.hasBoughtRiskDouble || inv.riskDouble > 0 || !!data.riskDoubleActive,
    riskDoubleActive: !!data.riskDoubleActive,
    pendingDelayedStrip: !!data.pendingDelayedStrip,
    urineMarks: clampScore(data.urineMarks, 0),
    hellTasksCompleted: clampScore(data.hellTasksCompleted, 0),
    owned: normalizeOwnedInventory(data.owned),
    missionPlan: normalizeMissionPlan(data.missionPlan),
    resolvedEnding: typeof data.resolvedEnding === "string" ? data.resolvedEnding : null,
    scoreRerollsUsed: Math.min(
      MAX_SCORE_REROLLS,
      clampScore(data.scoreRerollsUsed, 0),
    ),
  };
}

function lockInFlavorText(state: GameState): GameState {
  let next = { ...state, clothing: sanitizeClothing(state.clothing) };
  if (next.currentTask) {
    const locked = concretizeTask(next.currentTask, next.clothing, next.owned);
    if (locked.description !== next.currentTask.description) {
      next = { ...next, currentTask: locked };
    }
  }
  if (next.assignedClimbingTask) {
    const locked = concretizeTask(next.assignedClimbingTask, next.clothing, next.owned);
    if (locked.description !== next.assignedClimbingTask.description) {
      next = { ...next, assignedClimbingTask: { ...next.assignedClimbingTask, ...locked } };
    }
  }
  if (next.gamePhase === "ended" && !next.resolvedEnding) {
    next = { ...next, resolvedEnding: resolveEnding(next) };
  }
  return next;
}

function persist(state: GameState) {
  try {
    saveGameStateToStorage({ ...state, clothing: sanitizeClothing(state.clothing) });
  } catch {
    // 忽略存储失败
  }
}

function generateNewTask(state: GameState): Partial<GameState> {
  const floor = state.currentFloor;
  const taskInfo = getTaskPoolForFloor(floor, state.mode, state.persona);

  if (!taskInfo) {
    if (getClimbingDecisionFloors(state.mode).includes(floor)) {
      return applyClimbing(state);
    }
    return {
      currentTask: null,
      taskMessage: "请上1层楼",
    };
  }

  const planned = state.missionPlan
    ? getPlannedFloorTask(state.missionPlan, floor, state.eighthFloorFirstTaskCompleted)
    : null;
  const assign = (task: NonNullable<GameState["currentTask"]>) =>
    concretizeTask(task, state.clothing, state.owned);

  if (planned) {
    return {
      currentTask: assign(planned),
      taskMessage: null,
      currentPhase: taskInfo.phase,
    };
  }

  if (floor === 8 && state.currentTask) {
    const newTask = pickRandomTask(taskInfo.pool, state.currentTask.id);
    return {
      currentTask: assign(newTask),
      taskMessage: null,
      currentPhase: taskInfo.phase,
    };
  }

  const newTask = pickRandomTask(taskInfo.pool);
  return {
    currentTask: assign(newTask),
    taskMessage: null,
    currentPhase: taskInfo.phase,
  };
}

function applyClimbing(state: GameState): Pick<
  GameState,
  "assignedClimbingTask" | "currentTask" | "taskMessage"
> {
  const availableTasks = getTasks(state.persona)["上楼任务"];
  const planned = state.missionPlan
    ? getPlannedClimbingTask(state.missionPlan, state.currentFloor)
    : null;
  const selectedTask =
    planned ?? availableTasks[Math.floor(Math.random() * availableTasks.length)];
  const targetFloor = getClimbingTargetMap(state.mode)[state.currentFloor];
  return {
    assignedClimbingTask: {
      ...concretizeTask(selectedTask, state.clothing, state.owned),
      targetFloor,
    },
    currentTask: null,
    taskMessage: null,
  };
}

function shouldAssignClimbing(state: GameState): boolean {
  if (state.assignedClimbingTask || state.currentTask) return false;
  if (state.currentFloor === 8 && !state.eighthFloorFirstTaskCompleted) return false;
  return getClimbingDecisionFloors(state.mode).includes(state.currentFloor);
}

function afterTaskCleared(state: GameState): GameState {
  if (state.currentFloor === 8 && !state.eighthFloorFirstTaskCompleted) {
    const marked = { ...state, eighthFloorFirstTaskCompleted: true };
    return { ...marked, ...generateNewTask(marked) };
  }
  if (shouldAssignClimbing(state)) {
    return { ...state, ...applyClimbing(state) };
  }
  const nextFloorMap = getNextFloorMap(state.mode);
  return {
    ...state,
    taskMessage: nextFloorMap[state.currentFloor] ? "请上1层楼" : "已跳过当前任务",
  };
}

function getInventoryCount(inv: Inventory, type: string): number {
  switch (type) {
    case "skip":
      return inv.skip;
    case "restore":
      return inv.restore;
    case "delayStrip":
      return inv.delayStrip;
    case "riskDouble":
      return inv.riskDouble;
    default:
      return 0;
  }
}

/** 执行一次剥夺衣物判定（可能弹窗），返回更新后的 state */
async function applyStripEvent(
  next: GameState,
  requestConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>,
): Promise<GameState> {
  const keepCost = getKeepClothingCost(next);
  const removableItems = STRIPPABLE_CLOTHING_ITEMS.filter((item) => next.clothing[item]);

  if (removableItems.length === 0) {
    // 无衣可脱：-5 分 + 强制尿液标记
    return {
      ...next,
      score: Math.max(0, next.score - 5),
      urineMarks: next.urineMarks + 1,
    };
  }

  const canAffordToKeep = next.score >= keepCost;
  let message = `你的运气不好，将被强制脱去一件衣物。\n是否花费 ${keepCost} 积分保留？\n\n当前积分：${next.score}`;
  let options: ConfirmOptions = {
    yesText: `花费${keepCost}积分保留`,
    noText: "不保留",
  };

  if (!canAffordToKeep) {
    message = `你的运气不好，将被强制脱去一件衣物。（积分不足 ${keepCost} 分，无法保留）\n\n当前积分：${next.score}`;
    options = { yesText: "确认", showNoButton: false };
  }

  // 若持有延迟剥夺衣物券，可选择推迟
  if (next.inventory.delayStrip > 0 && !next.pendingDelayedStrip) {
    const useDelay = await requestConfirm(
      `触发剥夺衣物判定。\n是否使用「延迟剥夺衣物券」推迟到下一层？\n\n当前积分：${next.score}`,
      { yesText: "使用延迟剥夺衣物券", noText: "本次处理" },
    );
    if (useDelay) {
      return {
        ...next,
        inventory: {
          ...next.inventory,
          delayStrip: next.inventory.delayStrip - 1,
        },
        pendingDelayedStrip: true,
      };
    }
  }

  const confirmResult = await requestConfirm(message, options);
  if (confirmResult && canAffordToKeep) {
    return { ...next, score: Math.max(0, next.score - keepCost) };
  }

  const randomIndex = Math.floor(Math.random() * removableItems.length);
  const itemToRemove = removableItems[randomIndex];
  return {
    ...next,
    clothing: { ...next.clothing, [itemToRemove]: false },
  };
}

function isHellFinale(state: Pick<GameState, "mode" | "currentFloor">): boolean {
  return state.mode === "hell" && state.currentFloor === 11;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialGameState(),
  view: "start",
  history: [],
  confirmRequest: null,
  hellPreview: false,
  setHellPreview: (value) => set({ hellPreview: value }),

  setView: (view) => {
    const phase = get().state.gamePhase;
    const inPlay = phase === "shop" || phase === "adventure";
    if (view === "history" && inPlay) return;
    set({ view });
  },

  hydrate: () => {
    const raw = loadGameStateFromStorage();
    const loadedHistory = loadHistoryFromStorage();

    if (raw) {
      const state = lockInFlavorText(normalizeLoadedState(raw));
      let view: AppView = "start";
      if (state.gamePhase === "ended") view = "end";
      else if (state.gamePhase === "adventure") view = "game";
      else if (state.gamePhase === "shop") view = "shop";
      const ready =
        view === "game" && shouldAssignClimbing(state)
          ? lockInFlavorText({ ...state, ...applyClimbing(state) })
          : state;
      persist(ready);
      set({ state: ready, view, history: loadedHistory });
      return;
    }

    set({ view: "start", history: loadedHistory });
  },

  requestConfirm: (message, options = {}) =>
    new Promise<boolean>((resolve) => {
      set({ confirmRequest: { message, options, resolve } });
    }),

  resolveConfirm: (value) => {
    const { confirmRequest } = get();
    confirmRequest?.resolve(value);
    set({ confirmRequest: null });
  },

  startGame: (startingFloor, mode = "normal", owned, persona = "male") => {
    const floor = Math.max(1, Math.min(99, Math.floor(startingFloor) || 1));
    const ownedInventory = normalizeOwnedInventory(owned);
    saveOwnedInventoryToStorage(ownedInventory);
    savePersonaToStorage(persona);
    const initial = createInitialGameState(floor, mode, persona);
    const pantsPrice = shopItems.find((i) => i.id === "长裤")?.price ?? 5;
    const withOwned: GameState = {
      ...initial,
      owned: ownedInventory,
      missionPlan: generateMissionPlan(mode, ownedInventory, persona),
    };
    const state: GameState = {
      ...withOwned,
      score: Math.max(0, withOwned.score - pantsPrice),
      clothing: { ...withOwned.clothing, 长裤: true },
      gamePhase: "shop" as const,
    };
    persist(state);
    set({ state, view: "shop" });
  },

  rerollShopScore: () => {
    const { state } = get();
    if (state.gamePhase !== "shop") return false;
    if (state.scoreRerollsUsed >= MAX_SCORE_REROLLS) return false;

    const pantsPrice = shopItems.find((i) => i.id === "长裤")?.price ?? 5;
    const next: GameState = {
      ...state,
      score: Math.max(0, rollStartingScore(state.mode) - pantsPrice),
      clothing: {
        上衣: false,
        长裤: true,
        内裤: false,
        短袜: false,
        护膝: false,
      },
      inventory: emptyInventory(),
      hasBoughtRestore: false,
      hasBoughtRiskDouble: false,
      riskDoubleActive: false,
      scoreRerollsUsed: state.scoreRerollsUsed + 1,
    };
    persist(next);
    set({ state: next });
    return true;
  },

  canBuyItem: (itemId, price) => {
    const { state } = get();
    const item = shopItems.find((i) => i.id === itemId);

    if (
      item?.type === "clothing" &&
      item.clothingKey &&
      !state.owned[item.clothingKey]
    ) {
      return { disabled: true, label: "未拥有" };
    }

    if (itemId === "restore" && state.hasBoughtRestore) {
      return { disabled: true, label: "已购买" };
    }
    if (itemId === "riskDouble" && state.hasBoughtRiskDouble) {
      return { disabled: true, label: "已购买" };
    }

    if (
      item?.type === "clothing" &&
      item.clothingKey &&
      state.clothing[item.clothingKey]
    ) {
      return { disabled: true, label: "已拥有" };
    }

    if (state.score < price) {
      return { disabled: true, label: "积分不足" };
    }

    return { disabled: false, label: "购买" };
  },

  buyItem: (itemId, price) => {
    const { state } = get();
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return false;

    if (
      !state.clothing["长裤"] &&
      itemId !== "长裤" &&
      state.score - price < 5
    ) {
      return false;
    }

    if (
      item.type === "clothing" &&
      item.clothingKey &&
      !state.owned[item.clothingKey]
    ) {
      return false;
    }

    if (state.score < price) return false;
    if (itemId === "restore" && state.hasBoughtRestore) return false;
    if (itemId === "riskDouble" && state.hasBoughtRiskDouble) return false;

    if (
      item.type === "clothing" &&
      item.clothingKey &&
      state.clothing[item.clothingKey]
    ) {
      return false;
    }

    const next: GameState = { ...state, score: state.score - price };

    if (item.type === "clothing" && item.clothingKey) {
      next.clothing = { ...next.clothing, [item.clothingKey]: true };
    } else if (item.type === "skip") {
      next.inventory = { ...next.inventory, skip: next.inventory.skip + 1 };
    } else if (item.type === "restore") {
      next.inventory = {
        ...next.inventory,
        restore: next.inventory.restore + 1,
      };
      next.hasBoughtRestore = true;
    } else if (item.type === "delayStrip") {
      next.inventory = {
        ...next.inventory,
        delayStrip: next.inventory.delayStrip + 1,
      };
    } else if (item.type === "riskDouble") {
      next.inventory = {
        ...next.inventory,
        riskDouble: next.inventory.riskDouble + 1,
      };
      next.hasBoughtRiskDouble = true;
      next.riskDoubleActive = true;
    }

    persist(next);
    set({ state: next });
    return true;
  },

  returnItem: (itemId) => {
    const { state } = get();
    if (state.gamePhase !== "shop") return false;

    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return false;
    if (item.required) return false;

    let owned = false;
    if (item.type === "clothing" && item.clothingKey) {
      owned = state.clothing[item.clothingKey];
    } else {
      owned = getInventoryCount(state.inventory, item.type) > 0;
    }
    if (!owned) return false;

    const next: GameState = {
      ...state,
      score: state.score + item.price,
    };

    if (item.type === "clothing" && item.clothingKey) {
      next.clothing = { ...next.clothing, [item.clothingKey]: false };
    } else if (item.type === "skip") {
      next.inventory = { ...next.inventory, skip: next.inventory.skip - 1 };
    } else if (item.type === "restore") {
      next.inventory = {
        ...next.inventory,
        restore: next.inventory.restore - 1,
      };
      next.hasBoughtRestore = false;
    } else if (item.type === "delayStrip") {
      next.inventory = {
        ...next.inventory,
        delayStrip: next.inventory.delayStrip - 1,
      };
    } else if (item.type === "riskDouble") {
      next.inventory = {
        ...next.inventory,
        riskDouble: next.inventory.riskDouble - 1,
      };
      next.hasBoughtRiskDouble = false;
      next.riskDoubleActive = false;
    }

    persist(next);
    set({ state: next });
    return true;
  },

  startAdventure: () => {
    const { state } = get();
    if (!state.clothing["长裤"]) return false;
    set({ view: "briefing" });
    return true;
  },

  confirmDepart: () => {
    const { state } = get();
    if (!state.clothing["长裤"]) return false;

    const base = { ...state };
    const updates = generateNewTask(base);
    const next: GameState = {
      ...base,
      ...updates,
      gamePhase: "adventure",
    };
    persist(next);
    set({ state: next, view: "game" });
    return true;
  },

  replaceTask: () => {
    const { state, confirmRequest } = get();
    if (confirmRequest) return false;
    const candidates = getReplacementCandidates(state);
    if (!state.currentTask || candidates.length === 0) return false;
    const task = pickRandomTask(candidates);
    const next: GameState = {
      ...state,
      currentTask: concretizeTask(task, state.clothing, state.owned),
      missionPlan: replacePlannedTask(state, task),
      taskReplacementsUsed: state.taskReplacementsUsed + 1,
      replacedTaskIds: [...state.replacedTaskIds, state.currentTask.id],
      taskMessage: null,
    };
    persist(next);
    set({ state: next });
    return true;
  },

  completeTask: async () => {
    const { state, requestConfirm, confirmRequest } = get();
    if (!state.currentTask) return;
    if (confirmRequest) return;

    const currentFloor = state.currentFloor;
    const wasEighthFloorFirstTask =
      currentFloor === 8 && !state.eighthFloorFirstTaskCompleted;
    const scoreGained = calculateTaskScore(state);
    const phaseKey = state.currentPhase as keyof GameState["tasksCompletedInPhase"];
    const isHellTask = state.currentPhase === "H";

    let next: GameState = {
      ...state,
      score: state.score + scoreGained,
      tasksCompleted: state.tasksCompleted + 1,
      tasksCompletedInPhase: {
        ...state.tasksCompletedInPhase,
        [phaseKey]: (state.tasksCompletedInPhase[phaseKey] ?? 0) + 1,
      },
      urineMarks:
        state.urineMarks +
        (state.currentTask.urineBonus && state.currentTask.urineBonus > 0 ? 1 : 0),
      hellTasksCompleted: state.hellTasksCompleted + (isHellTask ? 1 : 0),
    };

    const hellFinale = isHellFinale({ mode: next.mode, currentFloor });

    // 11 层完成后直接结算，不再投掷剥夺衣物
    if (hellFinale) {
      next = { ...next, pendingDelayedStrip: false };
    } else if (next.pendingDelayedStrip) {
      next = { ...next, pendingDelayedStrip: false };
      next = await applyStripEvent(next, requestConfirm);
    } else {
      const threshold = getStripDiceThreshold(next);
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      if (diceRoll <= threshold) {
        next = await applyStripEvent(next, requestConfirm);
      }
    }

    next.score = Math.max(0, next.score);

    const taskFloors = getTaskFloors(next.mode);
    if (taskFloors.includes(currentFloor)) {
      if (currentFloor === 8) {
        if (!state.eighthFloorFirstTaskCompleted) {
          next = {
            ...next,
            progressStepsCompleted: next.progressStepsCompleted + 1,
            eighthFloorFirstTaskCompleted: true,
          };
          const taskUpdates = generateNewTask(next);
          next = { ...next, ...taskUpdates };
          persist(next);
          set({ state: next });
          return;
        }
        next = {
          ...next,
          progressStepsCompleted: next.progressStepsCompleted + 1,
          eighthFloorFirstTaskCompleted: false,
        };
      } else {
        next = {
          ...next,
          progressStepsCompleted: next.progressStepsCompleted + 1,
        };
      }
    }

    if (wasEighthFloorFirstTask) {
      persist(next);
      set({ state: next });
      return;
    }

    // 地狱：11 层 H 完成即结算，不再抬到 12、也不再脱衣
    if (hellFinale) {
      next = {
        ...next,
        progressStepsCompleted: Math.min(
          next.progressStepsCompleted,
          getTotalProgressSteps("hell"),
        ),
        currentTask: null,
        assignedClimbingTask: null,
        taskMessage: null,
      };
      persist(next);
      set({ state: next });
      get().endGame(
        `到达顶层 ${getDisplayFloor(11, next.startingFloor)}！游戏结束！`,
      );
      return;
    }

    const climbingFloors = getClimbingDecisionFloors(next.mode);
    const nextFloorMap = getNextFloorMap(next.mode);

    if (climbingFloors.includes(currentFloor)) {
      next = {
        ...next,
        ...applyClimbing({ ...next, currentTask: null }),
      };
    } else {
      next = {
        ...next,
        currentTask: null,
        taskMessage: nextFloorMap[currentFloor] ? "请上1层楼" : "任务完成！",
      };
    }

    persist(next);
    set({ state: next });
  },

  nextFloor: () => {
    const { state, confirmRequest } = get();
    if (confirmRequest) return;
    if (state.currentTask || state.assignedClimbingTask) return;
    const nextFloorMap = getNextFloorMap(state.mode);
    const nextFloorValue = nextFloorMap[state.currentFloor];
    if (!nextFloorValue) return;

    const next: GameState = {
      ...state,
      currentFloor: nextFloorValue,
      maxFloor: Math.max(state.maxFloor, nextFloorValue),
      ...generateNewTask({ ...state, currentFloor: nextFloorValue }),
    };

    persist(next);
    set({ state: next });
  },

  assignClimbingTask: () => {
    const { state, confirmRequest } = get();
    if (confirmRequest) return;
    if (!shouldAssignClimbing(state)) return;
    const next: GameState = { ...state, ...applyClimbing(state) };
    persist(next);
    set({ state: next });
  },

  confirmClimbing: () => {
    const { state, endGame, confirmRequest } = get();
    if (confirmRequest) return;
    if (!state.assignedClimbingTask) return;
    const previousFloor = state.currentFloor;
    const climbingFloors = getClimbingDecisionFloors(state.mode);
    if (!climbingFloors.includes(previousFloor)) {
      return;
    }

    const targetMap = getClimbingTargetMap(state.mode);
    const nextFloorValue = targetMap[previousFloor];
    const totalFloors = getTotalFloors(state.mode);

    // 上楼任务若含 urineBonus 也计标记
    const climbUrine =
      state.assignedClimbingTask.urineBonus &&
      state.assignedClimbingTask.urineBonus > 0
        ? 1
        : 0;

    // 地狱 10→11 的上楼不占用进度步（12 步分配给：7 楼内 + 8a/8b + 3 段爬中的前 3 段含 8→9 + 9H + 11H）
    const skipProgress = state.mode === "hell" && previousFloor === 10;
    const next: GameState = {
      ...state,
      progressStepsCompleted: skipProgress
        ? state.progressStepsCompleted
        : state.progressStepsCompleted + 1,
      currentFloor: nextFloorValue,
      maxFloor: Math.max(state.maxFloor, nextFloorValue),
      assignedClimbingTask: null,
      urineMarks: state.urineMarks + climbUrine,
    };

    // 普通：爬到 10 结算
    if (next.mode === "normal" && next.currentFloor >= totalFloors) {
      persist(next);
      set({ state: next });
      endGame(
        `到达顶层 ${getDisplayFloor(totalFloors, next.startingFloor)}！游戏结束！`,
      );
      return;
    }

    const landed: GameState = {
      ...next,
      ...generateNewTask({ ...next, currentFloor: nextFloorValue }),
    };
    persist(landed);
    set({ state: landed });
  },

  skipTask: async () => {
    const { state, requestConfirm, confirmRequest } = get();
    if (!state.currentTask) return;
    if (confirmRequest) return;

    if (state.inventory.skip > 0) {
      const useSkip = await requestConfirm("是否使用跳过任务券？");
      if (!useSkip) return;
      const fresh = get().state;
      if (fresh.inventory.skip <= 0 || !fresh.currentTask) return;
      const next = afterTaskCleared({
        ...fresh,
        inventory: { ...fresh.inventory, skip: fresh.inventory.skip - 1 },
        currentTask: null,
      });
      persist(next);
      set({ state: next });
      if (isHellFinale(next)) {
        get().endGame(
          `到达顶层 ${getDisplayFloor(11, next.startingFloor)}！游戏结束！`,
        );
      }
      return;
    }

    if (state.score >= SKIP_TASK_COST) {
      const usePoints = await requestConfirm(`是否花费${SKIP_TASK_COST}积分跳过任务？`);
      if (!usePoints) return;
      const fresh = get().state;
      if (!fresh.currentTask || fresh.score < SKIP_TASK_COST) return;
      const next = afterTaskCleared({
        ...fresh,
        score: Math.max(0, fresh.score - SKIP_TASK_COST),
        currentTask: null,
      });
      persist(next);
      set({ state: next });
      if (isHellFinale(next)) {
        get().endGame(
          `到达顶层 ${getDisplayFloor(11, next.startingFloor)}！游戏结束！`,
        );
      }
      return;
    }
    await requestConfirm("积分不足且没有跳过任务券，无法跳过。", {
      yesText: "确认",
      showNoButton: false,
    });
  },

  useRestoreVoucher: () => {
    const { state, confirmRequest } = get();
    if (confirmRequest) return;
    if (state.inventory.restore <= 0) return;
    if (state.clothing["内裤"]) return;

    const next = {
      ...state,
      clothing: { ...state.clothing, 内裤: true },
      inventory: { ...state.inventory, restore: state.inventory.restore - 1 },
    };
    persist(next);
    set({ state: next });
  },

  forfeitGame: async () => {
    const { requestConfirm, endGame, confirmRequest } = get();
    if (confirmRequest) return;
    const confirmForfeit = await requestConfirm(
      "你确定要放弃本次挑战吗？放弃后将直接进入结局判定。",
      { yesText: "确认放弃", noText: "继续挑战" },
    );
    if (!confirmForfeit) return;

    const { state } = get();
    const next = { ...state, score: 0 };
    persist(next);
    set({ state: next });
    endGame("挑战已放弃！");
  },

  restartGame: () => {
    clearGameStateStorage();
    set({
      state: createInitialGameState(),
      view: "start",
    });
  },

  endGame: (reason) => {
    const { state } = get();
    const resolvedEnding = resolveEnding(state);
    const next: GameState = { ...state, gamePhase: "ended", resolvedEnding };
    persist(next);

    const record: GameHistoryRecord = {
      timestamp: new Date().toLocaleString(),
      finalScore: next.score,
      maxFloor: getDisplayFloor(next.maxFloor, next.startingFloor),
      tasksCompleted: next.tasksCompleted,
      remainingClothes: Object.values(next.clothing).filter(Boolean).length,
      ending: resolvedEnding,
      mode: next.mode,
      persona: next.persona,
      hellTasksCompleted: next.hellTasksCompleted,
      urineMarks: next.urineMarks,
    };

    const history = appendHistoryRecord(record);
    set({ state: next, view: "end", history });
    void reason;
  },
}));

export function getGameControls(state: GameState) {
  const showForfeit = state.gamePhase === "adventure";
  const showCompleteTask = !!state.currentTask;
  const showConfirmClimbing = !!state.assignedClimbingTask;
  const nextFloorMap = getNextFloorMap(state.mode);

  let showNextFloor = false;
  let nextFloorLabel = "已到达下一层";

  if (
    state.gamePhase === "adventure" &&
    !state.currentTask &&
    !state.assignedClimbingTask
  ) {
    const dest = nextFloorMap[state.currentFloor];
    if (dest) {
      showNextFloor = true;
      nextFloorLabel = `已到达${getDisplayFloor(dest, state.startingFloor)}楼`;
    }
  }

  return {
    showForfeit,
    showCompleteTask,
    showConfirmClimbing,
    showNextFloor,
    nextFloorLabel,
  };
}

export function getActiveTaskDisplay(state: GameState) {
  if (state.assignedClimbingTask) {
    return {
      name: state.assignedClimbingTask.name,
      description: resolveTaskDescription(
        state.assignedClimbingTask.description,
        state.clothing,
      ),
    };
  }
  if (state.currentTask) {
    return {
      name: state.currentTask.name,
      description: resolveTaskDescription(state.currentTask.description, state.clothing),
    };
  }
  if (state.taskMessage) {
    return { name: state.taskMessage, description: null };
  }
  return { name: "暂无任务", description: null };
}

export {
  getDisplayFloor,
  getEnding,
  getProgressPercent,
  getTotalProgressSteps,
  KEY_CLOTHING_ITEMS,
  formatRunLabel,
  getPersonaLabel,
} from "./constants";
