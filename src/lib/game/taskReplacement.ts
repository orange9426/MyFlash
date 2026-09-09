import { getTaskNeeds, missingRequiredItems } from "./advisor";
import { getTaskPoolForFloor } from "./constants";
import type { GameState, Task } from "./types";

export const MAX_TASK_REPLACEMENTS = 2;

export function getReplacementCandidates(state: GameState): Task[] {
  if (state.gamePhase !== "adventure" || !state.currentTask ||
      state.assignedClimbingTask || state.taskReplacementsUsed >= MAX_TASK_REPLACEMENTS) return [];
  const pool = getTaskPoolForFloor(state.currentFloor, state.mode, state.persona)?.pool ?? [];
  const candidates = pool.filter((task) => task.id !== state.currentTask?.id &&
    !state.replacedTaskIds.includes(task.id) &&
    missingRequiredItems(getTaskNeeds(task), state.owned).length === 0);
  const plannedIds = new Set(state.missionPlan
    ? [...Object.values(state.missionPlan.floorTasks).flat(),
       ...Object.values(state.missionPlan.climbingTasks)].map((task) => task.id)
    : []);
  const unused = candidates.filter((task) => !plannedIds.has(task.id));
  return unused.length > 0 ? unused : candidates;
}

export function replacePlannedTask(state: GameState, task: Task): GameState["missionPlan"] {
  if (!state.missionPlan) return null;
  const index = state.currentFloor === 8 && state.eighthFloorFirstTaskCompleted ? 1 : 0;
  const tasks = [...(state.missionPlan.floorTasks[state.currentFloor] ?? [])];
  tasks[index] = task;
  return {
    ...state.missionPlan,
    floorTasks: { ...state.missionPlan.floorTasks, [state.currentFloor]: tasks },
  };
}
