import { cn } from "@/lib/utils";

interface StampProps {
  text: string;
  /** red = 档案红印章（默认）；ember = 警示灯色 */
  tone?: "red" | "ember";
  /** 入场时播放盖章动画 */
  animate?: boolean;
  className?: string;
}

/** 档案红印章 —— 判决、必购等仪式性时刻使用 */
export function Stamp({
  text,
  tone = "red",
  animate = false,
  className,
}: StampProps) {
  return (
    <span
      className={cn(
        "stamp",
        tone === "ember" && "!text-primary",
        animate && "stamp-animate",
        className,
      )}
    >
      {text}
    </span>
  );
}
