import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { getReplacementCandidates, MAX_TASK_REPLACEMENTS } from "@/lib/game/taskReplacement";
import { StairProgress } from "@/components/StairProgress";
import { WardrobeViewer } from "@/components/WardrobeFigurine";
import { Button } from "@/components/ui/button";
import {
  SKIP_TASK_COST,
  calculateTaskScore,
  getKeepClothingCost,
  getTotalFloors,
  HELL_TASK_FLOORS,
} from "@/lib/game/constants";
import type { ClothingItem } from "@/lib/game/types";
import { getWearAdvice, wearActionItems, wearActionLabel } from "@/lib/game/advisor";
import { cn } from "@/lib/utils";
import {
  getActiveTaskDisplay,
  getDisplayFloor,
  getGameControls,
  useGameStore,
} from "@/lib/game/store";

export function GameSection() {
  const state = useGameStore((s) => s.state);
  const completeTask = useGameStore((s) => s.completeTask);
  const nextFloor = useGameStore((s) => s.nextFloor);
  const assignClimbingTask = useGameStore((s) => s.assignClimbingTask);
  const confirmClimbing = useGameStore((s) => s.confirmClimbing);
  const skipTask = useGameStore((s) => s.skipTask);
  const replaceTask = useGameStore((s) => s.replaceTask);
  const restoreVoucher = useGameStore((s) => s.useRestoreVoucher);
  const forfeitGame = useGameStore((s) => s.forfeitGame);
  const hasConfirm = useGameStore((s) => !!s.confirmRequest);

  useEffect(() => {
    assignClimbingTask();
  }, [assignClimbingTask, state.currentFloor, state.currentTask, state.assignedClimbingTask, state.gamePhase]);

  const controls = getGameControls(state);
  const task = getActiveTaskDisplay(state);
  const displayFloor = getDisplayFloor(state.currentFloor, state.startingFloor);
  const totalFloors = getTotalFloors(state.mode);
  const startFloor = state.startingFloor;

  const climbing = state.assignedClimbingTask;
  const floorTask = state.currentTask;
  const isClimbing = !!climbing;
  const taskName = task.name;
  const activeTask = climbing ?? floorTask;
  const wearAdvice = getWearAdvice(activeTask, state.clothing, state.owned);
  const wearActions = wearActionItems(wearAdvice);
  const scorePreview = floorTask ? calculateTaskScore(state) : 0;
  const inv = state.inventory;
  const canSkip = inv.skip > 0 || state.score >= SKIP_TASK_COST;
  const replacementsLeft = Math.max(0, MAX_TASK_REPLACEMENTS - state.taskReplacementsUsed);
  const canReplace = getReplacementCandidates(state).length > 0;
  const hasVoucherUi =
    inv.skip > 0 ||
    (inv.restore > 0 && !state.clothing["内裤"]) ||
    inv.delayStrip > 0 ||
    state.riskDoubleActive ||
    state.pendingDelayedStrip;

  const handleComplete = async () => {
    const prev = useGameStore.getState().state;
    const prevClothing = { ...prev.clothing } as Record<ClothingItem, boolean>;
    const prevScore = prev.score;
    const prevUrine = prev.urineMarks;
    const prevPending = prev.pendingDelayedStrip;
    const prevDelayCount = prev.inventory.delayStrip;
    const scoreGained = prev.currentTask ? calculateTaskScore(prev) : 0;
    const keepCost = getKeepClothingCost(prev);
    await completeTask();
    const next = useGameStore.getState().state;
    const removed = (Object.keys(prevClothing) as ClothingItem[]).find(
      (k) => prevClothing[k] && !next.clothing[k],
    );
    if (removed) {
      toast.error(`已脱掉${removed}`);
      return;
    }
    if (prevDelayCount > next.inventory.delayStrip && next.pendingDelayedStrip) {
      toast.warning("剥夺衣物已推迟");
      return;
    }
    if (prevPending && !next.pendingDelayedStrip && next.urineMarks > prevUrine) {
      toast.error("无衣可脱：-5 分");
      return;
    }
    if (next.urineMarks > prevUrine && next.score === Math.max(0, prevScore + scoreGained - 5)) {
      toast.error("无衣可脱：-5 分");
      return;
    }
    if (
      !removed &&
      next.score === Math.max(0, prevScore + scoreGained - keepCost) &&
      next.score < prevScore + scoreGained
    ) {
      toast.success(`已花费${keepCost}分保留`);
      return;
    }
    toast.success(`+${scoreGained}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">{displayFloor} 层</h1>
            {state.mode === "hell" && (
              <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold leading-none text-background">
                地狱
              </span>
            )}
            {state.persona === "female" && (
              <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none">
                母狗
              </span>
            )}
          </div>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums tracking-tight">{state.score}</span>
            <span className="text-sm font-medium text-muted-foreground">积分</span>
          </p>
        </div>
        <WardrobeViewer clothing={state.clothing} task={activeTask} owned={state.owned} />
      </div>

      <StairProgress
        completed={state.currentFloor - 1}
        total={totalFloors}
        startingFloor={startFloor}
        hellFloors={state.mode === "hell" ? HELL_TASK_FLOORS : undefined}
      />

      {hasVoucherUi && (
        <div className="flex flex-wrap gap-1.5">
          {inv.skip > 0 && (
            <Chip
              label={`跳过 ×${inv.skip}`}
              action={floorTask && !hasConfirm ? "使用" : undefined}
              onAction={() => skipTask()}
            />
          )}
          {inv.restore > 0 && !state.clothing["内裤"] && (
            <Chip
              label="恢复内裤"
              action={hasConfirm ? undefined : "使用"}
              onAction={() => {
                restoreVoucher();
                if (useGameStore.getState().state.clothing["内裤"]) toast.success("已恢复内裤");
              }}
            />
          )}
          {inv.delayStrip > 0 && <Chip label={`延迟 ×${inv.delayStrip}`} />}
          {state.riskDoubleActive && <Chip label="风险加倍" />}
          {state.pendingDelayedStrip && <Chip label="待剥夺" />}
        </div>
      )}

      {floorTask || climbing ? (
        <div key={floorTask?.id ?? climbing?.id} className="task-enter space-y-4">
          <div>
            <h2 className="text-lg font-semibold leading-tight sm:text-xl">{taskName}</h2>
            {(wearActions.length > 0 || task.description) && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {wearActions.map((item) => (
                  <span
                    key={`${item.item}-${item.verb}`}
                    className={cn(
                      "mr-1.5 inline-flex items-center rounded-full border px-3 py-1.5 align-middle text-sm",
                      item.tone === "missing"
                        ? "border-destructive/40 text-destructive"
                        : "border-foreground/30 bg-muted/50 text-foreground",
                    )}
                  >
                    {wearActionLabel(item)}
                  </span>
                ))}
                {task.description}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            {!isClimbing && floorTask && (
              <div className="space-y-1">
                <Button variant="outline" className="h-11 w-full"
                  disabled={hasConfirm || !canReplace}
                  onClick={() => {
                    if (replaceTask()) toast.success("已更换任务，积分与进度不变");
                  }}>
                  免费换一个（剩 {replacementsLeft} 次）
                </Button>
                <p className="text-xs text-muted-foreground">
                  {replacementsLeft === 0 ? "本局免费更换次数已用完。"
                    : !canReplace ? "当前没有符合装备条件的其他任务。"
                    : "每局可更换两次楼层任务，优先避开本局其他任务；上楼任务不参与更换。"}
                </p>
              </div>
            )}
            {controls.showCompleteTask && (
              <Button
                size="lg"
                className="h-12 w-full text-base font-semibold"
                disabled={hasConfirm}
                onClick={handleComplete}
              >
                完成（+{scorePreview}分）
              </Button>
            )}
            {controls.showNextFloor && (
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full"
                disabled={hasConfirm}
                onClick={nextFloor}
              >
                {controls.nextFloorLabel}
              </Button>
            )}
            {controls.showConfirmClimbing && (
              <Button size="lg" className="h-12 w-full" disabled={hasConfirm} onClick={confirmClimbing}>
                {climbing
                  ? `我已到达${getDisplayFloor(climbing.targetFloor, state.startingFloor)}层`
                  : "我已到达"}
              </Button>
            )}
            {!isClimbing && floorTask && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                disabled={hasConfirm || !canSkip}
                onClick={() => skipTask()}
              >
                跳过
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {task.name && task.name !== "暂无任务" && (
            <p className="text-sm text-muted-foreground">{task.name}</p>
          )}
          {controls.showNextFloor && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full"
              disabled={hasConfirm}
              onClick={nextFloor}
            >
              {controls.nextFloorLabel}
            </Button>
          )}
        </div>
      )}

      {controls.showForfeit && (
        <button
          disabled={hasConfirm}
          onClick={() => forfeitGame()}
          className="mx-auto flex items-center gap-1.5 py-2 text-xs text-muted-foreground disabled:opacity-50"
        >
          <AlertTriangle className="size-3.5" /> 放弃
        </button>
      )}
    </div>
  );
}

function Chip({
  label,
  action,
  onAction,
}: {
  label: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm">
      {label}
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded bg-foreground px-2 py-0.5 text-xs font-medium text-background"
        >
          {action}
        </button>
      )}
    </span>
  );
}
