import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * HellAmbience — 地狱模式氛围
 * 楼道底部炉火 + 纸页灼角 + 余烬/灰烬。弱、慢、只在页缘提示，不抢阅读。
 */

type Cinder = {
  left: string;
  delay: string;
  duration: string;
  size: number;
  kind: "spark" | "ash";
  rise: number;
  sway: number;
};

const CINDERS: Cinder[] = [
  { left: "4%", delay: "0s", duration: "9.5s", size: 2.2, kind: "spark", rise: 76, sway: 10 },
  { left: "12%", delay: "3.2s", duration: "14s", size: 4.6, kind: "ash", rise: 38, sway: -16 },
  { left: "19%", delay: "1.1s", duration: "11s", size: 2, kind: "spark", rise: 64, sway: 14 },
  { left: "28%", delay: "5.4s", duration: "16s", size: 3.6, kind: "ash", rise: 32, sway: 12 },
  { left: "41%", delay: "0.7s", duration: "10.2s", size: 1.8, kind: "spark", rise: 48, sway: -8 },
  { left: "53%", delay: "2.6s", duration: "12.4s", size: 2.4, kind: "spark", rise: 80, sway: 7 },
  { left: "64%", delay: "4.0s", duration: "15s", size: 5.2, kind: "ash", rise: 36, sway: -14 },
  { left: "73%", delay: "1.7s", duration: "10.8s", size: 2, kind: "spark", rise: 62, sway: 16 },
  { left: "82%", delay: "0.4s", duration: "13.2s", size: 3.4, kind: "ash", rise: 44, sway: 9 },
  { left: "90%", delay: "3.8s", duration: "11.6s", size: 2.1, kind: "spark", rise: 72, sway: -11 },
  { left: "96%", delay: "2.1s", duration: "14.6s", size: 1.7, kind: "spark", rise: 42, sway: 6 },
];

export function HellBorderEffect({ active }: { active: boolean }) {
  return (
    <div className={cn("hell-ambience", active && "is-on")} aria-hidden="true">
      <div className="hell-heat" />
      <div className="hell-haze" />
      <div className="hell-corners" />
      <div className="hell-vignette" />
      <div className="hell-grain" />
      <div className="hell-embers">
        {CINDERS.map((c, i) => (
          <span
            key={i}
            className={cn("hell-cinder", c.kind === "ash" && "is-ash")}
            style={
              {
                left: c.left,
                width: c.size,
                height: c.kind === "ash" ? c.size * 1.45 : c.size,
                animationDelay: c.delay,
                animationDuration: c.duration,
                "--rise": `${c.rise}vh`,
                "--sway": `${c.sway}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
