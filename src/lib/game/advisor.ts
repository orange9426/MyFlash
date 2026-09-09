import {
  CLOTHING_ITEMS,
  createDefaultOwnedInventory,
  getClimbingDecisionFloors,
  getClimbingTargetMap,
  getDisplayFloor,
  getEnding,
  getEndings,
  getTasks,
  sanitizeClothing,
  STRIPPABLE_CLOTHING_ITEMS,
} from "./constants";
import type {
  ClothingItem,
  GameMode,
  GameState,
  ItemImportance,
  MissionPlan,
  OwnedInventory,
  OwnedItemId,
  Persona,
  Task,
} from "./types";

export type WearRole =
  | "on"
  | "off"
  | "mouth"
  | "neck"
  | "wrap"
  | "rolled";

export interface TaskNeeds {
  requireAll: OwnedItemId[];
  requireAny: OwnedItemId[][];
  recommend: OwnedItemId[];
  wear: Partial<Record<ClothingItem, WearRole>>;
  lowerBare: boolean;
  fullyBare: boolean;
  kneeOnly: boolean;
  kneeling: boolean;
  urine: boolean;
  photo: boolean;
  sound: boolean;
}

export interface OwnedItemDef {
  id: OwnedItemId;
  name: string;
  group: "wear" | "extra";
  importance: ItemImportance;
  hint: string;
}

export const OWNED_ITEM_DEFS: OwnedItemDef[] = [
  {
    id: "长裤",
    name: "长裤",
    group: "wear",
    importance: "required",
    hint: "出门必须穿，商店会自动购入",
  },
  {
    id: "内裤",
    name: "内裤",
    group: "wear",
    importance: "required",
    hint: "叼嘴、垫地、包住、塞口都会用到，必须带上；出门不必穿",
  },
  {
    id: "短袜",
    name: "短袜",
    group: "wear",
    importance: "required",
    hint: "舔袜、套头、堵嘴、绑手都会用到，必须带上；出门不必穿",
  },
  {
    id: "上衣",
    name: "上衣",
    group: "wear",
    importance: "optional",
    hint: "遮挡用，穿上会降低暴露加分",
  },
  {
    id: "护膝",
    name: "护膝",
    group: "wear",
    importance: "recommended",
    hint: "跪爬任务很多，建议戴，但没有也能做",
  },
];

type NeedFlag =
  | "sock"
  | "brief"
  | "brief|sock"
  | "pants"
  | "shirt"
  | "knee"
  | "knee!"
  | "lower"
  | "bare"
  | "kneel"
  | "urine"
  | "photo"
  | "sound"
  | "mouthBrief"
  | "mouthSock"
  | "mouthAny"
  | "neckPants"
  | "wrapSock"
  | "rollShirt"
  | "sockOn"
  | "sockOff"
  | "kneeOnly";

function emptyNeeds(): TaskNeeds {
  return {
    requireAll: [],
    requireAny: [],
    recommend: [],
    wear: {},
    lowerBare: false,
    fullyBare: false,
    kneeOnly: false,
    kneeling: false,
    urine: false,
    photo: false,
    sound: false,
  };
}

function uniq<T>(list: T[]): T[] {
  return [...new Set(list)];
}

function needs(...flags: NeedFlag[]): TaskNeeds {
  const n = emptyNeeds();
  for (const f of flags) {
    switch (f) {
      case "sock":
        n.requireAll.push("短袜");
        break;
      case "brief":
        n.requireAll.push("内裤");
        break;
      case "brief|sock":
        n.requireAny.push(["内裤", "短袜"]);
        break;
      case "pants":
        n.requireAll.push("长裤");
        break;
      case "shirt":
        n.recommend.push("上衣");
        break;
      case "knee":
        n.recommend.push("护膝");
        break;
      case "knee!":
        n.requireAll.push("护膝");
        n.recommend.push("护膝");
        n.wear.护膝 = "on";
        break;
      case "lower":
        n.lowerBare = true;
        n.wear.长裤 = "off";
        n.wear.内裤 = "off";
        break;
      case "bare":
        n.fullyBare = true;
        n.wear.上衣 = "off";
        n.wear.长裤 = "off";
        n.wear.内裤 = "off";
        n.wear.短袜 = "off";
        break;
      case "kneel":
        n.kneeling = true;
        n.recommend.push("护膝");
        break;
      case "urine":
        n.urine = true;
        break;
      case "photo":
        n.photo = true;
        break;
      case "sound":
        n.sound = true;
        break;
      case "mouthBrief":
        n.requireAll.push("内裤");
        n.wear.内裤 = "mouth";
        break;
      case "mouthSock":
        n.requireAll.push("短袜");
        n.wear.短袜 = "mouth";
        break;
      case "mouthAny":
        n.requireAny.push(["内裤", "短袜"]);
        break;
      case "neckPants":
        n.requireAll.push("长裤");
        n.wear.长裤 = "neck";
        break;
      case "wrapSock":
        n.requireAll.push("短袜");
        n.wear.短袜 = "wrap";
        break;
      case "rollShirt":
        n.wear.上衣 = "rolled";
        break;
      case "sockOn":
        n.wear.短袜 = "on";
        n.requireAll.push("短袜");
        break;
      case "sockOff":
        n.wear.短袜 = "off";
        break;
      case "kneeOnly":
        n.kneeOnly = true;
        n.requireAll.push("护膝");
        n.wear.护膝 = "on";
        n.wear.上衣 = "off";
        n.wear.长裤 = "off";
        n.wear.内裤 = "off";
        n.wear.短袜 = "off";
        break;
    }
  }
  n.requireAll = uniq(n.requireAll);
  n.recommend = uniq(n.recommend);
  return n;
}

