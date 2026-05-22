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

const inputClassName = "h-12 rounded-lg border-input bg-stone-50 pl-10";

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
    <div className="space-y-2">
      <div className={labelAction ? "flex items-center justify-between" : undefined}>
        <Label htmlFor={id} className="text-stone-700">{label}</Label>
        {labelAction}
      </div>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(inputClassName, isPassword && "pr-11")}
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-stone-500 hover:bg-stone-100"
            aria-label={showPassword ? hideLabel : revealLabel}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
