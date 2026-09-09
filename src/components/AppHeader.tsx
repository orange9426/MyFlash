import { BookOpenText, History, Moon, ScrollText, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useGameStore } from "@/lib/game/store";

interface AppHeaderProps {
  debugActive: boolean;
  onTitleClick: () => void;
}

export function AppHeader({ debugActive, onTitleClick }: AppHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const view = useGameStore((s) => s.view);
  const setView = useGameStore((s) => s.setView);
  const phase = useGameStore((s) => s.state.gamePhase);
  const isDark = resolvedTheme === "dark";
  const canViewHistory = phase === "initial" || phase === "ended";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-[56px] max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onTitleClick}
            className="flex shrink-0 items-center gap-2.5 text-left"
            aria-label="楼道暴露挑战首页"
          >
            <span className="text-[16px] font-semibold tracking-tight">楼道暴露挑战</span>
            {debugActive && (
              <span className="rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-white">
                DEBUG
              </span>
            )}
          </button>
          <a
            href="https://x.com/dehaxer"
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:text-xs"
          >
            by 狐狸不会跳水
          </a>
        </div>

        <div className="flex items-center gap-1">
          {/* 桌面端直接显示 */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="主导航">
            <Button
              variant={view === "rules" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setView("rules")}
            >
              规则
            </Button>
            <Button
              variant={view === "disclaimer" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setView("disclaimer")}
            >
              声明
            </Button>
            {canViewHistory && (
              <Button
                variant={view === "history" ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setView("history")}
              >
                历史记录
              </Button>
            )}
          </nav>

          {/* 移动端：规则/历史记录收进下拉，避免标题行换行 */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="菜单">
                  <BookOpenText className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setView("rules")}>
                  <BookOpenText className="size-4" /> 规则
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("disclaimer")}>
                  <ScrollText className="size-4" /> 免责声明
                </DropdownMenuItem>
                {canViewHistory && (
                  <DropdownMenuItem onClick={() => setView("history")}>
                    <History className="size-4" /> 历史记录
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative size-8"
            aria-label={isDark ? "切换为浅色模式" : "切换为深色模式"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
