import type { ClothingItem, OwnedInventory, Task, TaskVariable, TaskWear, WearRole } from './types';

type EquipmentVariable = Extract<TaskVariable, { type: 'equipment' }>;
export const VARIABLE_SOURCE_LABELS = { worn: '当前穿着', owned: '拥有', unworn: '拥有但未穿着' } as const;
export function supportsWear(item: ClothingItem, wear?: WearRole): boolean {
  return (wear !== 'rolled' || item === '上衣') && (wear !== 'faded' || item === '长裤' || item === '内裤');
}
export function variableEquipmentOptions(variable: EquipmentVariable, clothing: Record<ClothingItem, boolean>, owned: OwnedInventory): ClothingItem[] {
  return [...new Set(variable.options)].filter(item => supportsWear(item, variable.wear) &&
    (variable.source === 'worn' ? clothing[item] : variable.source === 'owned' ? owned[item] : owned[item] && !clothing[item]));
}

// 同一件装备不能同时被变量要求处于不同状态；通过最多五件装备的状态组合查找可行解。
function equipmentAssignments(task: Task, clothing: Record<ClothingItem, boolean>, owned: OwnedInventory, random: boolean): Record<string, string> | null {
  const variables = (task.variables ?? []).filter((v): v is EquipmentVariable => v.type === 'equipment');
  const failed = new Set<string>();
  function visit(index: number, wear: TaskWear, values: Record<string, string>): Record<string, string> | null {
    if (index === variables.length) return values;
    const signature = JSON.stringify([index, Object.entries(wear).sort()]);
    if (failed.has(signature)) return null;
    const variable = variables[index];
    const options = variableEquipmentOptions(variable, clothing, owned);
    if (random) for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    for (const item of options) {
      if (variable.wear && wear[item] && variable.wear !== wear[item]) continue;
      const nextWear = variable.wear ? { ...wear, [item]: variable.wear } : wear;
      const result = visit(index + 1, nextWear, { ...values, [variable.key]: item });
      if (result) return result;
    }
    failed.add(signature);
    return null;
  }
  return visit(0, { ...task.needs?.wear }, {});
}
export function canResolveTaskVariables(task: Task, clothing: Record<ClothingItem, boolean>, owned: OwnedInventory): boolean {
  return !!task.resolvedVariables || equipmentAssignments(task, clothing, owned, false) !== null;
}
export function resolveTaskVariables<T extends Task>(task: T, clothing: Record<ClothingItem, boolean>, owned: OwnedInventory): T {
  if (!task.variables?.length || task.resolvedVariables) return task;
  const values = equipmentAssignments(task, clothing, owned, true);
  if (!values) throw new Error('当前装备不满足任务变量条件');
  const wear = { ...task.needs?.wear };
  for (const variable of task.variables) {
    if (variable.type === 'text') values[variable.key] = variable.options[Math.floor(Math.random() * variable.options.length)];
    else if (variable.wear) Object.assign(wear, { [values[variable.key]]: variable.wear });
  }
  const replace = (text: string) => text.replace(/\{\{([^{}]+)\}\}/g, (token, key: string) => values[key] ?? token);
  return { ...task, name: replace(task.name), description: replace(task.description),
    needs: { ...task.needs, wear }, resolvedVariables: values };
}
