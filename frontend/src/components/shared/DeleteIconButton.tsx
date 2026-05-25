import type { ButtonHTMLAttributes } from "react";
import { Trash2 } from "lucide-react";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";
import { cn } from "@/lib/utils";

interface DeleteIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  isLoading?: boolean;
  label?: string;
  iconClassName?: string;
}

export function DeleteIconButton({
  className,
  iconClassName,
  isLoading = false,
  label = "Xóa",
  disabled,
  title = label,
  type = "button",
  ...props
}: DeleteIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={title}
      disabled={disabled || isLoading}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {isLoading ? <ButtonSpinner /> : <Trash2 className={cn("h-4 w-4", iconClassName)} />}
    </button>
  );
}
