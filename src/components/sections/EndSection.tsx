import { Home } from "lucide-react";
import { Stamp } from "@/components/Stamp";
import { WardrobeFigurine } from "@/components/WardrobeFigurine";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CLOTHING_ITEMS, formatRunLabel, getWornClothingCount } from "@/lib/game/constants";
import { getDisplayFloor, useGameStore } from "@/lib/game/store";

export function EndSection() {
  const state = useGameStore((s) => s.state);
  const restartGame = useGameStore((s) => s.restartGame);
  const ending = state.resolvedEnding;
  const worn = getWornClothingCount(state);
  const totalClothes = CLOTHING_ITEMS.length;

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardContent className="p-6 text-center sm:p-7">
          <p className="text-xs text-muted-foreground">
            最终得分
            {state.mode === "hell" && (
              <span className="ml-1.5 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                地狱
              </span>
            )}
            {state.persona === "female" && (
              <span className="ml-1.5 rounded border px-1.5 py-0.5 text-[10px] font-bold">
                母狗
              </span>
            )}
          </p>
          <p className="mt-2 text-5xl font-semibold tabular-nums sm:text-6xl">{state.score}</p>

          <div className="relative mt-5 overflow-hidden rounded-xl border bg-muted/30 p-4 text-left sm:p-5">
            <Stamp text="已审判" animate className="float-right mb-1 ml-3 scale-90 text-xs" />
            <p className="whitespace-pre-line text-sm font-medium leading-relaxed sm:text-[15px]">
              {ending}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <WardrobeFigurine clothing={state.clothing} className="h-[132px] w-[112px] shrink-0" />
            <div className="min-w-0 flex-1 overflow-hidden rounded-lg border">
              <Table>
                <TableBody>
                  <Row label="模式" value={formatRunLabel(state.mode, state.persona)} />
                  <Row
                    label="最高楼层"
                    value={`${getDisplayFloor(state.maxFloor, state.startingFloor)} 层`}
                  />
                  <Row label="完成任务" value={`${state.tasksCompleted} 个`} />
                  {state.mode === "hell" && (
                    <Row label="地狱任务" value={`${state.hellTasksCompleted} 个`} />
                  )}
                  {state.urineMarks > 0 && <Row label="尿液标记" value={`${state.urineMarks} 次`} />}
                  <Row label="剩余衣物" value={`${worn} / ${totalClothes}`} />
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={restartGame}>
        <Home className="size-4" /> 回到主页
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <TableRow>
      <TableCell className="py-2.5 text-xs text-muted-foreground">{label}</TableCell>
      <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums">{value}</TableCell>
    </TableRow>
  );
}
