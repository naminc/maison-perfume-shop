import * as React from "react";
import { cn } from "@/lib/utils";

const AdminTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-admin-input
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-stone-300 bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-stone-400 focus:!border-primary focus-visible:!border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

AdminTextarea.displayName = "AdminTextarea";

export { AdminTextarea, AdminTextarea as Textarea };
