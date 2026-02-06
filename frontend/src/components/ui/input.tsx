import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-rose-100 bg-white px-4 text-sm text-ink-800 placeholder:text-ink-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
