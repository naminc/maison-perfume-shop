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
      className="h-12 w-full rounded-lg bg-stone-900 text-white shadow-sm hover:bg-amber-800"
      disabled={isPending}
    >
      {isPending ? pendingText : children}
    </Button>
  );
}
