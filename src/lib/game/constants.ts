import { selectTaskPools } from "./tasks";
import type {
  ClothingItem,
  EndingDef,
  GameMode,
  GameState,
  OwnedInventory,
  OwnedItemId,
  Persona,
  ShopItem,
  Task,
} from "./types";
import {
  endingsHellFemale,
  endingsNormalFemale,
  tasksFemale,
} from "./tasksFemale";

export { tasksFemale, endingsNormalFemale, endingsHellFemale };

export const DEFAULT_OWNED_INVENTORY: OwnedInventory = {
  上衣: true,
  长裤: true,
  内裤: true,
  短袜: true,
  鞋子: true,
};

/** 默认拥有基础衣物和鞋子。 */
export const REQUIRED_OWNED_ITEMS: OwnedItemId[] = ["上衣", "长裤", "内裤", "短袜", "鞋子"];

export function createDefaultOwnedInventory(
  override?: Partial<OwnedInventory>,
): OwnedInventory {
  const forced = Object.fromEntries(REQUIRED_OWNED_ITEMS.map((id) => [id, true]));
  return { ...DEFAULT_OWNED_INVENTORY, ...override, ...forced };
}

export const TOTAL_FLOORS_NORMAL = 6;
export const TOTAL_FLOORS_HELL = 6;
/** @deprecated 使用 getTotalFloors(mode) */
export const TOTAL_FLOORS_FOR_PROGRESS = TOTAL_FLOORS_NORMAL;
export const TOTAL_PROGRESS_STEPS_NORMAL = 11;
export const TOTAL_PROGRESS_STEPS_HELL = 11;
/** @deprecated 使用 getTotalProgressSteps(mode) */
export const TOTAL_PROGRESS_STEPS = TOTAL_PROGRESS_STEPS_NORMAL;

/** 无跳过券时，花费积分跳过当前任务的消耗 */
export const SKIP_TASK_COST = 6;

/** 商店阶段允许重新随机积分的次数 */
export const MAX_SCORE_REROLLS = 2;

export const CLOTHING_ITEMS: ClothingItem[] = [
  "上衣",
  "长裤",
  "内裤",
  "短袜",
  "鞋子",
];

export function sanitizeClothing(
  clothing: Partial<Record<string, boolean>> | null | undefined,
): Record<ClothingItem, boolean> {
  return Object.fromEntries(
    CLOTHING_ITEMS.map((key) => [key, !!clothing?.[key]]),
  ) as Record<ClothingItem, boolean>;
}

/** 计入积分加成的装备。 */
export const KEY_CLOTHING_ITEMS: ClothingItem[] = [
  "上衣",
  "长裤",
  "内裤",
  "短袜",
  "鞋子",
];

/** 参与随机移除的装备。 */
export const STRIPPABLE_CLOTHING_ITEMS: ClothingItem[] = [
  "上衣",
  "长裤",
  "内裤",
  "短袜",
  "鞋子",
];

export const TASK_FLOORS_NORMAL = [1, 2, 3, 4, 5, 6] as const;
export const TASK_FLOORS_HELL = TASK_FLOORS_NORMAL;
export const HELL_TASK_FLOORS: readonly number[] = [];
export const TASK_FLOORS = TASK_FLOORS_NORMAL;
export const CLIMBING_DECISION_FLOORS_NORMAL = [1, 2, 3, 4, 5] as const;
export const CLIMBING_DECISION_FLOORS_HELL = CLIMBING_DECISION_FLOORS_NORMAL;
export const CLIMBING_DECISION_FLOORS = CLIMBING_DECISION_FLOORS_NORMAL;
export const NEXT_FLOOR_MAP_NORMAL: Record<number, number> = {};
export const NEXT_FLOOR_MAP_HELL = NEXT_FLOOR_MAP_NORMAL;
export const NEXT_FLOOR_MAP = NEXT_FLOOR_MAP_NORMAL;
export const CLIMBING_TARGET_MAP_NORMAL: Record<number, number> = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6};
export const CLIMBING_TARGET_MAP_HELL = CLIMBING_TARGET_MAP_NORMAL;
export const CLIMBING_TARGET_MAP = CLIMBING_TARGET_MAP_NORMAL;

export function getTotalFloors(mode: GameMode): number {
  return mode === "hell" ? TOTAL_FLOORS_HELL : TOTAL_FLOORS_NORMAL;
}

export function getTotalProgressSteps(mode: GameMode): number {
  return mode === "hell" ? TOTAL_PROGRESS_STEPS_HELL : TOTAL_PROGRESS_STEPS_NORMAL;
}

