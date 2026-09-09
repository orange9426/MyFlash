import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { WardrobeViewer } from "@/components/WardrobeFigurine";
import { Button } from "@/components/ui/button";
import { getPackingAdvice } from "@/lib/game/advisor";
import { useGameStore } from "@/lib/game/store";

export function BriefingSection() {
  const state = useGameStore((s) => s.state);
  const setView = useGameStore((s) => s.setView);
  const confirmDepart = useGameStore((s) => s.confirmDepart);

  const packing = state.missionPlan
    ? getPackingAdvice(
        state.missionPlan,
        state.owned,
        state.clothing,
        state.mode,
        state.startingFloor,
      )
    : null;

  const wear = packing?.wear ?? [];
  const bag = packing?.bag ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight">准备出门</h1>
        <div className="flex items-center gap-1">
          <WardrobeViewer clothing={state.clothing} owned={state.owned} />
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setView("shop")}>
            <ArrowLeft className="size-4" />
            商店
          </Button>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">穿着</h2>
        <div className="flex flex-wrap gap-1.5">
          {wear.length === 0 ? (
            <span className="text-sm text-muted-foreground">仅长裤以外均未穿</span>
          ) : (
            wear.map((item) => <Chip key={item.id} label={item.name} />)
          )}
        </div>
      </section>

      {bag.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">包里</h2>
          <div className="flex flex-wrap gap-1.5">
            {bag.map((item) => <Chip key={item.id} label={item.name} />)}
          </div>
        </section>
      )}

      <Button
        size="lg"
        className="h-12 w-full text-base font-semibold"
        onClick={() => {
          if (confirmDepart()) toast.success("已出发");
          else toast.error("需先购买长裤");
        }}
      >
        确认出门
      </Button>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-foreground/30 bg-muted/50 px-3 py-1.5 text-sm">
      {label}
    </span>
  );
}
