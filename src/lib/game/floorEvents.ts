import type { ClothingItem, GameState, Task } from './types';
import { getTaskNeeds, resolveTaskDescription } from './advisor';

const EQUIPMENT: ClothingItem[] = ['上衣', '长裤', '内裤', '短袜', '鞋子'];
type Context = Pick<GameState, 'clothing'>;
type Random = () => number;
const pick = <T>(items: T[], random: Random): T => items[Math.floor(random() * items.length)];

/** 已在任务正文、需求、变量或穿戴状态中指定的装备不能额外移除。 */
export function extraRemovalCandidates(task: Task, state: Context): ClothingItem[] {
  const needs = getTaskNeeds(task);
  const specified = new Set<ClothingItem>([
    ...needs.requireAll, ...needs.requireAny.flat(), ...needs.recommend,
    ...Object.keys(needs.wear) as ClothingItem[],
  ]);
  if (needs.fullyBare) EQUIPMENT.forEach(item => specified.add(item));
  if (needs.lowerBare) { specified.add('长裤'); specified.add('内裤'); }
  const text = task.name + task.description;
  return EQUIPMENT.filter(item => state.clothing[item] && !specified.has(item) && !text.includes(item) &&
    !Object.values(task.resolvedVariables ?? {}).includes(item));
}

/** 字符串计算，避免长整数及小数翻倍时出现精度丢失。 */
export function doubleArabicNumbers(text: string): string {
  return text.replace(/\d+(?:\.\d+)?/g, number => {
    const [whole, fraction = ''] = number.split('.');
    const digits = (BigInt(whole + fraction) * 2n).toString().padStart(fraction.length + 1, '0');
    return fraction ? digits.slice(0, -fraction.length) + '.' + digits.slice(-fraction.length) : digits;
  });
}

function lockTask(task: Task, state: Context): Task {
  return { ...task,
    description: task.resolvedVariables || task.floorEvents ? task.description : resolveTaskDescription(task.description, state.clothing),
    needs: getTaskNeeds(task), floorEvents: { ...task.floorEvents },
  };
}
function removeExtra(task: Task, state: Context, random: Random): Task {
  const available = extraRemovalCandidates(task, state);
  if (!available.length) return task;
  const item = pick(available, random);
  return { ...task, needs: { ...task.needs, wear: { ...task.needs?.wear, [item]: 'off' } }, floorEvents: { ...task.floorEvents, extraRemoval: item } };
}
function doubleTask(task: Task): Task {
  if (!/[0-9]/.test(task.description)) return task;
  return { ...task, description: doubleArabicNumbers(task.description), floorEvents: { ...task.floorEvents, doubledNumbers: true } };
}

/** 四次概率独立判定；额外选项只在第四事件成功时才抽取。 */
export function applyFloorEvents(choices: Task[], state: Context, drawExtra: () => Task | null, random: Random = Math.random): Task[] {
  if (!choices.length) return [];
  const hidden = random() < 0.6;
  const extraRemoval = random() < 0.4;
  const doubled = random() < 0.2;
  const additional = random() < 0.3;
  const result = choices.map(task => lockTask(task, state));
  if (hidden) {
    const index = Math.floor(random() * result.length);
    result[index].floorEvents!.hidden = true;
  }
  if (extraRemoval) {
    const eligible = result.map((task, index) => ({ task, index })).filter(({ task }) => extraRemovalCandidates(task, state).length);
    if (eligible.length) { const { index } = pick(eligible, random); result[index] = removeExtra(result[index], state, random); }
  }
  if (doubled) {
    const eligible = result.map((task, index) => ({ task, index })).filter(({ task }) => /[0-9]/.test(task.description));
    if (eligible.length) { const { index } = pick(eligible, random); result[index] = doubleTask(result[index]); }
  }
  if (additional) {
    const extra = drawExtra();
    if (extra && !result.some(task => task.id === extra.id)) {
      result.push(lockTask(extra, state));
      const indices = result.map((_, index) => index);
      for (let count = 0; count < 2; count++) {
        const selected = Math.floor(random() * indices.length);
        result[indices.splice(selected, 1)[0]].floorEvents!.reducedScore = true;
      }
    }
  }
  return result;
}

/** 刷新不重新判定整层概率；保留该选项的事件，条件不足的加分事件取消。 */
export function inheritFloorEvents(task: Task, previous: Task, state: Context, random: Random = Math.random): Task {
  if (!previous.floorEvents) return task;
  let result = lockTask(task, state);
  result.floorEvents = {
    ...(previous.floorEvents.hidden ? { hidden: true } : {}),
    ...(previous.floorEvents.reducedScore ? { reducedScore: true } : {}),
  };
  if (previous.floorEvents.extraRemoval) result = removeExtra(result, state, random);
  if (previous.floorEvents.doubledNumbers) result = doubleTask(result);
  return result;
}
