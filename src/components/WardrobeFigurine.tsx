import * as React from "react";
import type { ClothingItem, OwnedInventory, Task } from "@/lib/game/types";
import { getWearAdvice, wearActionItems, wearActionLabel } from "@/lib/game/advisor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  VIEW_H,
  VIEW_W,
  buildMannequin,
  polyPoints,
  projectMannequin,
  type VolumeKind,
} from "@/components/wearMannequin";

const ALL_ITEMS: { key: ClothingItem; label: string }[] = [
  { key: "上衣", label: "上衣" },
  { key: "长裤", label: "长裤" },
  { key: "内裤", label: "内裤" },
  { key: "短袜", label: "短袜" },
  { key: "护膝", label: "护膝" },
];

const EQUIP_AS_DAI = new Set<ClothingItem>(["护膝"]);

function wearStatus(key: ClothingItem, on: boolean): string {
  if (EQUIP_AS_DAI.has(key)) return on ? "戴" : "不戴";
  return on ? "穿" : "不穿";
}

const DEFAULT_YAW = 22;

const LEFT_LABELS: ClothingItem[] = ["内裤"];
const RIGHT_LABELS: ClothingItem[] = ["上衣", "长裤", "护膝", "短袜"];

function layoutLabels(anchors: Record<ClothingItem, { x: number; y: number }>) {
  const gap = 24;
  const top = 18;
  const bottom = VIEW_H - 18;

  const pack = (keys: ClothingItem[], x: number, align: "start" | "end") => {
    const rows = keys
      .map((key) => ({
        key,
        x,
        y: Math.min(bottom, Math.max(top, anchors[key]?.y ?? VIEW_H / 2)),
        ax: anchors[key]?.x ?? VIEW_W / 2,
        ay: anchors[key]?.y ?? VIEW_H / 2,
        align,
      }))
      .sort((a, b) => a.y - b.y);

    for (let i = 1; i < rows.length; i++) {
      if (rows[i].y - rows[i - 1].y < gap) rows[i].y = rows[i - 1].y + gap;
    }
    const overflow = (rows.at(-1)?.y ?? 0) - bottom;
    if (overflow > 0) {
      for (const row of rows) row.y -= overflow;
    }
    if (rows[0] && rows[0].y < top) {
      const shift = top - rows[0].y;
      for (const row of rows) row.y += shift;
    }
    return rows;
  };

  return [
    ...pack(LEFT_LABELS, 108, "end"),
    ...pack(RIGHT_LABELS, VIEW_W - 108, "start"),
  ];
}

function volumeClass(kind: VolumeKind, tone?: "base"): string {
  if (tone === "base") return "fill-zinc-500 stroke-zinc-600 dark:fill-zinc-500 dark:stroke-zinc-400";
  switch (kind) {
    case "worn":
      return "fill-primary stroke-primary";
    case "idle":
      return "fill-zinc-400/80 stroke-zinc-500/50 dark:fill-zinc-500/70 dark:stroke-zinc-400/40";
    case "removed":
      return "fill-none stroke-destructive";
    case "face":
      return "fill-foreground/70 stroke-none";
    default:
      return "fill-foreground/40 stroke-none dark:fill-foreground/32";
  }
}

