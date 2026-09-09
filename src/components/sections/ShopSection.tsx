import { Check, Dices, Home, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MAX_SCORE_REROLLS, shopItems } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import type { Inventory, ShopItem } from "@/lib/game/types";
import { cn } from "@/lib/utils";

function inventoryCount(inv: Inventory, item: ShopItem): number {
  switch (item.type) {
    case "skip":
      return inv.skip;
    case "restore":
      return inv.restore;
    case "delayStrip":
      return inv.delayStrip;
    case "riskDouble":
      return inv.riskDouble;
    default:
      return 0;
  }
}

export function ShopSection() {
  const score = useGameStore((s) => s.state.score);
  const inventory = useGameStore((s) => s.state.inventory);
  const clothing = useGameStore((s) => s.state.clothing);
  const owned = useGameStore((s) => s.state.owned);
  const mode = useGameStore((s) => s.state.mode);
  const persona = useGameStore((s) => s.state.persona);
  const buyItem = useGameStore((s) => s.buyItem);
  const returnItem = useGameStore((s) => s.returnItem);
  const canBuyItem = useGameStore((s) => s.canBuyItem);
  const startAdventure = useGameStore((s) => s.startAdventure);
  const restartGame = useGameStore((s) => s.restartGame);
  const requestConfirm = useGameStore((s) => s.requestConfirm);
  const rerollShopScore = useGameStore((s) => s.rerollShopScore);
  const scoreRerollsUsed = useGameStore((s) => s.state.scoreRerollsUsed);
  const rerollsLeft = Math.max(0, MAX_SCORE_REROLLS - scoreRerollsUsed);

  const handleBuy = (itemId: string, price: number, name: string) => {
    const ok = buyItem(itemId, price);
    if (ok) toast.success(`已购入：${name}`);
    else if (score < price) toast.error("积分不足");
    else toast.error("无法购买");
  };

  const handleReturn = (item: (typeof shopItems)[number]) => {
    if (returnItem(item.id)) toast.success(`已退货：${item.name}`);
  };

  const canStart = clothing["长裤"];
  const clothingItems = shopItems.filter((i) => i.type === "clothing");
  const visibleConsumables = shopItems.filter((i) => i.type !== "clothing");

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight">用积分兑换你的初始穿戴</h1>
          {mode === "hell" && (
            <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold leading-none text-background">
              地狱
            </span>
          )}
          {persona === "female" && (
            <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none">
              母狗
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-3">
          <span className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums tracking-tight">{score}</span>
            <span className="text-sm font-medium text-muted-foreground">积分</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={rerollsLeft <= 0}
            onClick={() => {
              if (rerollShopScore()) toast.success("积分已重新随机，已购商品已退回");
              else toast.error("无法再随机");
            }}
          >
            <Dices className="size-3.5" />
            {rerollsLeft > 0 ? `重新随机（剩${rerollsLeft}次）` : "已用完"}
          </Button>
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-medium text-muted-foreground">衣物</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {clothingItems.map((item) => {
            const { disabled, label } = canBuyItem(item.id, item.price);
            const worn = !!clothing[item.clothingKey!];
            const hasItem = !!owned[item.clothingKey!];
            const isRequired = !!item.required;
            return (
              <Card key={item.id} className={cn("py-0", worn && "border-foreground/20 bg-muted/30")}>
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm font-medium">{item.name}</span>
                    {isRequired && (
                      <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold leading-none text-background">
                        必选
                      </span>
                    )}
                    {!hasItem && !isRequired && (
                      <span className="text-[10px] text-muted-foreground">未拥有</span>
                    )}
                    {worn && <Check className="size-3.5 text-foreground" />}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs tabular-nums">{item.price}</span>
                    {worn ? (
                      isRequired ? (
                        <Button variant="ghost" size="sm" disabled className="h-8 px-3">
                          已选
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => handleReturn(item)}>
                          <RotateCcw className="size-3.5" />
                        </Button>
                      )
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 px-4"
                        disabled={disabled}
                        onClick={() => handleBuy(item.id, item.price, item.name)}
                      >
                        {label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-medium text-muted-foreground">道具</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleConsumables.map((item) => {
            const { disabled, label } = canBuyItem(item.id, item.price);
            const count = inventoryCount(inventory, item);
            const held = count > 0;
            return (
              <Card key={item.id} className="py-0">
                <CardContent className="flex items-start justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      {held && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-xs">×{count}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs tabular-nums">{item.price}</span>
                    <Button
                      size="sm"
                      className="h-8 px-4"
                      variant={held ? "outline" : "default"}
                      disabled={disabled}
                      onClick={() => handleBuy(item.id, item.price, item.name)}
                    >
                      {label}
                    </Button>
                    {held && (
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleReturn(item)}>
                        <RotateCcw className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="space-y-2">
        <Button
          size="lg"
          className="h-12 w-full text-base font-semibold"
          disabled={!canStart}
          onClick={() => {
            if (!startAdventure()) toast.error("需先购买长裤");
          }}
        >
          {canStart ? "准备出门" : "需购买长裤"}
        </Button>
        <Button
          variant="ghost"
          className="h-10 w-full text-muted-foreground"
          onClick={async () => {
            const ok = await requestConfirm(
              "离开商店将结束本局。再次开始时积分会重新随机。",
              { yesText: "确认离开", noText: "继续购物" },
            );
            if (ok) restartGame();
          }}
        >
          <Home className="size-4" /> 返回主页
        </Button>
      </div>
    </div>
  );
}
