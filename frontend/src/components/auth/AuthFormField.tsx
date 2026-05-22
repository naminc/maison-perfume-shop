import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthFormFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  icon: LucideIcon;
  type?: ComponentProps<typeof Input>["type"];
  autoComplete?: string;
  placeholder?: string;
  labelAction?: ReactNode;
  revealLabel?: string;
  hideLabel?: string;
}

export function AuthFormField({
  id,
  label,
  registration,
  error,
  icon: Icon,
  type = "text",
  autoComplete,
  placeholder,
  labelAction,
  revealLabel = "Hiện mật khẩu",
  hideLabel = "Ẩn mật khẩu",
}: AuthFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <div className={cn("flex items-center", labelAction ? "justify-between" : "")}>
        <Label htmlFor={id} className="text-[0.8125rem] font-medium text-stone-700">
          {label}
        </Label>
        {labelAction}
      </div>

      <div className="relative">
        <Icon
          className={cn(
            "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
            error ? "text-red-400" : "text-stone-400",
          )}
        />
        <Input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(
            "h-11 rounded-xl border bg-white pl-10 text-sm shadow-none transition-all",
            "placeholder:text-stone-400",
            "focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-0 focus-visible:border-amber-500",
            isPassword && "pr-11",
            error
              ? "border-red-300 bg-red-50/50 focus-visible:border-red-400 focus-visible:ring-red-400/30"
              : "border-stone-200 hover:border-stone-300",
          )}
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label={showPassword ? hideLabel : revealLabel}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <span className="inline-block h-1 w-1 flex-shrink-0 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}