const TASK_NEEDS: Record<string, TaskNeeds> = {
  A1: needs("sock", "wrapSock"),
  A2: needs(),
  A3: needs("mouthBrief"),
  A4: needs("wrapSock"),
  A5: needs("rollShirt"),
  A6: needs("kneel", "lower"),
  A7: needs("lower"),
  A8: needs("wrapSock"),
  A9: needs("kneel"),
  A11: needs("lower"),
  A12: needs("lower"),
  A13: needs("urine", "lower"),
  A14: needs("sock", "urine"),
  A15: needs("urine", "lower"),
  A16: needs("urine", "kneel"),
  A17: needs("sound"),
  A18: needs("kneel", "sound"),
  A19: needs(),
  A20: needs("sound"),
  A21: needs("mouthBrief"),
  A22: needs("sock", "kneel"),
  A23: needs("kneeOnly", "kneel"),
  A24: needs("bare"),
  A25: needs("photo", "kneel", "lower"),
  A26: needs("photo"),
  A27: needs("photo", "lower"),
  A28: needs("photo", "sound"),
  A29: needs("brief|sock"),
  A30: needs(),
  A31: needs("brief"),
  A32: needs(),
  A33: needs("rollShirt"),
  A34: needs("brief"),
  A35: needs("lower"),

  B1: needs("brief", "kneel"),
  B2: needs("lower"),
  B3: needs("lower"),
  B4: needs("brief", "lower"),
  B5: needs("neckPants", "lower"),
  B6: needs("lower", "kneel"),
  B7: needs("lower"),
  B8: needs("lower"),
  B9: needs("lower"),
  B10: needs("kneel", "lower"),
  B11: needs("urine", "lower"),
  B12: needs("urine"),
  B13: needs("brief", "urine"),
  B14: needs("urine"),
  B16: needs("photo", "lower"),
  B17: needs("brief", "photo"),
  B19: needs("photo"),
  B20: needs(),
  B21: needs(),
  B22: needs("rollShirt"),
  B23: needs("mouthSock", "kneel"),
  B24: needs("kneeOnly", "kneel"),
  B25: needs("lower"),
  B26: needs("lower"),
  B27: needs("photo"),
  B29: needs(),
  B30: needs(),
  B31: needs("sound"),
  B32: needs("brief", "kneel", "lower"),
  B34: needs(),
  B35: needs("bare"),
  B36: needs("lower"),
  B37: needs("rollShirt"),
  B38: needs("lower", "kneel"),

  C1: needs("photo", "lower", "kneel"),
  C2: needs("sockOn", "lower"),
  C3: needs("kneel", "lower"),
  C4: needs(),
  C5: needs("sockOff"),
  C6: needs("photo", "bare"),
  C7: needs("bare", "kneel"),
  C8: needs("lower"),
  C9: needs("rollShirt", "lower"),
  C10: needs("bare"),
  C11: needs("urine", "photo", "lower"),
  C12: needs("urine"),
  C13: needs("urine"),
  C14: needs("urine"),
  C16: needs("photo", "urine", "bare"),
  C17: needs("photo", "bare"),
  C18: needs("sound"),
  C20: needs(),
  C21: needs(),
  C22: needs("kneel"),
  C23: needs("mouthAny", "lower", "kneel"),
  C25: needs("urine"),
  C26: needs("lower"),
  C27: needs("lower"),
  C28: needs("photo"),
  C29: needs(),
  C30: needs(),
  C31: needs("sound"),
  C32: needs("sockOn", "kneel", "lower"),
  C33: needs("bare"),
  C34: needs(),
  C35: needs("bare"),
  C36: needs("bare"),
  C38: needs("urine"),
  C39: needs("kneel"),
  C40: needs("bare"),
  C41: needs(),
  C42: needs("kneel", "bare"),

  U1: needs("sockOn", "kneel", "lower"),
  U2: needs("kneel", "knee"),
  U3: needs("mouthBrief", "lower"),
  U4: needs("neckPants", "bare"),
  U5: needs(),
  U6: needs("sockOff", "lower"),
  U7: needs("bare", "kneel"),
  U8: needs("urine"),
  U9: needs("mouthAny"),
  U11: needs("urine"),
  U12: needs("photo"),
  U14: needs("sound"),
  U15: needs("lower"),
  U16: needs("bare"),
  U17: needs("kneel"),
  U18: needs(),
  U19: needs("urine"),
  U20: needs(),
  U22: needs("wrapSock"),
  U23: needs("rollShirt", "lower"),
  U28: needs(),
  U29: needs("bare"),
  U30: needs(),
  U31: needs("rollShirt"),

  H1: needs("lower"),
  H2: needs("lower"),
  H3: needs("kneel", "bare"),
  H5: needs("urine", "photo"),
  H6: needs("photo", "bare"),
  H7: needs("photo", "bare"),
  H8: needs("kneel", "bare"),
  H10: needs("bare"),
  H11: needs("urine"),
  H13: needs("bare"),
  H14: needs("lower"),
  H15: needs(),
  H16: needs("mouthAny", "kneel", "bare"),
  H17: needs("bare"),
  H18: needs("urine"),
  H19: needs("bare"),
  H20: needs("photo"),
  H21: needs("bare"),
  H22: needs("kneel", "bare"),
  H24: needs("urine", "photo", "bare"),
  H25: needs("photo", "bare"),
};

