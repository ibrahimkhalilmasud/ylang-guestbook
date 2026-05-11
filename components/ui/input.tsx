import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#5D5344] bg-[#181715] px-3 py-2 text-sm text-[#F6F1E7] placeholder:text-[#A99F8C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A76A]/70",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
