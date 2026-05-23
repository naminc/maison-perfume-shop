import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";

interface AuthSubmitButtonProps {
  isPending: boolean;
  pendingText: string;
  children: ReactNode;
}

export function AuthSubmitButton({ isPending, pendingText, children }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isPending}
      className="relative h-11 w-full rounded-xl bg-stone-900 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md active:scale-[0.99] disabled:opacity-70"
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <ButtonSpinner />
          {pendingText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