function inferNeedsFromText(task: Task): NeedFlag[] {
  const text = `${task.name}${task.description}`;
  const flags: NeedFlag[] = [];
  if (/短袜/.test(text)) flags.push("sock");
  if (/内裤/.test(text)) flags.push("brief");
  if (/护膝/.test(text)) flags.push("knee");
  if (/跪|爬|狗姿/.test(text)) flags.push("kneel");
  if (/全裸/.test(text)) flags.push("bare");
  else if (/下半身|露逼|掰开逼|掰穴/.test(text)) flags.push("lower");
  if (/尿/.test(text) || (task.urineBonus ?? 0) > 0) flags.push("urine");
  if (/拍|视频|倒计时|免提|录制/.test(text)) flags.push("photo");
  if (/狗叫|娇喘|大声/.test(text)) flags.push("sound");
  return flags;
}

export function getTaskNeeds(task: Task): TaskNeeds {
  const mapped = TASK_NEEDS[task.id];
  const n = mapped ? { ...mapped, wear: { ...mapped.wear }, requireAll: [...mapped.requireAll], requireAny: mapped.requireAny.map((g) => [...g]), recommend: [...mapped.recommend] } : needs(...inferNeedsFromText(task));
  if ((task.urineBonus ?? 0) > 0) {
    n.urine = true;
  }
  return n;
}

export function missingRequiredItems(needs: TaskNeeds, owned: OwnedInventory): OwnedItemId[] {
  const missing: OwnedItemId[] = needs.requireAll.filter((id) => !owned[id]);
  for (const group of needs.requireAny) {
    if (!group.some((id) => owned[id])) missing.push(group[0]);
  }
  return uniq(missing);
}

export function missingRecommendedItems(needs: TaskNeeds, owned: OwnedInventory): OwnedItemId[] {
  return needs.recommend.filter((id) => !owned[id]);
}

function pickBestTask(pool: Task[], owned: OwnedInventory, used: Set<string>): Task {
  const unused = pool.filter((t) => !used.has(t.id));
  const source = unused.length > 0 ? unused : pool;
  const feasible = source.filter(
    (task) => missingRequiredItems(getTaskNeeds(task), owned).length === 0,
  );
  // 只在你有的东西里抽；池子被滤空时才退回（几乎不会发生）
  const pickFrom = feasible.length > 0 ? feasible : source;
  let bestScore = Infinity;
  const best: Task[] = [];
  for (const task of pickFrom) {
    const n = getTaskNeeds(task);
    const missRec = missingRecommendedItems(n, owned).length;
    if (missRec < bestScore) {
      bestScore = missRec;
      best.length = 0;
      best.push(task);
    } else if (missRec === bestScore) {
      best.push(task);
    }
  }
  return best[Math.floor(Math.random() * best.length)] ?? pool[0];
}

