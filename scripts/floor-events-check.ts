import assert from 'node:assert/strict';
import { applyFloorEvents, extraRemovalCandidates, doubleArabicNumbers, inheritFloorEvents } from '../src/lib/game/floorEvents';
import { createInitialGameState, calculateTaskScore } from '../src/lib/game/constants';
import { concretizeTask, getWearAdvice, wearActionItems, wearActionLabel } from '../src/lib/game/advisor';
import { newTaskPack, saveTaskPacks } from '../src/lib/game/customTasks';
import { useGameStore, getTaskChoiceDisplays, getActiveTaskDisplay } from '../src/lib/game/store';
import type { Task } from '../src/lib/game/types';
const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => memory.set(key, value),
  removeItem: (key: string) => memory.delete(key),
} });
const state = { ...createInitialGameState(), gamePhase: 'adventure' as const, clothing: { 上衣: true, 长裤: true, 内裤: true, 短袜: true, 鞋子: true } };
const makeTask = (id: string): Task => ({ id, name: '任务' + id, description: '观察10秒，计数3次。', baseScore: 3, needs: {} });
const first = makeTask('a'), second = makeTask('b'), third = makeTask('c');
const sequence = (rolls: number[]) => { let i = 0; return () => rolls[i++] ?? 0; };
const score = (task: Task) => calculateTaskScore({ ...state, currentTask: task });
assert.equal(doubleArabicNumbers('10秒、1.5次、0.05、9007199254740993、中文三'), '20秒、3.0次、0.10、18014398509481986、中文三');
const original = structuredClone([first, second]);
const all = applyFloorEvents([first, second], state, () => third, () => 0);
assert.equal(all.length, 3);
assert.deepEqual([first, second], original);
assert.equal(all.filter(task => task.floorEvents?.hidden).length, 1);
assert.equal(all.filter(task => task.floorEvents?.extraRemoval).length, 1);
assert.equal(all.filter(task => task.floorEvents?.doubledNumbers).length, 1);
assert.equal(all.filter(task => task.floorEvents?.reducedScore).length, 2);
assert.equal(all[0].description, '观察20秒，计数6次。');
assert.equal(score(all[0]), score(first) + 1 + 2 - 1);
assert.equal(score(all[1]), score(second) - 1);
assert.equal(score(all[2]), score(third));
assert.ok(wearActionItems(getWearAdvice(all[0], state.clothing, state.owned)).map(wearActionLabel).includes('脱下上衣'));
assert.deepEqual(concretizeTask(JSON.parse(JSON.stringify(all[0])), state.clothing, state.owned), all[0]);
const hidden = getTaskChoiceDisplays({ ...state, taskChoices: all })[0];
assert.equal(hidden.name, '隐藏任务');
assert.deepEqual(hidden.actions, []);
assert.deepEqual(hidden.eventNotes, []);
assert.ok(!hidden.description.includes('20'));
assert.equal(hidden.score, score(all[0]));
assert.equal(getActiveTaskDisplay({ ...state, currentTask: all[0], taskChoices: [] }).description, all[0].description);

