import { selectTaskPools } from "./tasks";
import { supportsWear } from "./taskVariables";
import type { TaskPools } from "./tasks/schema";
import type { ClothingItem, GameMode, Persona, Task, TaskNeeds, TaskVariable, WearRole } from "./types";

export type TaskSource = "builtin" | "custom";
export interface TaskPack {
  format: "myflash-task-pack";
  version: 1;
  id: string;
  name: string;
  persona: Persona;
  mode: GameMode;
  type: "floor" | "climb";
  tasks: Task[];
}

export const PACKS_KEY = "myflashCustomPacksV1";
export const DRAFT_KEY = "myflashTaskEditorDraftV1";
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const EDITOR_ITEMS: ClothingItem[] = ["上衣", "长裤", "内裤", "短袜", "鞋子"];
export const WEAR_LABELS: Record<WearRole, string> = {
  on: "穿上", off: "脱下", mouth: "作为口部道具", neck: "挂在脖子上",
  wrap: "作为道具使用", rolled: "卷起上衣", faded: "褪到膝盖",
};
export const NEED_FLAGS = {
  fullyBare: "全部装备移除", lowerBare: "下装移除", kneeling: "跪姿标记",
  photo: "拍照／计时标记", sound: "声音标记", urine: "特殊事件标记",
} as const;

