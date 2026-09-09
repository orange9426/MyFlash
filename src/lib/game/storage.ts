import { createDefaultOwnedInventory } from "./constants";
import type { GameHistoryRecord, OwnedInventory, Persona } from "./types";

const GAME_STATE_KEY = "gameState";
const HISTORY_KEY = "staircaseGameHistory";
const OWNED_KEY = "staircaseOwnedItems";
const PERSONA_KEY = "staircasePersona";

export function loadGameStateFromStorage(): unknown | null {
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function saveGameStateToStorage(state: unknown): void {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch {
    // 忽略 quota / 私有模式等写入失败
  }
}

export function clearGameStateStorage(): void {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch {
    // 忽略
  }
}

export function loadHistoryFromStorage(): GameHistoryRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as GameHistoryRecord[];
  } catch {
    return [];
  }
}

export function saveHistoryToStorage(history: GameHistoryRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch {
    // 忽略写入失败
  }
}

export function appendHistoryRecord(record: GameHistoryRecord): GameHistoryRecord[] {
  const history = loadHistoryFromStorage();
  history.unshift(record);
  const trimmed = history.slice(0, 10);
  saveHistoryToStorage(trimmed);
  return trimmed;
}

export function loadOwnedInventoryFromStorage(): OwnedInventory {
  try {
    const raw = localStorage.getItem(OWNED_KEY);
    if (!raw) return createDefaultOwnedInventory();
    const parsed = JSON.parse(raw) as Partial<OwnedInventory>;
    return createDefaultOwnedInventory(parsed);
  } catch {
    return createDefaultOwnedInventory();
  }
}

export function saveOwnedInventoryToStorage(owned: OwnedInventory): void {
  try {
    localStorage.setItem(OWNED_KEY, JSON.stringify(owned));
  } catch {
    // 忽略写入失败
  }
}

export function loadPersonaFromStorage(): Persona {
  try {
    const raw = localStorage.getItem(PERSONA_KEY);
    return raw === "female" ? "female" : "male";
  } catch {
    return "male";
  }
}

export function savePersonaToStorage(persona: Persona): void {
  try {
    localStorage.setItem(PERSONA_KEY, persona);
  } catch {
    // 忽略写入失败
  }
}
