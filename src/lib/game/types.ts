import type { TaskPools } from "./tasks/schema";
import type { TaskSource } from "./customTasks";
export type GamePhase = "initial" | "shop" | "adventure" | "ended";

export type GameMode = "normal" | "hell";

/** 公狗 = 男生任务；母狗 = 女生任务 */
export type Persona = "male" | "female";

export type ClothingItem =
  | "上衣"
  | "长裤"
  | "内裤"
  | "短袜"
  | "鞋子";

export type AppView =
  | "start"
  | "rules"
  | "disclaimer"
  | "shop"
  | "briefing"
  | "game"
  | "end"
  | "history"
  | "taskEditor";

export type OwnedItemId = ClothingItem;

export type OwnedInventory = Record<OwnedItemId, boolean>;

export type ItemImportance =
  | "required"
  | "strongly_recommended"
  | "recommended"
  | "optional";

export type WearRole =
  | "on"
  | "off"
  | "mouth"
  | "neck"
  | "wrap"
  | "rolled"
  | "faded";

export type TaskWear = {
  [Item in ClothingItem]?: Item extends "长裤" | "内裤"
    ? WearRole
    : Exclude<WearRole, "faded">;
};

export interface TaskNeeds {
  requireAll: OwnedItemId[];
  requireAny: OwnedItemId[][];
  recommend: OwnedItemId[];
  wear: TaskWear;
  lowerBare: boolean;
  fullyBare: boolean;
  kneeling: boolean;
  urine: boolean;
  photo: boolean;
  sound: boolean;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  baseScore: number;
  /** 显式需求优先；省略时兼容从文本推断，空对象表示无要求。 */
  needs?: Partial<TaskNeeds>;
  /** 任务涉及排尿/标记时的额外加分 1–3 */
  urineBonus?: number;
}

export interface ClimbingTask extends Task {
  targetFloor: number;
}

export interface MissionPlan {
  floorTasks: Record<number, Task[]>;
  climbingTasks: Record<number, Task>;
}

export interface Inventory {
  skip: number;
  restore: number;
  delayStrip: number;
  riskDouble: number;
}

export interface GameState {
  routeVersion: number;
  taskSource: TaskSource;
  runTaskPools: TaskPools | null;
  score: number;
  currentFloor: number;
  maxFloor: number;
  startingFloor: number;
  gamePhase: GamePhase;
  mode: GameMode;
  /** 开局选择的模式 */
  selectedMode: GameMode;
  /** 公狗 / 母狗，决定任务与结局文案 */
  persona: Persona;
  clothing: Record<ClothingItem, boolean>;
  currentTask: Task | null;
  /** 当前楼层待选择的任务，选择后清空。 */
  taskChoices: Task[];
  taskMessage: string | null;
  tasksCompleted: number;
  inventory: Inventory;
  assignedClimbingTask: ClimbingTask | null;
  hasBoughtRestore: boolean;
  hasBoughtRiskDouble: boolean;
  riskDoubleActive: boolean;
  /** 延迟剥夺衣物：下一层完成任务时强制触发一次剥夺衣物判定 */
  pendingDelayedStrip: boolean;
  urineMarks: number;
  hellTasksCompleted: number;
  progressStepsCompleted: number;
  /** 玩家实际拥有的实物（开局勾选，与商店穿戴分开） */
  owned: OwnedInventory;
  /** 出发前预抽的全程任务；旧存档可能为 null */
  missionPlan: MissionPlan | null;
  /** 结算时抽出的结局正文；0 分会含加罚任务，旧存档可能为 null */
  resolvedEnding: string | null;
  /** 商店阶段已重随积分次数，最多 2 */
  scoreRerollsUsed: number;
  taskReplacementsUsed: number;
  replacedTaskIds: string[];
}

export interface GameHistoryRecord {
  timestamp: string;
  finalScore: number;
  maxFloor: number;
  tasksCompleted: number;
  remainingClothes: number;
  ending: string;
  mode?: GameMode;
  persona?: Persona;
  hellTasksCompleted?: number;
  urineMarks?: number;
}

export type ShopItemType =
  | "clothing"
  | "skip"
  | "restore"
  | "delayStrip"
  | "riskDouble";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  required?: boolean;
  type: ShopItemType;
  clothingKey?: ClothingItem;
}

export interface ConfirmOptions {
  yesText?: string;
  noText?: string;
  showNoButton?: boolean;
}

export interface EndingDef {
  minScore: number;
  description: string;
}