// 四个阈值精确边界与单事件相互独立。
const thresholds = [0.6, 0.4, 0.2, 0.3];
const boundary = applyFloorEvents([first, second], state, () => { throw new Error('不应抽第三项'); }, sequence(thresholds));
assert.ok(boundary.every(task => Object.keys(task.floorEvents!).length === 0));
for (let event = 0; event < 4; event++) {
  const rolls = thresholds.map((value, i) => i === event ? value - 0.000001 : value);
  const tasks = applyFloorEvents([first, second], state, () => third, sequence(rolls));
  assert.equal(tasks.some(task => task.floorEvents?.hidden), event === 0);
  assert.equal(tasks.some(task => task.floorEvents?.extraRemoval), event === 1);
  assert.equal(tasks.some(task => task.floorEvents?.doubledNumbers), event === 2);
  assert.equal(tasks.length, event === 3 ? 3 : 2);
}
const blocked: Task = { ...first, description: '记录结果', needs: { fullyBare: true } };
const absent = applyFloorEvents([blocked, { ...blocked, id: 'other' }], state, () => null, () => 0);
assert.ok(absent.every(task => !task.floorEvents?.extraRemoval && !task.floorEvents?.doubledNumbers && !task.floorEvents?.reducedScore));
assert.ok(absent.some(task => task.floorEvents?.hidden));
const onlySecond = applyFloorEvents([blocked, second], state, () => null, () => 0);
assert.ok(!onlySecond[0].floorEvents?.extraRemoval);
assert.ok(onlySecond[1].floorEvents?.extraRemoval);
assert.ok(onlySecond[1].floorEvents?.doubledNumbers);
assert.deepEqual(extraRemovalCandidates({ ...first, description: '检查上衣', needs: { wear: { 长裤: 'on' }, requireAll: ['内裤'] }, resolvedVariables: { 装备: '短袜' } }, state), ['鞋子']);
assert.deepEqual(extraRemovalCandidates(first, { clothing: { 上衣: false, 长裤: false, 内裤: false, 短袜: false, 鞋子: false } }), []);
const duplicate = applyFloorEvents([first, second], state, () => first, () => 0);
assert.equal(duplicate.length, 2);
assert.ok(duplicate.every(task => !task.floorEvents?.reducedScore));
const refreshed = inheritFloorEvents(makeTask('replacement'), all[0], state, () => 0);
assert.equal(refreshed.description, all[0].description);
assert.deepEqual(refreshed.floorEvents, all[0].floorEvents);
const noApplicableEvent = inheritFloorEvents(blocked, all[0], state, () => 0);
assert.ok(noApplicableEvent.floorEvents?.hidden && noApplicableEvent.floorEvents?.reducedScore);
assert.ok(!noApplicableEvent.floorEvents?.extraRemoval && !noApplicableEvent.floorEvents?.doubledNumbers);
assert.equal(score(noApplicableEvent), score(blocked) - 1);
assert.equal(score({ ...first, baseScore: 0, floorEvents: { reducedScore: true } }), -1);

// 完整存储、刷新选项、选择揭晓、计分和下一层重新抽事件。
Math.random = () => 0;
saveTaskPacks([{ ...newTaskPack(), tasks: [first, second, third, makeTask('d'), makeTask('e')] }, { ...newTaskPack(), type: 'climb', tasks: [makeTask('climb')] }]);
useGameStore.getState().startGame(1, 'normal', undefined, 'male', 'custom');
useGameStore.getState().confirmDepart();
const drawn = structuredClone(useGameStore.getState().state);
assert.equal(drawn.taskChoices.length, 3);
assert.equal(drawn.taskChoices.filter(task => task.floorEvents?.reducedScore).length, 2);
Math.random = () => 0.99; // 改变随机源后，已保存的选项仍须逐字段一致。
useGameStore.getState().hydrate();
assert.deepEqual(useGameStore.getState().state.taskChoices, drawn.taskChoices);
Math.random = () => 0;
const hiddenId = drawn.taskChoices.find(task => task.floorEvents?.hidden)!.id;
assert.equal(useGameStore.getState().replaceTask(hiddenId), true);
const replaced = structuredClone(useGameStore.getState().state);
assert.equal(replaced.taskChoices.length, 3);
const newHidden = replaced.taskChoices.find(task => task.floorEvents?.hidden)!;
assert.ok(newHidden && newHidden.id !== hiddenId);
assert.deepEqual(replaced.missionPlan!.floorTasks[1], replaced.taskChoices);
useGameStore.getState().hydrate();
assert.deepEqual(useGameStore.getState().state.taskChoices, replaced.taskChoices);
assert.equal(useGameStore.getState().chooseTask(newHidden.id), true);
assert.equal(getActiveTaskDisplay(useGameStore.getState().state).name, newHidden.name);
const beforeComplete = useGameStore.getState().state;
const expectedScore = calculateTaskScore(beforeComplete);
Math.random = () => 0.99; // 本次不触发原有完成后脱衣事件。
await useGameStore.getState().completeTask();
assert.equal(useGameStore.getState().state.score, beforeComplete.score + expectedScore);
useGameStore.getState().confirmClimbing();
assert.equal(useGameStore.getState().state.currentFloor, 2);
assert.equal(useGameStore.getState().state.taskChoices.length, 2);
assert.ok(useGameStore.getState().state.taskChoices.every(task => Object.keys(task.floorEvents!).length === 0));
console.log('楼层事件检查通过：独立概率边界、四事件叠加、装备与数字条件、隐藏揭晓、分数结算、三选项存档、选项刷新及下一层重新判定。');
