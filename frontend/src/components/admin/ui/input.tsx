import * as React from "react";
import { cn } from "@/lib/utils";

const AdminInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-admin-input
        className={cn(
          "flex h-9 w-full rounded-md border border-stone-300 bg-background px-3 text-sm shadow-sm outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-stone-400 focus:!border-primary focus-visible:!border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

AdminInput.displayName = "AdminInput";

export { AdminInput, AdminInput as Input };
