import { useEffect, useState } from "react";
import { toast } from "sonner";
import { buildRunTaskPools, loadTaskPacks, type TaskSource } from "@/lib/game/customTasks";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createDefaultOwnedInventory } from "@/lib/game/constants";
import { loadPersonaFromStorage, savePersonaToStorage } from "@/lib/game/storage";
import type { GameMode, OwnedInventory, Persona } from "@/lib/game/types";
import { useGameStore } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function StartSection() {
  const migrationMessage = useGameStore((s) => s.state.gamePhase === "initial" ? s.state.taskMessage : null);
  const startGame = useGameStore((s) => s.startGame);
  const setHellPreview = useGameStore((s) => s.setHellPreview);
  const [startingFloor, setStartingFloor] = useState(1);
  const [source, setSource] = useState<TaskSource>("builtin");
  const setView = useGameStore(s => s.setView);
  const [mode, setMode] = useState<GameMode>("normal");
  const [persona, setPersona] = useState<Persona>(() => loadPersonaFromStorage());
  const [owned] = useState<OwnedInventory>(() => createDefaultOwnedInventory());

  useEffect(() => {
    setHellPreview(mode === "hell");
    return () => setHellPreview(false);
  }, [mode, setHellPreview]);

  const endFloor = startingFloor + 5;
  let sourceError = "";
  let taskCounts = "";
  try {
    const pools = buildRunTaskPools(persona, mode, source, source === "custom" ? loadTaskPacks() : []);
    taskCounts = `楼层任务 ${pools.楼层任务.length} 项 · 上楼任务 ${pools.上楼任务.length} 项`;
  } catch (error) { sourceError = error instanceof Error ? error.message : "无法读取任务包"; }

  const selectPersona = (next: Persona) => {
    setPersona(next);
    savePersonaToStorage(next);
  };


  return (
    <div className="space-y-6">
      {migrationMessage && <p role="status" className="rounded-lg border p-3 text-sm">{migrationMessage}</p>}
      <h1 className="pt-2 text-[28px] font-semibold leading-[1.05] tracking-tight sm:pt-4 sm:text-[34px]">
        混凝土楼道里，
        <br />
        怎么藏着一只全裸的{persona === "female" ? "母狗" : "公狗"}？
      </h1>

      <Card className="overflow-hidden py-0">
        <CardContent className="space-y-5 p-4 sm:p-5">
          <div role="radiogroup" aria-label="身份" className="flex flex-wrap gap-2">
            <PersonaPill
              selected={persona === "male"}
              tone="male"
              onClick={() => selectPersona("male")}
            />
            <PersonaPill
              selected={persona === "female"}
              tone="female"
              onClick={() => selectPersona("female")}
            />
          </div>

          <div role="radiogroup" aria-label="模式" className="grid grid-cols-2 gap-2">
            <ChoiceCard
              selected={mode === "normal"}
              title="普通模式"
              hint="6 层 · 每层任务二选一"
              onClick={() => setMode("normal")}
            />
            <ChoiceCard
              selected={mode === "hell"}
              variant="heat"
              title="地狱模式"
              hint="6 层 · 更高风险与加成"
              onClick={() => setMode("hell")}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <div className="w-full space-y-2">
              <p className="text-sm font-medium">本局任务来源</p>
              <div role="radiogroup" aria-label="任务来源" className="grid grid-cols-2 gap-2">
                <ChoiceCard selected={source === "builtin"} title="仅内置" hint="使用游戏自带任务" onClick={() => setSource("builtin")} />
                <ChoiceCard selected={source === "custom"} title="仅自定义" hint="使用匹配角色与难度的任务包" onClick={() => setSource("custom")} />
              </div>
              <p role="status" className="text-sm text-muted-foreground">{sourceError || taskCounts}</p>
              <Button variant="outline" onClick={() => setView("taskEditor")}>管理自定义任务</Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">起始层</p>
              <p className="mt-1 text-sm tabular-nums">
                {startingFloor}
                <span className="text-muted-foreground"> → {endFloor} 层</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                onClick={() => setStartingFloor((v) => Math.max(1, v - 1))}
                aria-label="减一层"
              >
                −
              </Button>
              <Input
                id="startingFloor"
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                value={startingFloor}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setStartingFloor(1);
                    return;
                  }
                  const n = Number(raw);
                  if (!Number.isFinite(n)) return;
                  setStartingFloor(Math.max(1, Math.min(99, Math.floor(n))));
                }}
                className="h-10 w-16 text-center text-base font-semibold tabular-nums"
              />
              <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                onClick={() => setStartingFloor((v) => Math.min(99, v + 1))}
                aria-label="加一层"
              >
                +
              </Button>
            </div>
          </div>


          <Button
            size="lg"
            data-hell={mode === "hell" ? "true" : "false"}
            className={cn(
              "h-12 w-full text-base font-semibold",
              mode === "hell" && "hell-start-btn",
            )}
            disabled={!!sourceError}
            onClick={() => { try { startGame(startingFloor, mode, owned, persona, source); } catch (error) { toast.error(error instanceof Error ? error.message : "开局失败"); } }}
          >
            {mode === "hell" && <span className="hell-btn-heat" aria-hidden="true" />}
            {mode === "hell" && <span className="hell-btn-grain" aria-hidden="true" />}
            <span className="hell-start-label">开始</span> <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PersonaPill({
  selected,
  tone,
  onClick,
}: {
  selected: boolean;
  tone: "male" | "female";
  onClick: () => void;
}) {
  const male = tone === "male";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap transition-colors",
        male &&
          (selected
            ? "border-sky-600 bg-sky-600 text-white shadow-sm"
            : "border-sky-500/35 bg-sky-500/15 text-sky-800 hover:bg-sky-500/25 dark:text-sky-200"),
        !male &&
          (selected
            ? "border-pink-500 bg-pink-500 text-white shadow-sm"
            : "border-pink-500/35 bg-pink-500/15 text-pink-800 hover:bg-pink-500/25 dark:text-pink-200"),
      )}
    >
      <span className="text-sm leading-none" aria-hidden="true">
        {male ? "♂" : "♀"}
      </span>
      {male ? "我是公狗" : "我是母狗"}
    </button>
  );
}