export function generateMissionPlan(
  mode: GameMode,
  owned: OwnedInventory,
  persona: Persona = "male",
): MissionPlan {
  const used = new Set<string>();
  const pools = getTasks(persona);
  const pick = (pool: Task[], count: number): Task[] => {
    const result: Task[] = [];
    for (let i = 0; i < count; i++) {
      const task = pickBestTask(pool, owned, used);
      used.add(task.id);
      result.push(task);
    }
    return result;
  };

  const floorTasks: Record<number, Task[]> = {
    1: pick(pools.A, 1),
    2: pick(pools.A, 1),
    4: pick(pools.B, 1),
    5: pick(pools.B, 1),
    7: pick(pools.C, 1),
    8: pick(pools.C, 2),
  };

  const climbingTasks: Record<number, Task> = {};
  for (const floor of getClimbingDecisionFloors(mode)) {
    climbingTasks[floor] = pick(pools["上楼任务"], 1)[0];
  }

  if (mode === "hell") {
    floorTasks[9] = pick(pools.H, 1);
    floorTasks[11] = pick(pools.H, 1);
  }

  return { floorTasks, climbingTasks };
}

export function getPlannedFloorTask(
  plan: MissionPlan,
  floor: number,
  eighthFloorFirstTaskCompleted: boolean,
): Task | null {
  const list = plan.floorTasks[floor];
  if (!list || list.length === 0) return null;
  if (floor === 8) {
    const index = eighthFloorFirstTaskCompleted ? 1 : 0;
    return list[index] ?? list[0];
  }
  return list[0];
}

export function getPlannedClimbingTask(plan: MissionPlan, floor: number): Task | null {
  return plan.climbingTasks[floor] ?? null;
}

export interface ItineraryStep {
  key: string;
  kind: "floor" | "climb";
  internalFloor: number;
  displayFloor: number;
  phaseLabel: string;
  task: Task;
  indexInFloor?: number;
}

export function buildItinerary(
  plan: MissionPlan,
  mode: GameMode,
  startingFloor: number,
): ItineraryStep[] {
  const steps: ItineraryStep[] = [];
  const targetMap = getClimbingTargetMap(mode);
  const climbFloors = getClimbingDecisionFloors(mode);

  const pushFloor = (floor: number, phaseLabel: string) => {
    const list = plan.floorTasks[floor] ?? [];
    list.forEach((task, i) => {
      steps.push({
        key: `f-${floor}-${i}`,
        kind: "floor",
        internalFloor: floor,
        displayFloor: getDisplayFloor(floor, startingFloor),
        phaseLabel: list.length > 1 ? `${phaseLabel} · ${i + 1}/${list.length}` : phaseLabel,
        task,
        indexInFloor: i,
      });
    });
  };

  const pushClimb = (floor: number) => {
    const task = plan.climbingTasks[floor];
    if (!task) return;
    const target = targetMap[floor];
    steps.push({
      key: `c-${floor}`,
      kind: "climb",
      internalFloor: floor,
      displayFloor: getDisplayFloor(floor, startingFloor),
      phaseLabel: `上楼 ${getDisplayFloor(floor, startingFloor)}→${getDisplayFloor(target, startingFloor)}`,
      task,
    });
  };

  pushFloor(1, "阶段 A");
  pushFloor(2, "阶段 A");
  if (climbFloors.includes(2)) pushClimb(2);
  pushFloor(4, "阶段 B");
  pushFloor(5, "阶段 B");
  if (climbFloors.includes(5)) pushClimb(5);
  pushFloor(7, "阶段 C");
  pushFloor(8, "阶段 C");
  if (climbFloors.includes(8)) pushClimb(8);
  if (mode === "hell") {
    pushFloor(9, "地狱");
    if (climbFloors.includes(10)) pushClimb(10);
    pushFloor(11, "地狱");
  }
  return steps;
}

export interface PackingItem {
  id: string;
  name: string;
  where: "wear" | "bag";
  reason: string;
  importance: ItemImportance;
  missing: boolean;
}

export interface PackingAdvice {
  wear: PackingItem[];
  bag: PackingItem[];
  missing: PackingItem[];
  notes: string[];
}

const ITEM_NAME: Record<string, string> = Object.fromEntries(
  OWNED_ITEM_DEFS.map((d) => [d.id, d.name]),
);

function defOf(id: string): OwnedItemDef | undefined {
  return OWNED_ITEM_DEFS.find((d) => d.id === id);
}

