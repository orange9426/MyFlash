import assert from 'node:assert/strict';
import { buildRunTaskPools, importTaskPack, loadTaskPacks, newTask, newTaskPack, PACKS_KEY, previewTaskPack, saveTaskPacks, validateTaskPack } from '../src/lib/game/customTasks';
import { useGameStore } from '../src/lib/game/store';
import { clearGameStateStorage } from '../src/lib/game/storage';
import { getReplacementCandidates } from '../src/lib/game/taskReplacement';
import { resolveEnding, getTaskNeeds } from '../src/lib/game/advisor';
import { getTasks } from '../src/lib/game/constants';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => { memory.set(key, value); },
  removeItem: (key: string) => { memory.delete(key); },
} });
const task = (name: string) => ({ ...newTask(), name, description: `完成${name}` });
const floor = { ...newTaskPack(), tasks: [task('观察'), task('计数'), task('记录')] };
const climb = { ...newTaskPack(), type: 'climb' as const, tasks: [task('上楼')] };
const packs = [floor, climb];
saveTaskPacks(packs);
assert.equal(loadTaskPacks().length, 2);
const rawBeforePreview = memory.get(PACKS_KEY);
const valid = previewTaskPack(JSON.stringify(floor));
assert.equal(valid.count, 3);
assert.deepEqual(valid.errors, []);
assert.equal(memory.get(PACKS_KEY), rawBeforePreview);
const invalid = previewTaskPack(JSON.stringify({ ...floor, tasks: [{ ...floor.tasks[0], name: '' }, { ...floor.tasks[1], baseScore: -1 }] }));
assert.equal(invalid.count, 2);
assert.equal(invalid.errors.length, 2);
assert.equal(invalid.pack, null);
assert.equal(previewTaskPack('{').pack, null);
assert.equal(previewTaskPack(' '.repeat(2 * 1024 * 1024 + 1)).pack, null);
assert.throws(() => validateTaskPack({ ...floor, tasks: [floor.tasks[0], floor.tasks[0]] }), /重复/);
const copied = importTaskPack(floor, packs);
assert.notEqual(copied.id, floor.id);
assert.notEqual(copied.tasks[0].id, floor.tasks[0].id);
assert.notEqual(copied.name, floor.name);
assert.throws(() => buildRunTaskPools('female', 'normal', 'custom', packs), /至少/);
assert.throws(() => buildRunTaskPools('male', 'hell', 'custom', packs), /至少/);
assert.throws(() => buildRunTaskPools('male', 'normal', 'custom', [floor]), /上楼/);
assert.throws(() => buildRunTaskPools('male', 'normal', 'custom', [{ ...floor, tasks: [floor.tasks[0]] }, climb]), /至少/);
for (const persona of ['male', 'female'] as const) for (const mode of ['normal', 'hell'] as const) {
  for (const type of ['floor', 'climb'] as const) {
    const tasks = getTasks(persona, mode)[type === 'floor' ? '楼层任务' : '上楼任务'];
    validateTaskPack({ ...newTaskPack(), persona, mode, type, tasks: tasks.map(t => ({ ...t, needs: getTaskNeeds(t) })) });
  }
}
useGameStore.getState().startGame(1, 'normal', undefined, 'male', 'custom');
const before = structuredClone(useGameStore.getState().state);
assert.equal(before.taskSource, 'custom');
assert.equal(Object.keys(before.missionPlan!.floorTasks).length, 6);
assert.equal(Object.keys(before.missionPlan!.climbingTasks).length, 5);
for (const pair of Object.values(before.missionPlan!.floorTasks)) {
  assert.equal(new Set(pair.map(t => t.id)).size, 2);
  assert.ok(pair.every(t => floor.tasks.some(original => original.id === t.id)));
}
saveTaskPacks([{ ...floor, tasks: floor.tasks.map(t => ({ ...t, description: '新版本' })) }, climb]);
assert.deepEqual(useGameStore.getState().state, before);
saveTaskPacks([]);
useGameStore.getState().hydrate();
assert.deepEqual(useGameStore.getState().state.runTaskPools, before.runTaskPools);
assert.deepEqual(useGameStore.getState().state.missionPlan, before.missionPlan);
const replacementState = { ...before, gamePhase: 'adventure' as const, taskChoices: before.missionPlan!.floorTasks[1] };
const replacements = getReplacementCandidates(replacementState, replacementState.taskChoices[0].id);
assert.ok(replacements.length > 0);
assert.ok(replacements.every(t => floor.tasks.some(original => original.id === t.id)));
const ending = resolveEnding({ ...before, score: 0 });
assert.ok(floor.tasks.some(t => ending.includes(t.name)));
saveTaskPacks(packs);
useGameStore.getState().restartGame();
assert.equal(loadTaskPacks().length, 2);
clearGameStateStorage();
assert.equal(loadTaskPacks().length, 2);
useGameStore.getState().startGame(1, 'normal', undefined, 'male', 'builtin');
assert.ok(useGameStore.getState().state.runTaskPools!.楼层任务.every(t => !floor.tasks.some(custom => custom.id === t.id)));
saveTaskPacks([{ ...floor, tasks: floor.tasks.map(t => ({ ...t, description: '新版本' })) }, climb]);
useGameStore.getState().startGame(1, 'normal', undefined, 'male', 'custom');
assert.ok(useGameStore.getState().state.runTaskPools!.楼层任务.every(t => t.description === '新版本'));
const savedState = useGameStore.getState().state;
const originalSetItem = localStorage.setItem;
localStorage.setItem = (key, value) => { if (key === 'gameState') throw new Error('quota'); originalSetItem(key, value); };
assert.throws(() => useGameStore.getState().startGame(1, 'normal', undefined, 'male', 'custom'), /无法保存本局任务快照/);
assert.equal(useGameStore.getState().state, savedState);
localStorage.setItem = originalSetItem;
console.log('任务编辑器回归检查通过：导入预览、校验、来源隔离、内置复制、快照/刷新/换任务/结算、独立存储、下一局生效。');
