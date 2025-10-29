import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface PasswordInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  hideLabel?: string;
  showLabel?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      type = "password",
      hideLabel = "Hide password",
      showLabel = "Show password",
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const resolvedType = isVisible ? "text" : "password";

    return (
      <div className="relative flex w-full items-center">
        <Input
          ref={ref}
          type={resolvedType}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute inset-y-0 right-2 flex items-center text-neutral-500 transition-colors hover:text-neutral-700 focus:outline-none"
          aria-label={isVisible ? hideLabel : showLabel}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

