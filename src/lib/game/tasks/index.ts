import type { GameMode, Persona } from "../types";
import { maleNormalTasks } from "./maleNormal";
import { maleHellTasks } from "./maleHell";
import { femaleNormalTasks } from "./femaleNormal";
import { femaleHellTasks } from "./femaleHell";
import type { TaskPools } from "./schema";

const pools: Record<Persona, Record<GameMode, TaskPools>> = {
  male: { normal: maleNormalTasks, hell: maleHellTasks },
  female: { normal: femaleNormalTasks, hell: femaleHellTasks },
};

export function selectTaskPools(persona: Persona, mode: GameMode): TaskPools {
  return pools[persona][mode];
}
