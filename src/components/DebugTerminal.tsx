import { Copy, Eraser, Power, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGameStore } from "@/lib/game/store";
import { getTotalProgressSteps } from "@/lib/game/constants";
import { clearGameStateStorage } from "@/lib/game/storage";

interface DebugTerminalProps {
  visible: boolean;
  logs: string[];
  onClear: () => void;
  onClose: () => void;
  onCopy: () => void;
  onDeactivate: () => void;
}

export function DebugTerminal({ visible, logs, onClear, onClose, onCopy, onDeactivate }: DebugTerminalProps) {
  const state = useGameStore((s) => s.state);
  const view = useGameStore((s) => s.view);

  const total = getTotalProgressSteps(state.mode);
  const snapshot = {
    view,
    mode: state.mode,
    floor: state.currentFloor,
    displayFloor: state.currentFloor + state.startingFloor - 1,
    score: state.score,
    phase: state.gamePhase,
    choices: state.taskChoices.map(task => task.id),
    progress: `${state.progressStepsCompleted}/${total}`,
    clothing: state.clothing,
    inventory: state.inventory,
    urineMarks: state.urineMarks,
    riskDouble: state.riskDoubleActive,
    pendingStrip: state.pendingDelayedStrip,
    task: state.currentTask?.id ?? state.assignedClimbingTask?.id ?? null,
  };

  const copyState = async () => {
    await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    toast.success("状态已复制");
  };

  const quickAddScore = () => {
    const { state } = useGameStore.getState();
    const next = { ...state, score: state.score + 5 };
    try {
      localStorage.setItem("gameState", JSON.stringify(next));
    } catch {
      // 忽略
    }
    useGameStore.setState({ state: next });
    toast.success("+5 分（仅调试）");
  };

  return (
    <Dialog open={visible} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="space-y-0 px-5 pb-0 pt-5 text-left">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-sm font-semibold">调试</DialogTitle>
            <span className="rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold text-background">DEBUG</span>
          </div>
          <p className="text-xs text-muted-foreground">标题再点一次收起 · 仅本地可见</p>
        </DialogHeader>

        <div className="space-y-4 overflow-auto px-5 pb-5">
          {/* 状态 */}
          <Card className="py-0">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium">状态快照</p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copyState}>
                  <Copy className="size-3.5" /> 复制
                </Button>
              </div>
              <pre className="mt-2 max-h-36 overflow-auto rounded-lg border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(snapshot, null, 2)}
              </pre>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={quickAddScore}>
                  +5 分
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    clearGameStateStorage();
                    location.reload();
                  }}
                >
                  清除当前进度并重载
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 日志 */}
          <Card className="py-0">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium">日志 · {logs.length}</p>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onCopy}>
                    <Copy className="size-3.5" /> 复制
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClear}>
                    <Eraser className="size-3.5" /> 清空
                  </Button>
                </div>
              </div>
              <div className="mt-2 max-h-56 overflow-auto rounded-lg border bg-card p-2 font-mono text-[11px] leading-relaxed">
                {logs.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground">暂无日志</p>
                ) : (
                  logs.map((l, i) => (
                    <p key={i} className="border-b border-dashed py-1 last:border-0">
                      {l}
                    </p>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
              <X className="size-4" /> 关闭
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={onDeactivate}>
              <Power className="size-4" /> 退出调试
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
