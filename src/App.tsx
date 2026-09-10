import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AgeBlocked, AgeGate } from "@/components/AgeGate";
import { AppHeader } from "@/components/AppHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DebugTerminal } from "@/components/DebugTerminal";
import { HellBorderEffect } from "@/components/HellBorderEffect";
import { BriefingSection } from "@/components/sections/BriefingSection";
import { DisclaimerSection } from "@/components/sections/DisclaimerSection";
import { EndSection } from "@/components/sections/EndSection";
import { GameSection } from "@/components/sections/GameSection";
import { HistorySection } from "@/components/sections/HistorySection";
import { RulesSection } from "@/components/sections/RulesSection";
import { ShopSection } from "@/components/sections/ShopSection";
import { StartSection } from "@/components/sections/StartSection";
import { TaskEditorSection } from "@/components/sections/TaskEditorSection";
import { useTheme } from "@/components/theme-provider";
import { useDebugMode } from "@/hooks/useDebugMode";
import { loadDisclaimerAck } from "@/lib/disclaimer";
import { useGameStore } from "@/lib/game/store";
import { cn } from "@/lib/utils";

type AccessState = "gate" | "blocked" | "ok";

function App() {
  const view = useGameStore((s) => s.view);
  const setView = useGameStore((s) => s.setView);
  const hydrate = useGameStore((s) => s.hydrate);
  const mode = useGameStore((s) => s.state.mode);
  const hellPreview = useGameStore((s) => s.hellPreview);
  const hellActive = mode === "hell" || hellPreview;
  const debug = useDebugMode();
  const { resolvedTheme } = useTheme();
  const [access, setAccess] = useState<AccessState>(() =>
    loadDisclaimerAck() ? "ok" : "gate",
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view, access]);

  if (access === "blocked") {
    return <AgeBlocked onBack={() => setAccess("gate")} />;
  }

  if (access === "gate") {
    return (
      <AgeGate
        onAccepted={() => setAccess("ok")}
        onDeclined={() => setAccess("blocked")}
      />
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen relative transition-[background-color] duration-700",
        hellActive ? "hell-ui" : "bg-background",
      )}
    >
      <HellBorderEffect active={hellActive} />
      <AppHeader debugActive={debug.active} onTitleClick={debug.handleTitleClick} />

      <div className="relative z-10 mx-auto max-w-[720px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <main key={view} className="view-enter">
          {view === "start" && <StartSection />}
          {view === "taskEditor" && <TaskEditorSection />}
          {view === "rules" && <RulesSection />}
          {view === "disclaimer" && <DisclaimerSection />}
          {view === "shop" && <ShopSection />}
          {view === "briefing" && <BriefingSection />}
          {view === "game" && <GameSection />}
          {view === "end" && <EndSection />}
          {view === "history" && <HistorySection />}
        </main>

        <footer className="mt-10 border-t pt-4 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            18+ 成人内容。虚构模拟，请遵守法律，切勿在公共场所实施。感到不适请立即停止。
          </p>
          <button
            type="button"
            onClick={() => setView("disclaimer")}
            className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            免责声明
          </button>
          <p className="mt-2 text-xs text-muted-foreground">v3.2</p>
        </footer>
      </div>

      <ConfirmDialog />
      <Toaster position="top-center" richColors closeButton theme={resolvedTheme} />
      <DebugTerminal
        visible={debug.visible}
        logs={debug.logs}
        onClear={debug.clearLogs}
        onClose={debug.hideTerminal}
        onCopy={debug.copyLogs}
        onDeactivate={debug.deactivate}
      />
    </div>
  );
}

export default App;