export function getPackingAdvice(
  plan: MissionPlan,
  owned: OwnedInventory,
  clothing: Record<ClothingItem, boolean>,
  mode: GameMode,
  startingFloor: number,
): PackingAdvice {
  const itinerary = buildItinerary(plan, mode, startingFloor);
  const requiredCounts = new Map<OwnedItemId, number>();
  const recommendCounts = new Map<OwnedItemId, number>();
  let photoTasks = 0;
  let kneelTasks = 0;

  const bump = (map: Map<OwnedItemId, number>, id: OwnedItemId) => {
    map.set(id, (map.get(id) ?? 0) + 1);
  };

  for (const step of itinerary) {
    const n = getTaskNeeds(step.task);
    for (const id of n.requireAll) bump(requiredCounts, id);
    for (const group of n.requireAny) {
      const ownedOne = group.find((id) => owned[id]);
      bump(requiredCounts, ownedOne ?? group[0]);
    }
    for (const id of n.recommend) bump(recommendCounts, id);
    if (n.photo) photoTasks += 1;
    if (n.kneeling) kneelTasks += 1;
  }

  const wear: PackingItem[] = [];
  const bag: PackingItem[] = [];
  const missing: PackingItem[] = [];

  for (const item of CLOTHING_ITEMS) {
    if (clothing[item]) {
      wear.push({
        id: item,
        name: ITEM_NAME[item] ?? item,
        where: "wear",
        reason: item === "长裤" ? "出门必须穿着" : "出发时穿着",
        importance: defOf(item)?.importance ?? "optional",
        missing: false,
      });
    }
  }

  const consider = (
    id: OwnedItemId,
    count: number,
    importance: ItemImportance,
    required: boolean,
  ) => {
    if (count <= 0) return;
    if (id === "长裤" || ((CLOTHING_ITEMS as string[]).includes(id) && clothing[id as ClothingItem])) {
      return;
    }
    const row: PackingItem = {
      id,
      name: ITEM_NAME[id] ?? id,
      where: "bag",
      reason: required ? "路上会用到" : "带上更轻松",
      importance,
      missing: required && !owned[id],
    };
    if (row.missing) missing.push(row);
    else if (owned[id]) bag.push(row);
  };

  for (const [id, count] of requiredCounts) {
    const importance = defOf(id)?.importance ?? "strongly_recommended";
    consider(id, count, importance, true);
  }
  for (const [id, count] of recommendCounts) {
    if (requiredCounts.has(id)) continue;
    consider(id, count, defOf(id)?.importance ?? "recommended", false);
  }

  const notes: string[] = [];
  if (photoTasks > 0) {
    notes.push("出门前给手机充满电，并留足存储。");
  }
  if (kneelTasks > 0 && owned.护膝) {
    notes.push("护膝建议出门就戴上。");
  }
  notes.push("没穿在身上的衣物请放包里。");

  return { wear, bag, missing, notes };
}

export interface WearInstruction {
  item: ClothingItem;
  verb: string;
  detail?: string;
  tone: "action" | "keep" | "missing" | "prop";
}

export interface WearAdvice {
  summary: string;
  items: WearInstruction[];
  extras: string[];
  targetClothing: Record<ClothingItem, boolean>;
}

export function wearActionItems(advice: WearAdvice | null): WearInstruction[] {
  return advice?.items.filter((i) => i.tone === "action" || i.tone === "prop" || i.tone === "missing") ?? [];
}

export function wearActionLabel(item: WearInstruction): string {
  if (item.tone === "missing") return item.verb;
  if (item.verb === "脱下" || item.verb === "穿上" || item.verb === "保持穿着" || item.verb === "保持不穿") {
    return `${item.verb}${item.item}`;
  }
  return `${item.item} · ${item.verb}`;
}

