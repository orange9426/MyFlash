import { useState } from "react";
import { DisclaimerBody } from "@/components/DisclaimerBody";
import { Button } from "@/components/ui/button";
import { DISCLAIMER_TITLE, saveDisclaimerAck } from "@/lib/disclaimer";
import { cn } from "@/lib/utils";

interface AgeGateProps {
  onAccepted: () => void;
  onDeclined: () => void;
}

export function AgeGate({ onAccepted, onDeclined }: AgeGateProps) {
  const [isAdult, setIsAdult] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const canEnter = isAdult && agreed;

  const accept = () => {
    if (!canEnter) return;
    saveDisclaimerAck();
    onAccepted();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[720px] flex-col px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">18+ 成人内容</p>
        <h1 className="mt-2 text-[28px] font-semibold leading-[1.05] tracking-tight sm:text-[34px]">
          进入前请确认
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          本站为虚构文字模拟，含成人向性描写。未成年人禁止访问。请先阅读声明，并确认你不会在公共场所实施任何违法或危险行为。
        </p>

        <div className="mt-6 max-h-[min(52vh,28rem)] overflow-y-auto rounded-xl border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-tight">{DISCLAIMER_TITLE}</h2>
          <DisclaimerBody className="mt-4" />
        </div>

        <div className="mt-5 space-y-3">
          <GateCheck
            checked={isAdult}
            onChange={setIsAdult}
            label="我已年满十八周岁，且所在地法律允许我浏览成人内容。"
          />
          <GateCheck
            checked={agreed}
            onChange={setAgreed}
            label="我已阅读并同意《免责声明与使用条款》，理解本站为虚构模拟，不会在现实公共场所实施暴露、性行为或其他违法、危险行为。"
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="h-11" onClick={onDeclined}>
            未满 18 周岁，离开
          </Button>
          <Button className="h-11 font-semibold sm:min-w-40" disabled={!canEnter} onClick={accept}>
            同意并进入
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AgeBlocked({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-lg font-semibold tracking-tight">本站仅向成年人开放</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          未满十八周岁不得访问本站。请关闭本页面。若误点，可返回重新确认。
        </p>
        <Button variant="outline" onClick={onBack}>
          返回
        </Button>
      </div>
    </div>
  );
}

function GateCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          "mt-0.5 size-4 shrink-0 rounded-sm border border-input accent-primary",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
        )}
      />
      <span>{label}</span>
    </label>
  );
}