function ChoiceCard({
  selected,
  variant = "ink",
  title,
  hint,
  onClick,
}: {
  selected: boolean;
  variant?: "ink" | "heat";
  title: string;
  hint: string;
  onClick: () => void;
}) {
  const heat = variant === "heat";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-pressed={selected}
      data-active={heat ? (selected ? "true" : "false") : undefined}
      onClick={onClick}
      className={cn(
        "relative isolate min-h-[4.75rem] overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-colors",
        heat && "hell-select-card",
        selected && variant === "ink" && "border-foreground bg-foreground text-background",
        !selected && "border-border bg-card hover:bg-muted/50",
      )}
    >
      {heat && (
        <>
          <span className="hell-card-scorch" aria-hidden="true" />
          <span className="hell-card-rim" aria-hidden="true" />
          <span className="hell-card-sparks" aria-hidden="true">
            <span style={{ left: "22%" }} />
            <span style={{ left: "51%" }} />
            <span style={{ left: "78%" }} />
          </span>
        </>
      )}
      <span className="relative z-[1] flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span
            className={cn(
              "block text-[15px] font-semibold tracking-tight",
              heat && "hell-select-title",
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "mt-1 block text-xs leading-snug",
              selected ? "opacity-70" : "text-muted-foreground",
            )}
          >
            {hint}
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
            selected
              ? heat
                ? "border-current bg-current/15"
                : "border-current bg-current/10"
              : "border-border",
          )}
          aria-hidden="true"
        >
          {selected && <Check className="size-2.5" strokeWidth={3} />}
        </span>
      </span>
    </button>
  );
}