/** 按当前穿着改写任务原文：没穿就不要写「脱下的」。 */
export function resolveTaskDescription(
  description: string,
  clothing: Record<ClothingItem, boolean>,
): string {
  let text = description;

  if (!clothing.短袜) {
    text = text
      .replaceAll("刚脱下的短袜", "短袜")
      .replaceAll("把脱下的短袜", "把短袜")
      .replaceAll("脱下的短袜", "短袜")
      .replaceAll("脱下一只短袜", "拿出一只短袜")
      .replaceAll("穿短袜原地", "穿上短袜原地")
      .replaceAll("穿短袜，", "穿上短袜，");
  }

  if (!clothing.内裤) {
    text = text
      .replaceAll("刚脱下的内裤", "内裤")
      .replaceAll("将内裤脱下后叼", "把内裤叼")
      .replaceAll("将内裤脱下叼", "把内裤叼")
      .replaceAll("内裤脱下后叼", "把内裤叼")
      .replaceAll("内裤脱下后", "用内裤")
      .replaceAll("把内裤脱下，", "拿出内裤，")
      .replaceAll("把内裤脱下", "拿出内裤")
      .replaceAll("脱下内裤", "拿出内裤")
      .replaceAll("「脱内裤→撸20下→再穿上」", "「穿上内裤→撸20下→再脱下」")
      .replaceAll("「脱内裤→揉20下→再穿上」", "「穿上内裤→揉20下→再脱下」")
      .replaceAll("把内裤脱到脚踝，再提起来", "把内裤在腰间和脚踝间反复穿脱");
  }

  if (!clothing.内裤 && !clothing.短袜) {
    text = text.replaceAll("刚脱下的内裤或短袜", "内裤或短袜");
  } else if (!clothing.内裤) {
    text = text.replaceAll("刚脱下的内裤或短袜", "内裤或短袜");
  } else if (!clothing.短袜) {
    text = text.replaceAll("刚脱下的内裤或短袜", "内裤或短袜");
  }

  if (!clothing.上衣) {
    text = text
      .replaceAll("（如有上衣，上衣卷起）", "")
      .replaceAll("上衣完全卷到腋下，", "")
      .replaceAll("上衣卷起，", "");
  }

  if (!clothing.长裤) {
    text = text.replaceAll("长裤挂在脖子上", "把长裤挂在脖子上");
  }

  text = text.replaceAll("把脱下的所有衣物", "把所有衣物");
  text = text.replaceAll("上衣卷起，", clothing.上衣 ? "上衣卷起，" : "");

  return text.replace(/\s+/g, " ").trim();
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function pickClothing(
  options: ClothingItem[],
  clothing: Record<ClothingItem, boolean>,
  owned: OwnedInventory,
): ClothingItem {
  const worn = options.filter((item) => clothing[item]);
  if (worn.length) return pickOne(worn);
  const have = options.filter((item) => owned[item]);
  if (have.length) return pickOne(have);
  return pickOne(options);
}

/** 把「随机 / 二选一 / 规则说明」抽成一条可执行指令；已具体化的原文不会重抽。 */
export function concretizeDescription(
  id: string,
  description: string,
  clothing: Record<ClothingItem, boolean>,
  owned: OwnedInventory,
): string {
  let text = description;

  if (id === "U12" && /随机脱衣|额外惩罚|严格时间限制/.test(text)) {
    const seconds = pickOne([60, 90, 120]);
    const worn = STRIPPABLE_CLOTHING_ITEMS.filter((item) => clothing[item]);
    text = worn.length
      ? `限时${seconds}s爬完两层。超时脱掉${pickOne(worn)}。`
      : `限时${seconds}s爬完两层。超时罚跪30s。`;
  }

  text = text.replace(
    "完全赤裸（含短袜也可脱）",
    clothing.短袜 ? "完全赤裸，连短袜一起脱，" : "完全赤裸，",
  );
  text = text.replace(
    /可自由选择爬or走。?/,
    () => pickOne(["全程爬着上去。", "全程走上去。"]),
  );
  if (text.includes("嘴里塞着衣物")) {
    text = text.replace(
      "嘴里塞着衣物",
      `嘴里塞着${pickClothing(["内裤", "短袜"], clothing, owned)}`,
    );
  }
  text = text.replace("（制造被拍风险感）", "");
  text = text.replace(
    "（如有上衣，上衣卷起）",
    clothing.上衣 ? "上衣卷起，" : "",
  );

  if (text.includes("打开楼道窗（若有）或对着通风口")) {
    text = text.replace(
      "打开楼道窗（若有）或对着通风口",
      pickOne(["打开楼道窗", "对着通风口"]),
    );
  }
  if (text.includes("仅穿短袜或全裸")) {
    const choice =
      clothing.短袜 || owned.短袜 ? pickOne(["仅穿短袜", "全裸"] as const) : "全裸";
    text = text.replace("仅穿短袜或全裸", choice);
  }
  if (text.includes("内裤或短袜")) {
    text = text.replaceAll(
      "内裤或短袜",
      pickClothing(["内裤", "短袜"], clothing, owned),
    );
  }
  if (text.includes("用手或衣物")) {
    const cloth = pickClothing(
      ["内裤", "短袜", "上衣", "长裤"],
      clothing,
      owned,
    );
    text = text.replace("用手或衣物", pickOne(["用手", `用${cloth}`]));
  }

  const pairs: [string, string[]][] = [
    ["袜面或袜趾", ["袜面", "袜趾"]],
    ["乳头或鸡巴", ["乳头", "鸡巴"]],
    ["乳头或阴蒂", ["乳头", "阴蒂"]],
    ["站立或跪姿", ["站立", "跪姿"]],
    ["尿液或前列腺液", ["尿液", "前列腺液"]],
    ["尿液或淫水", ["尿液", "淫水"]],
    ["脸上或胸口", ["脸上", "胸口"]],
    ["楼梯下方或转角", ["楼梯下方", "转角"]],
    ["全裸或半裸", ["全裸", "半裸"]],
    ["扶手或墙面", ["扶手", "墙面"]],
    ["电梯厅角落或垃圾桶旁", ["电梯厅角落", "垃圾桶旁"]],
  ];
  for (const [pattern, options] of pairs) {
    if (text.includes(pattern)) {
      text = text.replaceAll(pattern, pickOne(options));
    }
  }

  return text.replace(/\s+/g, " ").trim();
}

export function concretizeTask<T extends Task>(
  task: T,
  clothing: Record<ClothingItem, boolean>,
  owned: OwnedInventory,
): T {
  return {
    ...task,
    description: concretizeDescription(task.id, task.description, clothing, owned),
  };
}

function pickOwnedCTask(owned: OwnedInventory, persona: Persona = "male"): Task {
  const poolC = getTasks(persona).C;
  const feasible = poolC.filter(
    (task) => missingRequiredItems(getTaskNeeds(task), owned).length === 0,
  );
  const pool = feasible.length > 0 ? feasible : poolC;
  return pickOne(pool);
}

/** 结算展示用：0 分当场抽出加罚任务，并落到 1–9 分那档的具体正文。 */
export function resolveEnding(state: GameState): string {
  const persona = state.persona === "female" ? "female" : "male";
  if (state.mode === "normal" && state.score <= 0) {
    const extra = concretizeTask(pickOwnedCTask(state.owned, persona), state.clothing, state.owned);
    const desc = resolveTaskDescription(extra.description, state.clothing);
    const follow =
      getEndings("normal", persona).find((ending) => ending.minScore === 1)?.description ??
      (persona === "female"
        ? "不准高潮，裸体罚跪至少15分钟，内裤勒进逼缝走回家，短袜塞嘴里"
        : "不准射，裸体罚跪至少15分钟，戴贞操锁3天，短袜塞嘴里回家");
    return `当场再做：${extra.name}\n${desc}\n\n${follow}`;
  }
  return getEnding(state.score, state.mode, persona);
}

const ROLE_VERB: Record<WearRole, { on: string; off: string; keepOn: string; keepOff: string }> = {
  on: { on: "穿上", off: "保持不穿", keepOn: "保持穿着", keepOff: "穿上" },
  off: { on: "脱下", off: "保持不穿", keepOn: "脱下", keepOff: "保持不穿" },
  mouth: { on: "脱下叼在嘴里", off: "拿出叼在嘴里", keepOn: "脱下叼在嘴里", keepOff: "拿出叼在嘴里" },
  neck: { on: "脱下挂在脖子上", off: "拿出挂在脖子上", keepOn: "脱下挂在脖子上", keepOff: "拿出挂在脖子上" },
  wrap: { on: "脱下作为道具", off: "拿出作为道具", keepOn: "脱下作为道具", keepOff: "拿出作为道具" },
  rolled: { on: "卷起到腋下", off: "没有上衣可跳过", keepOn: "上衣卷起到腋下", keepOff: "没有上衣可跳过" },
};

function roleOnBody(role: WearRole): boolean {
  return role === "on" || role === "rolled";
}

export function getTargetClothing(
  task: Task | null,
  clothing: Record<ClothingItem, boolean>,
  owned: OwnedInventory,
): Record<ClothingItem, boolean> {
  const next = sanitizeClothing(clothing);
  if (!task) return next;
  const n = getTaskNeeds(task);

  if (n.kneeOnly) {
    for (const item of CLOTHING_ITEMS) next[item] = item === "护膝" && owned.护膝;
    return next;
  }
  if (n.fullyBare) {
    next.上衣 = false;
    next.长裤 = false;
    next.内裤 = false;
    next.短袜 = false;
  } else if (n.lowerBare) {
    next.长裤 = false;
    next.内裤 = false;
  }

  for (const [key, role] of Object.entries(n.wear) as [ClothingItem, WearRole][]) {
    if (role === "rolled") {
      next[key] = clothing[key];
      continue;
    }
    if (roleOnBody(role)) {
      next[key] = owned[key] !== false && (key === "护膝" ? owned.护膝 || clothing.护膝 : true);
      if (key === "护膝") next.护膝 = owned.护膝 || clothing.护膝;
      else if (role === "on") next[key] = owned[key] || clothing[key];
    } else {
      next[key] = false;
    }
  }

  if (n.kneeling && (owned.护膝 || clothing.护膝)) {
    next.护膝 = true;
  }
  return next;
}

export function getWearAdvice(
  task: Task | null,
  clothing: Record<ClothingItem, boolean>,
  owned: OwnedInventory,
): WearAdvice | null {
  if (!task) return null;
  clothing = sanitizeClothing(clothing);
  const n = getTaskNeeds(task);
  const target = getTargetClothing(task, clothing, owned);
  const items: WearInstruction[] = [];
  const extras: string[] = [];

  const pushWear = (item: ClothingItem, role: WearRole) => {
    const currentlyOn = !!clothing[item];
    const has = owned[item] || currentlyOn;
    const verbs = ROLE_VERB[role];
    if (!has && (role === "on" || role === "mouth" || role === "neck" || role === "wrap")) {
      items.push({
        item,
        verb: `缺少${item}`,
        detail: role === "mouth" ? "可用另一件衣物代替或跳过" : "按任务描述变通，或跳过",
        tone: "missing",
      });
      return;
    }
    let verb: string;
    if (role === "mouth" || role === "neck" || role === "wrap") {
      verb = currentlyOn ? verbs.on : verbs.off;
    } else if (role === "rolled") {
      verb = currentlyOn ? verbs.keepOn : verbs.keepOff;
    } else if (role === "on") {
      verb = currentlyOn ? verbs.keepOn : verbs.keepOff;
    } else {
      verb = currentlyOn ? verbs.on : verbs.off;
    }
    let tone: WearInstruction["tone"];
    if (role === "mouth" || role === "neck" || role === "wrap") {
      tone = "prop";
    } else if (role === "rolled") {
      tone = currentlyOn ? "action" : "keep";
    } else if (currentlyOn === roleOnBody(role)) {
      tone = "keep";
    } else {
      tone = "action";
    }
    items.push({
      item,
      verb,
      tone,
    });
  };

  if (n.kneeOnly) {
    pushWear("护膝", "on");
    for (const item of ["上衣", "长裤", "内裤", "短袜"] as ClothingItem[]) {
      if (clothing[item]) pushWear(item, "off");
    }
  } else {
    const seen = new Set<ClothingItem>();
    for (const [key, role] of Object.entries(n.wear) as [ClothingItem, WearRole][]) {
      if (!CLOTHING_ITEMS.includes(key)) continue;
      seen.add(key);
      pushWear(key, role);
    }
    if (n.fullyBare) {
      for (const item of ["上衣", "长裤", "内裤", "短袜"] as ClothingItem[]) {
        if (!seen.has(item)) pushWear(item, "off");
      }
    } else if (n.lowerBare) {
      for (const item of ["长裤", "内裤"] as ClothingItem[]) {
        if (!seen.has(item)) pushWear(item, "off");
      }
    }
    if (n.kneeling && !seen.has("护膝")) {
      if (owned.护膝 || clothing.护膝) pushWear("护膝", "on");
      else extras.push("跪爬任务，没有护膝也行，注意护住膝盖。");
    }
  }

  if (n.wear.内裤 === undefined && n.requireAny.some((g) => g.includes("内裤") && g.includes("短袜"))) {
    extras.push("口塞可用内裤或短袜，有哪件用哪件。");
  }

  const miss = missingRequiredItems(n, owned);
  for (const id of miss) {
    if (!items.some((i) => i.item === id)) {
      extras.push(`缺少${ITEM_NAME[id] ?? id}，本任务会很难按原文完成。`);
    }
  }

  if (n.photo) extras.push("需要手机：拍照、录像或倒计时。");
  if (n.sound) extras.push("需要出声，先听楼道里有没有人。");

  const actionBits = items
    .filter((i) => i.tone === "action" || i.tone === "prop" || i.tone === "missing")
    .map((i) => i.verb);
  const summary = actionBits.length > 0
    ? actionBits.join("；")
    : n.fullyBare
      ? "保持全裸完成"
      : n.lowerBare
        ? "保持下半身裸露完成"
        : "按当前穿着完成";

  return { summary, items, extras, targetClothing: target };
}

export function normalizeOwnedInventory(raw: unknown): OwnedInventory {
  const override: Partial<OwnedInventory> = {};
  if (raw && typeof raw === "object") {
    const data = raw as Partial<OwnedInventory>;
    for (const def of OWNED_ITEM_DEFS) {
      if (typeof data[def.id] === "boolean") override[def.id] = data[def.id];
    }
  }
  return createDefaultOwnedInventory(override);
}

export function normalizeMissionPlan(raw: unknown): MissionPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<MissionPlan>;
  if (!data.floorTasks || typeof data.floorTasks !== "object") return null;
  if (!data.climbingTasks || typeof data.climbingTasks !== "object") return null;

  const isTask = (v: unknown): v is Task =>
    !!v && typeof v === "object" && typeof (v as Task).id === "string" && typeof (v as Task).name === "string";

  const floorTasks: Record<number, Task[]> = {};
  for (const [key, value] of Object.entries(data.floorTasks)) {
    const floor = Number(key);
    if (!Number.isFinite(floor) || !Array.isArray(value)) continue;
    const list = value.filter(isTask);
    if (list.length > 0) floorTasks[floor] = list;
  }
  const climbingTasks: Record<number, Task> = {};
  for (const [key, value] of Object.entries(data.climbingTasks)) {
    const floor = Number(key);
    if (!Number.isFinite(floor) || !isTask(value)) continue;
    climbingTasks[floor] = value;
  }
  if (Object.keys(floorTasks).length === 0) return null;
  return { floorTasks, climbingTasks };
}