function WearFigure({
  clothing,
  className,
  showGround = true,
  annotate = false,
  compact = false,
}: {
  clothing: Record<ClothingItem, boolean>;
  className?: string;
  showGround?: boolean;
  annotate?: boolean;
  compact?: boolean;
}) {
  const view = React.useMemo(
    () =>
      projectMannequin(
        buildMannequin(),
        clothing,
        DEFAULT_YAW,
        compact ? { pad: 20 } : annotate ? { pad: 116 } : undefined,
      ),
    [clothing, compact, annotate],
  );
  const labels = annotate && !compact ? layoutLabels(view.anchors) : [];

  return (
    <div className={cn("relative", compact ? "h-full w-full" : "w-full", className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className={cn("select-none", compact ? "h-full w-full" : "block h-auto w-full")}
        role="img"
        aria-label={ALL_ITEMS.map((i) => `${i.label}（${wearStatus(i.key, clothing[i.key])}）`).join("，")}
        shapeRendering="geometricPrecision"
      >
        {showGround && (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polygon
              points={polyPoints(view.ground)}
              className="fill-muted stroke-border"
              strokeWidth={0.8}
            />
            <polygon points={polyPoints(view.shadow)} className="fill-foreground/10 stroke-none" />
          </g>
        )}

        <g strokeLinecap="round" strokeLinejoin="round">
          {view.parts.map((p) => (
            <polygon
              key={p.id}
              points={polyPoints(p.points)}
              className={volumeClass(p.kind, p.tone)}
              fillOpacity={p.tone === "base" ? 1 : p.kind === "worn" ? 0.82 : p.kind === "idle" ? 0.9 : 1}
              strokeWidth={p.kind === "worn" || p.kind === "idle" || p.tone === "base" ? 1.05 : 0}
            />
          ))}
        </g>

        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {view.wires.map((w, i) => (
            <polyline
              key={`wire-${w.item}-${i}`}
              points={polyPoints(w.points)}
              className={
                w.tone === "base"
                  ? "stroke-zinc-400 dark:stroke-zinc-500"
                  : w.worn
                    ? "stroke-primary"
                    : "stroke-zinc-400 dark:stroke-zinc-500"
              }
              strokeWidth={w.width ?? 1.2}
              strokeOpacity={0.95}
            />
          ))}
        </g>

        {annotate && (
          <g fontSize={12} fontWeight={500} style={{ fontFamily: "inherit" }}>
            {labels.map((row) => {
              const meta = ALL_ITEMS.find((i) => i.key === row.key);
              if (!meta) return null;
              const on = !!clothing[row.key];
              return (
                <g key={row.key}>
                  <line
                    x1={row.ax}
                    y1={row.ay}
                    x2={row.x}
                    y2={row.y}
                    fill="none"
                    className={on ? "stroke-primary/50" : "stroke-zinc-400/70"}
                    strokeWidth={0.9}
                  />
                  <circle
                    cx={row.ax}
                    cy={row.ay}
                    r={2.2}
                    className={on ? "fill-primary" : "fill-zinc-400 dark:fill-zinc-500"}
                  />
                  <text
                    x={row.x}
                    y={row.y}
                    textAnchor={row.align === "end" ? "end" : "start"}
                    dominantBaseline="central"
                    className={on ? "fill-primary" : "fill-zinc-500 dark:fill-zinc-400"}
                  >
                    {meta.label}（{wearStatus(row.key, on)}）
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}

export function WardrobeViewer({
  clothing,
  className,
  task = null,
  owned,
}: {
  clothing: Record<ClothingItem, boolean>;
  className?: string;
  task?: Task | null;
  owned?: OwnedInventory;
}) {
  const advice = owned ? getWearAdvice(task, clothing, owned) : null;
  const figureClothing = advice?.targetClothing ?? clothing;
  const actions = wearActionItems(advice);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          穿戴指示
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-3rem)] max-w-[480px] gap-3 p-4 sm:w-full sm:max-w-[460px]">
        <DialogHeader className="gap-1">
          <DialogTitle>穿戴指示</DialogTitle>
          <DialogDescription className="sr-only">
            {advice?.summary ?? "当前穿戴状态"}
          </DialogDescription>
        </DialogHeader>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {actions.map((item) => (
              <span
                key={`${item.item}-${item.verb}`}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1.5 text-sm",
                  item.tone === "missing"
                    ? "border-destructive/40 text-destructive"
                    : "border-foreground/30 bg-muted/50",
                )}
              >
                {wearActionLabel(item)}
              </span>
            ))}
          </div>
        )}
        <div className="rounded-lg border bg-card">
          <WearFigure clothing={figureClothing} annotate className="w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WardrobeFigurine({
  clothing,
  className,
}: {
  clothing: Record<ClothingItem, boolean>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-lg border bg-card",
        className,
      )}
    >
      <WearFigure clothing={clothing} compact showGround={false} className="h-full w-full" />
    </div>
  );
}
