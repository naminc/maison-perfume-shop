import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {pendingText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
