import { cn } from "@/lib/utils";

interface StairProgressProps {
  completed: number;
  total?: number;
  startingFloor?: number;
  /** 地狱任务层（内部楼层号，如 9、11） */
  hellFloors?: readonly number[];
  className?: string;
}

export function StairProgress({
  completed,
  total = 6,
  startingFloor = 1,
  hellFloors,
  className,
}: StairProgressProps) {
  const steps = Array.from({ length: total }, (_, i) => i);
  const current = Math.min(Math.max(0, completed), total);
  const hellSet = new Set(hellFloors ?? []);
  const stepRise = total > 10 ? 2.4 : 3;

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex items-end gap-[2px]"
        role="img"
        aria-label={
          hellFloors?.length
            ? `楼层 ${startingFloor} 至 ${startingFloor + total - 1}，共 ${total} 层，第 ${hellFloors.join("、")} 层为地狱任务`
            : `楼层 ${startingFloor} 至 ${startingFloor + total - 1}，共 ${total} 层`
        }
      >
        {steps.map((i) => {
          const lit = i < current;
          const isCurrent = i === current && current < total;
          const isHellTask = hellSet.has(i + 1);
          const height = 10 + i * stepRise + (isHellTask ? 6 : 0);
          const floor = startingFloor + i;
          return (
            <div
              key={i}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-stretch gap-1",
                isHellTask && "stair-hell-col",
              )}
            >
              <div
                style={{ height: `${height}px` }}
                className={cn(
                  "rounded-sm border",
                  isHellTask && "stair-step-hell stair-step-hell-gate",
                  isHellTask && lit && "is-lit",
                  isHellTask && isCurrent && "is-current",
                  !isHellTask && lit && "border-foreground/20 bg-foreground",
                  !isHellTask && isCurrent && "border-foreground bg-foreground",
                  !isHellTask && !lit && !isCurrent && "border-border bg-muted",
                )}
              />
              <span
                className={cn(
                  "truncate text-center text-[9px] leading-none tabular-nums sm:text-[10px]",
                  isCurrent && "font-medium text-foreground",
                  !isCurrent && isHellTask && "stair-end-hell",
                  !isCurrent && !isHellTask && "text-muted-foreground",
                )}
              >
                {floor}楼
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