export function getTaskFloors(mode: GameMode): readonly number[] {
  return mode === "hell" ? TASK_FLOORS_HELL : TASK_FLOORS_NORMAL;
}

export function getClimbingDecisionFloors(mode: GameMode): readonly number[] {
  return mode === "hell"
    ? CLIMBING_DECISION_FLOORS_HELL
    : CLIMBING_DECISION_FLOORS_NORMAL;
}

export function getNextFloorMap(mode: GameMode): Record<number, number> {
  return mode === "hell" ? NEXT_FLOOR_MAP_HELL : NEXT_FLOOR_MAP_NORMAL;
}

export function getClimbingTargetMap(mode: GameMode): Record<number, number> {
  return mode === "hell" ? CLIMBING_TARGET_MAP_HELL : CLIMBING_TARGET_MAP_NORMAL;
}

export { maleNormalTasks as tasks } from "./tasks/maleNormal";

export const endingsNormal: EndingDef[] = [
  { minScore: 40, description: "怎么射、在哪射都随你，也可以不射，完成后回家" },
  { minScore: 30, description: "射到短袜上，含住至少10s，完成后回家" },
  { minScore: 20, description: "全裸跪下射出来，用身体或舌头舔干净，完成后回家" },
  { minScore: 10, description: "射到身上多处，拍下来，舔干净，完成后回家" },
  { minScore: 1, description: "不准射，裸体罚跪至少15分钟，戴贞操锁3天，短袜塞嘴里回家" },
  /** 结算不直接展示；由 resolveEnding 抽出一项 C 级任务后再落到上一档正文 */
  { minScore: 0, description: "当场再抽一项C级任务做完，再按1–9分结局执行" },
];

export const endingsHell: EndingDef[] = [
  { minScore: 60, description: "电梯厅不用再做任何事，马上回家，拿到「地狱幸存者」" },
  { minScore: 45, description: "电梯厅正中央全裸边缘至少两次，完成后才能射，再回家" },
  { minScore: 30, description: "电梯厅先完整尿出来，立刻边缘一次，再射出来，完成后回家" },
  { minScore: 15, description: "电梯厅全裸罚跪至少5分钟，拍下来，完成后回家" },
  { minScore: 0, description: "电梯厅全裸，尿出来，不准射，戴贞操锁7天，短袜塞嘴里回家" },
];

/** @deprecated 使用 endingsNormal / getEnding(score, mode) */
export const endings = endingsNormal;

export function getPersonaLabel(persona: Persona = "male"): string {
  return persona === "female" ? "母狗" : "公狗";
}

export function formatRunLabel(
  mode: GameMode = "normal",
  persona: Persona = "male",
): string {
  return `${mode === "hell" ? "地狱" : "普通"} · ${getPersonaLabel(persona)}`;
}

export function getTasks(persona: Persona = "male", mode: GameMode = "normal") {
  return selectTaskPools(persona, mode);
}

export function getEndings(mode: GameMode = "normal", persona: Persona = "male"): EndingDef[] {
  if (persona === "female") {
    return mode === "hell" ? endingsHellFemale : endingsNormalFemale;
  }
  return mode === "hell" ? endingsHell : endingsNormal;
}

export const shopItems: ShopItem[] = [
  {
    id: "长裤",
    name: "长裤",
    description: "遮盖下半身",
    price: 5,
    required: true,
    type: "clothing",
    clothingKey: "长裤",
  },
  {
    id: "上衣",
    name: "上衣",
    description: "遮挡上半身",
    price: 4,
    type: "clothing",
    clothingKey: "上衣",
  },
  {
    id: "内裤",
    name: "内裤",
    description: "遮住你最私密的部位",
    price: 4,
    type: "clothing",
    clothingKey: "内裤",
  },
  {
    id: "短袜",
    name: "短袜",
    description: "避免楼道的灰尘粘在脚上",
    price: 2,
    type: "clothing",
    clothingKey: "短袜",
  },
  {
    id: "鞋子",
    name: "鞋子",
    description: "保护双脚。不穿时计入积分加成，穿着时可能被随机移除。",
    price: 2,
    type: "clothing",
    clothingKey: "鞋子",
  },
  {
    id: "skip",
    name: "跳过任务券",
    description: "立刻跳过当前任务，不完成也过关。可买多张。",
    price: 6,
    type: "skip",
  },
  {
    id: "restore",
    name: "恢复内裤券",
    description: "内裤被脱掉后可穿回去。限购 1 次。",
    price: 8,
    type: "restore",
  },
  {
    id: "delayStrip",
    name: "延迟剥夺衣物券",
    description: "下次该脱衣时，可推迟到下一层再判定。",
    price: 5,
    type: "delayStrip",
  },
  {
    id: "riskDouble",
    name: "风险加倍券",
    description: "本局暴露加分 ×1.5，但脱衣更容易发生。限购 1 次。",
    price: 6,
    type: "riskDouble",
  },
];

