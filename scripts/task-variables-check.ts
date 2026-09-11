import assert from 'node:assert/strict';
import { canResolveTaskVariables, resolveTaskVariables, variableEquipmentOptions } from '../src/lib/game/taskVariables';
import { newTaskPack, newTask, saveTaskPacks, validateTaskPack, previewTaskPack } from '../src/lib/game/customTasks';
import { concretizeTask, getWearAdvice, wearActionItems, wearActionLabel, resolveEnding } from '../src/lib/game/advisor';
import { createInitialGameState } from '../src/lib/game/constants';
import { useGameStore, getGameControls, getTaskChoiceDisplays } from '../src/lib/game/store';
import { getReplacementCandidates } from '../src/lib/game/taskReplacement';
import type { Task, TaskVariable } from '../src/lib/game/types';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => memory.set(key, value),
  removeItem: (key: string) => memory.delete(key),
} });
const owned = { 上衣: true, 长裤: true, 内裤: true, 短袜: true, 鞋子: false };
const clothing = { 上衣: true, 长裤: false, 内裤: false, 短袜: false, 鞋子: false };
const equipment: Extract<TaskVariable, { type: 'equipment' }> = { key: '装备', type: 'equipment', options: ['上衣', '长裤', '鞋子'], source: 'worn', wear: 'off' };
const template: Task = { ...newTask(), name: '检查{{装备}}', description: '检查{{装备}}后，记录{{颜色}}和{{装备}}。', variables: [equipment, { key: '颜色', type: 'text', options: ['红色', '蓝色'] }] };
assert.deepEqual(variableEquipmentOptions(equipment, clothing, owned), ['上衣']);
assert.deepEqual(variableEquipmentOptions({ ...equipment, source: 'owned' }, clothing, owned), ['上衣', '长裤']);
assert.deepEqual(variableEquipmentOptions({ ...equipment, source: 'unworn' }, clothing, owned), ['长裤']);
const before = structuredClone(template);
const task = concretizeTask(template, clothing, owned);
assert.equal(task.name, '检查上衣');
assert.equal(task.description.split('上衣').length, 3);
assert.ok(['红色', '蓝色'].includes(task.resolvedVariables!.颜色));
assert.equal(task.needs!.wear!.上衣, 'off');
assert.ok(wearActionItems(getWearAdvice(task, clothing, owned)).map(wearActionLabel).includes('脱下上衣'));
assert.deepEqual(template, before);
assert.deepEqual(concretizeTask(JSON.parse(JSON.stringify(task)), { ...clothing, 上衣: false }, owned), task);
assert.equal(canResolveTaskVariables(template, { ...clothing, 上衣: false }, owned), false);
assert.throws(() => resolveTaskVariables(template, { ...clothing, 上衣: false }, owned));
const rolled: Task = { ...template, variables: [{ ...equipment, options: ['上衣'], wear: 'rolled' }, template.variables![1]] };
assert.ok(wearActionItems(getWearAdvice(concretizeTask(rolled, clothing, owned), clothing, owned)).map(wearActionLabel).some(text => text.includes('卷起')));
const conflict: Task = { ...template, needs: { wear: { 上衣: 'on' } } };
assert.equal(canResolveTaskVariables(conflict, clothing, owned), false);
const two: Task = { ...template, variables: [{ ...equipment, source: 'owned' }, { ...equipment, key: '另一件', source: 'owned', wear: 'on' }] };
assert.equal(canResolveTaskVariables(two, clothing, owned), true);
const pair = resolveTaskVariables(two, clothing, owned);
assert.notEqual(pair.resolvedVariables!.装备, pair.resolvedVariables!.另一件);
const pack = { ...newTaskPack(), tasks: [template] };
assert.deepEqual(validateTaskPack(pack).tasks[0].variables, template.variables);
assert.equal(validateTaskPack({ ...pack, tasks: [{ ...template, resolvedVariables: { 装备: '鞋子' } }] }).tasks[0].resolvedVariables, undefined);
for (const invalid of [
  { ...template, variables: [{ ...equipment, options: [] }] },
  { ...template, variables: [{ ...equipment, wear: 'rolled' }, template.variables![1]] },
  { ...template, variables: [equipment, equipment] },
  { ...template, description: '{{未知}}' },
  { ...template, variables: [{ key: '装备', type: 'text', options: ['{{嵌套}}'] }, template.variables![1]] },
]) assert.throws(() => validateTaskPack({ ...pack, tasks: [invalid] }));
assert.equal(previewTaskPack(JSON.stringify(pack)).errors.length, 0);

