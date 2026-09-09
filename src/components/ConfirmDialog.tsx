import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGameStore } from "@/lib/game/store";

export function ConfirmDialog() {
  const confirmRequest = useGameStore((s) => s.confirmRequest);
  const resolveConfirm = useGameStore((s) => s.resolveConfirm);

  const open = !!confirmRequest;
  const options = confirmRequest?.options ?? {};
  const showNoButton = options.showNoButton !== false;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resolveConfirm(false);
      }}
    >
      <AlertDialogContent className="gap-5 sm:max-w-[440px]">
        <AlertDialogHeader className="gap-3 text-left">
          <AlertDialogTitle className="font-dossier text-base tracking-wide">
            请确认
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/80">
            {confirmRequest?.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          {showNoButton && (
            <AlertDialogCancel
              onClick={() => resolveConfirm(false)}
              className="h-10"
            >
              {options.noText ?? "否"}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={() => resolveConfirm(true)}
            className="h-10 bg-primary px-6 font-semibold"
          >
            {options.yesText ?? "是"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
