import { getTaskNeeds, missingRequiredItems } from "./advisor";
import { getTaskPoolForFloor } from "./constants";
import type { GameState, Task } from "./types";

export const MAX_TASK_REPLACEMENTS = 2;

export function getReplacementCandidates(state: GameState, taskId: string): Task[] {
  if (state.gamePhase !== "adventure" || state.currentTask || !state.taskChoices.some(task => task.id === taskId) ||
      state.assignedClimbingTask || state.taskReplacementsUsed >= MAX_TASK_REPLACEMENTS) return [];
  const pool = state.runTaskPools?.楼层任务 ?? getTaskPoolForFloor(state.currentFloor, state.mode, state.persona) ?? [];
  const candidates = pool.filter((task) => !state.taskChoices.some(choice => choice.id === task.id) &&
    !state.replacedTaskIds.includes(task.id) &&
    missingRequiredItems(getTaskNeeds(task), state.owned).length === 0);
  const plannedIds = new Set(state.missionPlan
    ? [...Object.values(state.missionPlan.floorTasks).flat(),
       ...Object.values(state.missionPlan.climbingTasks)].map((task) => task.id)
    : []);
  const unused = candidates.filter((task) => !plannedIds.has(task.id));
  return unused.length > 0 ? unused : candidates;
}

export function replacePlannedTask(state: GameState, task: Task, previousId: string): GameState["missionPlan"] {
  if (!state.missionPlan) return null;
  const tasks = [...(state.missionPlan.floorTasks[state.currentFloor] ?? [])];
  const index = Math.max(0, tasks.findIndex(candidate => candidate.id === previousId));
  tasks[index] = task;
  return {
    ...state.missionPlan,
    floorTasks: { ...state.missionPlan.floorTasks, [state.currentFloor]: tasks },
  };
}