// 动态任务在出发时解析，不在开局快照阶段解析；随后固定候选与替换结果。
const floorTasks = [0, 1, 2].map(i => ({ ...template, id: 'variable-' + i, variables: [{ ...equipment, options: ['长裤'] as const }, template.variables![1]] })) as Task[];
const floorPack = { ...newTaskPack(), tasks: floorTasks };
const climbPack = { ...newTaskPack(), type: 'climb' as const, tasks: [{ ...floorTasks[0], id: 'climb-variable' }] };
saveTaskPacks([floorPack, climbPack]);
useGameStore.getState().startGame(1, 'normal', owned, 'male', 'custom');
assert.ok(Object.values(useGameStore.getState().state.missionPlan!.floorTasks).every(tasks => tasks.length === 0));
assert.equal(useGameStore.getState().confirmDepart(), true);
const drawn = structuredClone(useGameStore.getState().state);
assert.equal(drawn.taskChoices.length, 2);
assert.ok(drawn.taskChoices.every(task => task.resolvedVariables!.装备 === '长裤'));
assert.ok(getTaskChoiceDisplays(drawn).every(task => !task.description.includes('{{')));
useGameStore.getState().hydrate();
assert.deepEqual(useGameStore.getState().state.taskChoices, drawn.taskChoices);
const id = drawn.taskChoices[0].id;
assert.equal(getReplacementCandidates(drawn, id).length, 1);
assert.equal(useGameStore.getState().replaceTask(id), true);
const replaced = structuredClone(useGameStore.getState().state);
assert.ok(replaced.taskChoices.every(task => !!task.resolvedVariables));
assert.deepEqual(replaced.missionPlan!.floorTasks[1], replaced.taskChoices);
useGameStore.getState().hydrate();
assert.deepEqual(useGameStore.getState().state.taskChoices, replaced.taskChoices);

// 当前穿着失去唯一候选：楼层和上楼均不抽取，允许无奖励走完整局。
const unavailable = { ...replaced, clothing: { ...replaced.clothing, 长裤: false }, currentTask: null, taskChoices: [], missionPlan: null, unavailableTask: null };
useGameStore.setState({ state: unavailable });
useGameStore.getState().assignClimbingTask();
assert.equal(useGameStore.getState().state.unavailableTask, 'climb');
assert.equal(useGameStore.getState().state.assignedClimbingTask, null);
assert.equal(getGameControls(useGameStore.getState().state).showNextFloor, false);
useGameStore.getState().skipUnavailableTask();
assert.equal(useGameStore.getState().state.currentFloor, 2);
assert.equal(useGameStore.getState().state.unavailableTask, 'floor');
assert.equal(useGameStore.getState().state.taskChoices.length, 0);
const score = useGameStore.getState().state.score;
for (let i = 0; i < 12 && useGameStore.getState().state.gamePhase !== 'ended'; i++) useGameStore.getState().skipUnavailableTask();
assert.equal(useGameStore.getState().state.gamePhase, 'ended');
assert.equal(useGameStore.getState().state.score, score);
assert.equal(useGameStore.getState().state.currentFloor, 6);
assert.equal(useGameStore.getState().state.tasksCompleted, 0);
assert.ok(resolveEnding({ ...createInitialGameState(), score: 0, owned, clothing: { ...clothing, 上衣: false }, runTaskPools: { 楼层任务: [template], 上楼任务: [] } }).includes('没有可用'));
console.log('随机变量检查通过：三种装备范围、文本一致性、动作提示、无候选过滤、状态冲突、导入校验、出发抽取、替换、刷新锁定、无奖励继续和结算。');

