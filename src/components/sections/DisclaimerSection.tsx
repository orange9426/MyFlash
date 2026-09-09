import { DisclaimerBody } from "@/components/DisclaimerBody";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DISCLAIMER_TITLE } from "@/lib/disclaimer";
import { useGameStore } from "@/lib/game/store";

export function DisclaimerSection() {
  const setView = useGameStore((s) => s.setView);
  const phase = useGameStore((s) => s.state.gamePhase);
  const goBack = () => {
    if (phase === "shop") setView("shop");
    else if (phase === "adventure") setView("game");
    else if (phase === "ended") setView("end");
    else setView("start");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{DISCLAIMER_TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">使用本站前请阅读。本声明不构成法律建议。</p>
      </div>

      <Card className="py-0">
        <CardContent className="p-4 sm:p-5">
          <DisclaimerBody />
        </CardContent>
      </Card>

      <Button variant="outline" onClick={goBack} className="min-w-24">
        返回
      </Button>
    </div>
  );
}
