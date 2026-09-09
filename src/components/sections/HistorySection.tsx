import { useEffect } from "react";
import { ArchiveX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loadHistoryFromStorage } from "@/lib/game/storage";
import { useGameStore } from "@/lib/game/store";

export function HistorySection() {
  const history = useGameStore((s) => s.history);
  const setView = useGameStore((s) => s.setView);
  const phase = useGameStore((s) => s.state.gamePhase);

  useEffect(() => {
    useGameStore.setState({ history: loadHistoryFromStorage() });
  }, []);

  const backView = phase === "ended" ? "end" : "start";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">历史记录</h1>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="grid size-10 place-items-center rounded-full border bg-muted">
                <ArchiveX className="size-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-medium">暂无记录</p>
              <p className="max-w-[32ch] text-xs text-muted-foreground">完成一局后自动归档于此</p>
              <Button size="sm" onClick={() => setView("start")}>
                开始游戏
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">编号</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>模式</TableHead>
                    <TableHead>得分</TableHead>
                    <TableHead>最高层</TableHead>
                    <TableHead>完成</TableHead>
                    <TableHead>标记</TableHead>
                    <TableHead>剩余</TableHead>
                    <TableHead>结局</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((r, i) => (
                    <TableRow key={`${r.timestamp}-${i}`}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{String(i + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.timestamp}
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.mode === "hell" ? "地狱" : "普通"}
                        {r.persona === "female" ? " · 母狗" : " · 公狗"}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold tabular-nums">
                        {r.finalScore}
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">{r.maxFloor}</TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">
                        {r.tasksCompleted}
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">
                        {r.urineMarks ?? 0}
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">
                        {r.remainingClothes}
                      </TableCell>
                      <TableCell className="max-w-[240px] whitespace-pre-line text-xs leading-relaxed">
                        {r.ending}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setView(backView)} className="min-w-24">
          返回
        </Button>
      </div>
    </div>
  );
}