export function customId(prefix = "custom"): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
}
export function newTask(): Task {
  return { id: customId(), name: "", description: "", baseScore: 2, needs: {} };
}
export function newTaskPack(): TaskPack {
  return { format: "myflash-task-pack", version: 1, id: customId("pack"), name: "我的任务包", persona: "male", mode: "normal", type: "floor", tasks: [] };
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}格式错误`);
  return value as Record<string, unknown>;
}
function string(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`${label}须为 1–${max} 个字符`);
  return value;
}
function number(value: unknown, label: string, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > max) throw new Error(`${label}须为 0–${max} 的整数`);
  return value;
}
function items(value: unknown, label: string): ClothingItem[] {
  if (!Array.isArray(value) || value.some(item => !EDITOR_ITEMS.includes(item))) throw new Error(`${label}包含不支持的装备`);
  return [...new Set(value)] as ClothingItem[];
}
function validateNeeds(value: unknown): Partial<TaskNeeds> {
  const data = value === undefined ? {} : object(value, "任务需求");
  const allowed = ["requireAll", "requireAny", "recommend", "wear", ...Object.keys(NEED_FLAGS)];
  if (Object.keys(data).some(key => !allowed.includes(key))) throw new Error("任务需求包含未知字段");
  const result: Partial<TaskNeeds> = {};
  for (const key of ["requireAll", "recommend"] as const) if (data[key] !== undefined) result[key] = items(data[key], key);
  if (data.requireAny !== undefined) {
    if (!Array.isArray(data.requireAny) || data.requireAny.length > 10) throw new Error("任选装备最多配置 10 组");
    result.requireAny = data.requireAny.map(group => {
      const list = items(group, "任选装备");
      if (!list.length) throw new Error("任选装备组不能为空");
      return list;
    });
  }
  if (data.wear !== undefined) {
    const wear = object(data.wear, "穿戴状态");
    for (const [key, role] of Object.entries(wear)) {
      if (!EDITOR_ITEMS.includes(key as ClothingItem) || typeof role !== "string" || !Object.hasOwn(WEAR_LABELS, role)) throw new Error("穿戴状态包含不支持的装备或动作");
      if (role === "faded" && key !== "长裤" && key !== "内裤") throw new Error("褪到膝盖仅适用于长裤、内裤");
      if (role === "rolled" && key !== "上衣") throw new Error("卷起仅适用于上衣");
    }
    result.wear = { ...wear } as TaskNeeds["wear"];
  }
  for (const key of Object.keys(NEED_FLAGS) as (keyof typeof NEED_FLAGS)[]) {
    if (data[key] !== undefined) {
      if (typeof data[key] !== "boolean") throw new Error(`${NEED_FLAGS[key]}须为布尔值`);
      result[key] = data[key];
    }
  }
  return result;
}

function validateVariables(value: unknown, title: string, description: string): TaskVariable[] | undefined {
  if (value !== undefined && (!Array.isArray(value) || value.length > 10)) throw new Error("每项任务最多配置 10 个变量");
  const keys = new Set<string>();
  const variables = ((value ?? []) as unknown[]).map((entry): TaskVariable => {
    const row = object(entry, "变量");
    const key = string(row.key, "变量名", 30);
    if (!/^[\p{L}_][\p{L}\p{N}_]*$/u.test(key) || ["__proto__", "constructor", "prototype"].includes(key)) throw new Error("变量名须以文字或下划线开头，仅含文字、数字和下划线");
    if (keys.has(key)) throw new Error(`变量名重复：${key}`);
    keys.add(key);
    if (!Array.isArray(row.options) || !row.options.length || row.options.length > 50) throw new Error(`变量 ${key} 需要 1–50 个备选值`);
    if (row.type === "text") {
      const options = row.options.map(option => string(option, `变量 ${key} 备选词`, 200).trim());
      if (options.some(option => /[{}]/.test(option))) throw new Error("备选词不能嵌套变量或包含花括号");
      return { key, type: "text", options: [...new Set(options)] };
    }
    if (row.type !== "equipment") throw new Error("不支持的变量类型");
    if (row.source !== "worn" && row.source !== "owned" && row.source !== "unworn") throw new Error(`变量 ${key} 的装备范围无效`);
    const options = items(row.options, `变量 ${key}`);
    if (row.wear !== undefined && (typeof row.wear !== "string" || !Object.hasOwn(WEAR_LABELS, row.wear))) throw new Error("变量穿戴状态无效");
    const wear = row.wear as WearRole | undefined;
    if (options.some(item => !supportsWear(item, wear))) throw new Error(`变量 ${key}：卷起仅适用于上衣，褪到膝盖仅适用于长裤或内裤`);
    return { key, type: "equipment", options, source: row.source, ...(wear ? { wear } : {}) };
  });
  const text = title + "\n" + description;
  const referenced = [...text.matchAll(/\{\{([^{}]+)\}\}/g)].map(match => match[1]);
  for (const key of referenced) if (!keys.has(key)) throw new Error(`正文或标题引用了未配置的变量：${key}`);
  if (/\{\{|\}\}/.test(text.replace(/\{\{([^{}]+)\}\}/g, ""))) throw new Error("变量标记不完整，请使用 {{变量名}}");
  for (const key of keys) if (!referenced.includes(key)) throw new Error(`请在标题或正文插入 {{${key}}}`);
  return variables.length ? variables : undefined;
}

export function validateTaskPack(value: unknown): TaskPack {
  const data = object(value, "任务包");
  if (data.format !== "myflash-task-pack" || data.version !== 1) throw new Error("不支持的任务包格式或版本（需要 myflash-task-pack v1）");
  if (data.persona !== "male" && data.persona !== "female") throw new Error("请选择有效角色");
  if (data.mode !== "normal" && data.mode !== "hell") throw new Error("请选择有效难度");
  if (data.type !== "floor" && data.type !== "climb") throw new Error("请选择楼层任务或上楼任务");
  if (!Array.isArray(data.tasks) || data.tasks.length < 1 || data.tasks.length > 200) throw new Error("每个任务包需要 1–200 个任务");
  const ids = new Set<string>();
  const tasks = data.tasks.map((value, index): Task => {
    const row = object(value, `任务 ${index + 1}`);
    const id = string(row.id, "任务 ID", 160);
    if (ids.has(id)) throw new Error(`重复任务 ID：${id}`);
    ids.add(id);
    return {
      id, name: string(row.name, `任务 ${index + 1} 标题`, 80),
      description: string(row.description, `任务 ${index + 1} 正文`, 4000),
      baseScore: number(row.baseScore, `任务 ${index + 1} 基础分`, 100),
      needs: validateNeeds(row.needs),
      ...(row.variables !== undefined || /{{|}}/.test(`${row.name} ${row.description}`) ? { variables: validateVariables(row.variables, String(row.name), String(row.description)) } : {}),
      ...(row.urineBonus !== undefined ? { urineBonus: number(row.urineBonus, "额外积分", 3) } : {}),
    };
  });
  return {
    format: "myflash-task-pack", version: 1,
    id: data.id === undefined ? customId("pack") : string(data.id, "任务包 ID", 160),
    name: string(data.name, "任务包名称", 80).trim(),
    persona: data.persona, mode: data.mode, type: data.type, tasks,
  };
}

export function parseTaskPack(text: string): TaskPack {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error("任务包文件不能超过 2 MB");
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error("文件不是有效的 JSON"); }
  return validateTaskPack(data);
}

export interface ImportPreview {
  count: number;
  errors: string[];
  pack: TaskPack | null;
}

/** 校验所有行，预览始终不写入存储。 */
export function previewTaskPack(text: string): ImportPreview {
  try {
    if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error("任务包文件不能超过 2 MB");
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { throw new Error("文件不是有效的 JSON"); }
    const data = object(raw, "任务包");
    const rows = Array.isArray(data.tasks) ? data.tasks : [];
    const errors: string[] = [];
    try { validateTaskPack({ ...data, tasks: [{ ...newTask(), name: "校验", description: "校验" }] }); }
    catch (error) { errors.push((error as Error).message); }
    if (!Array.isArray(data.tasks) || rows.length < 1 || rows.length > 200) errors.push("每个任务包需要 1–200 个任务");
    const ids = new Set<string>();
    rows.slice(0, 200).forEach((row, index) => {
      try {
        const task = validateTaskPack({ ...data, tasks: [row] }).tasks[0];
        if (ids.has(task.id)) throw new Error("任务 ID 重复");
        ids.add(task.id);
      } catch (error) { errors.push(`任务 ${index + 1}：${(error as Error).message}`); }
    });
    return { count: rows.length, errors, pack: errors.length ? null : validateTaskPack(data) };
  } catch (error) { return { count: 0, errors: [(error as Error).message], pack: null }; }
}
export function importTaskPack(pack: TaskPack, existing: TaskPack[]): TaskPack {
  let name = pack.name;
  let count = 2;
  while (existing.some(item => item.name === name)) name = `${pack.name.slice(0, 65)}（${count++}）`;
  return { ...pack, id: customId("pack"), name, tasks: pack.tasks.map(task => ({ ...task, id: customId() })) };
}
export function loadTaskPacks(): TaskPack[] {
  const raw = localStorage.getItem(PACKS_KEY);
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("本地任务包数据格式错误");
  return data.map(validateTaskPack);
}
export function saveTaskPacks(packs: TaskPack[]): void {
  if (packs.length > 30 || packs.reduce((sum, pack) => sum + pack.tasks.length, 0) > 1000) throw new Error("本地最多保存 30 个任务包、共 1000 项任务");
  const checked = packs.map(validateTaskPack);
  const ids = checked.flatMap(pack => pack.tasks.map(task => task.id));
  if (new Set(ids).size !== ids.length) throw new Error("任务包之间有重复任务 ID，请使用导入或复制生成新 ID");
  localStorage.setItem(PACKS_KEY, JSON.stringify(checked));
}
export function taskPackError(pack: TaskPack): string | null {
  try { validateTaskPack(pack); return null; } catch (error) { return error instanceof Error ? error.message : "任务包无效"; }
}
export function buildRunTaskPools(persona: Persona, mode: GameMode, source: TaskSource, packs: TaskPack[]): TaskPools {
  const builtin = selectTaskPools(persona, mode);
  const custom: TaskPools = { 楼层任务: [], 上楼任务: [] };
  for (const pack of packs.filter(pack => pack.persona === persona && pack.mode === mode)) {
    custom[pack.type === "floor" ? "楼层任务" : "上楼任务"].push(...pack.tasks);
  }
  const result: TaskPools = source === "builtin" ? builtin : custom;
  if (result.楼层任务.length < 2) throw new Error("当前角色和难度至少需要 2 个楼层任务，才能二选一");
  if (!result.上楼任务.length) throw new Error("缺少当前角色和难度的上楼任务，请添加对应任务包");
  return structuredClone(result);
}