// 全部动态任务都不可用时，11 个进度步骤仍能完整结束。
const never = floorTasks.map(task => ({ ...task, variables: [{ ...equipment, options: ['鞋子'], source: 'worn' }, template.variables![1]] })) as Task[];
saveTaskPacks([{ ...floorPack, tasks: never }, { ...climbPack, tasks: [{ ...never[0], id: 'never-climb' }] }]);
useGameStore.getState().startGame(1, 'normal', owned, 'male', 'custom');
useGameStore.getState().confirmDepart();
assert.equal(useGameStore.getState().state.unavailableTask, 'floor');
useGameStore.getState().hydrate();
assert.equal(useGameStore.getState().state.unavailableTask, 'floor');
const emptyScore = useGameStore.getState().state.score;
for (let step = 0; step < 11; step++) useGameStore.getState().skipUnavailableTask();
assert.equal(useGameStore.getState().state.progressStepsCompleted, 11);
assert.equal(useGameStore.getState().state.gamePhase, 'ended');
assert.equal(useGameStore.getState().state.score, emptyScore);

// 单个可用任务与上楼任务的正常解析、刷新、落地流程。
saveTaskPacks([{ ...floorPack, tasks: [floorTasks[0], never[1]] }, climbPack]);
useGameStore.getState().startGame(1, 'normal', owned, 'male', 'custom');
useGameStore.getState().confirmDepart();
assert.equal(useGameStore.getState().state.taskChoices.length, 1);
const active = useGameStore.getState().state;
useGameStore.setState({ state: { ...active, taskChoices: [], progressStepsCompleted: 1 } });
useGameStore.getState().assignClimbingTask();
const climbDraw = structuredClone(useGameStore.getState().state.assignedClimbingTask);
assert.equal(climbDraw!.resolvedVariables!.装备, '长裤');
assert.equal(climbDraw!.targetFloor, 2);
useGameStore.getState().hydrate();
assert.deepEqual(useGameStore.getState().state.assignedClimbingTask, climbDraw);
useGameStore.getState().confirmClimbing();
assert.equal(useGameStore.getState().state.currentFloor, 2);
assert.equal(useGameStore.getState().state.taskChoices.length, 1);
console.log('额外流程检查通过：无候选整局 11 步结束、单候选、上楼抽取和刷新后落地。');

// 装备恢复后重新检查可以恢复抽取，不增加进度。
const retryState = useGameStore.getState().state;
useGameStore.setState({ state: { ...retryState, taskChoices: [], currentTask: null, unavailableTask: 'floor', clothing: { ...retryState.clothing, 长裤: true } } });
useGameStore.getState().retryUnavailableTask();
assert.equal(useGameStore.getState().state.unavailableTask, null);
assert.equal(useGameStore.getState().state.taskChoices.length, 1);
assert.equal(useGameStore.getState().state.progressStepsCompleted, retryState.progressStepsCompleted);

// 动态楼层与静态上楼混用时，商店阶段刷新不能丢失预抽的上楼任务。
const fixedClimb = { ...newTask(), name: '上楼检查', description: '记录楼层编号' };
saveTaskPacks([floorPack, { ...climbPack, tasks: [fixedClimb] }]);
useGameStore.getState().startGame(1, 'normal', owned, 'male', 'custom');
const shopPlan = structuredClone(useGameStore.getState().state.missionPlan);
useGameStore.getState().hydrate();
assert.deepEqual(useGameStore.getState().state.missionPlan, shopPlan);
console.log('恢复装备重试与混合预抽计划刷新检查通过。');