export function rollStartingScore(mode: GameMode = "normal"): number {
  // 0–22（语义含必购长裤 5 分）；地狱额外 -3
  let score = Math.floor(Math.random() * 23);
  if (mode === "hell") {
    score = Math.max(0, score - 3);
  }
  return score;
}

export function createInitialGameState(
  startingFloor = 1,
  mode: GameMode = "normal",
  persona: Persona = "male",
): GameState {
  return {
    score: rollStartingScore(mode),
    currentFloor: 1,
    maxFloor: 1,
    startingFloor,
    gamePhase: "initial",
    mode,
    selectedMode: mode,
    persona,
    clothing: {
      上衣: false,
      长裤: false,
      内裤: false,
      短袜: false,
      鞋子: false,
    },
    currentTask: null,
    taskChoices: [],
    taskMessage: null,
    tasksCompleted: 0,
    inventory: {
      skip: 0,
      restore: 0,
      delayStrip: 0,
      riskDouble: 0,
    },
    assignedClimbingTask: null,
    hasBoughtRestore: false,
    hasBoughtRiskDouble: false,
    riskDoubleActive: false,
    pendingDelayedStrip: false,
    urineMarks: 0,
    hellTasksCompleted: 0,
    progressStepsCompleted: 0,
    owned: createDefaultOwnedInventory(),
    missionPlan: null,
    taskSource: "builtin",
    runTaskPools: null,
    resolvedEnding: null,
    routeVersion: 8,
    scoreRerollsUsed: 0,
    taskReplacementsUsed: 0,
    replacedTaskIds: [],
  };
}

export function getDisplayFloor(
  internalFloor: number,
  startingFloor: number,
): number {
  return internalFloor + startingFloor - 1;
}

export function getEnding(
  score: number,
  mode: GameMode = "normal",
  persona: Persona = "male",
): string {
  const list = getEndings(mode, persona);
  for (const ending of list) {
    if (score >= ending.minScore) {
      return ending.description;
    }
  }
  return list[list.length - 1].description;
}

export function getProgressPercent(state: GameState): number {
  if (state.gamePhase === "ended") return 100;
  const total = getTotalProgressSteps(state.mode);
  return Math.min(100, (state.progressStepsCompleted / total) * 100);
}

export function getTaskPoolForFloor(
  floor: number,
  mode: GameMode = "normal",
  persona: Persona = "male",
): Task[] | null {
  return getTaskFloors(mode).includes(floor) ? getTasks(persona, mode).楼层任务 : null;
}

export function pickRandomTask(pool: Task[], excludeId?: string): Task {
  if (pool.length === 0) {
    throw new Error("Task pool is empty");
  }
  if (!excludeId || pool.length === 1) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  let task: Task;
  do {
    task = pool[Math.floor(Math.random() * pool.length)];
  } while (task.id === excludeId);
  return task;
}

export function calculateTaskScore(state: GameState): number {
  if (!state.currentTask) return 0;
  const baseScore = state.currentTask.baseScore;
  const wornCount = KEY_CLOTHING_ITEMS.filter(
    (item) => state.clothing[item],
  ).length;
  let clothingBonus = KEY_CLOTHING_ITEMS.length - wornCount;
  // 地狱模式暴露加成额外 +1
  if (state.mode === "hell") {
    clothingBonus += 1;
  }
  // 风险加倍券：暴露加成 ×1.5
  if (state.riskDoubleActive) {
    clothingBonus = Math.floor(clothingBonus * 1.5);
  }
  const urineBonus = state.currentTask.urineBonus ?? 0;
  return baseScore + clothingBonus + urineBonus;
}

export function getWornClothingCount(state: GameState): number {
  return Object.values(state.clothing).filter(Boolean).length;
}

/** 剥夺衣物触发阈值：普通 ≤3(50%)；地狱/风险加倍 ≤4(66%)；风险加倍升至 70%≈≤4.2 用 ≤4 */
export function getStripDiceThreshold(state: GameState): number {
  if (state.riskDoubleActive) return 4; // ~66–70%
  if (state.mode === "hell") return 4;
  return 3;
}

/** 六层路线统一费用。 */
export function getKeepClothingCost(_state: GameState): number {
  void _state;
  return 5;
}

export function viewFromPhase(phase: GameState["gamePhase"]): import("./types").AppView {
  switch (phase) {
    case "shop":
      return "shop";
    case "adventure":
      return "game";
    case "ended":
      return "end";
    default:
      return "start";
  }
}
