import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#8D7A58] bg-[#2A241C] px-3 py-1 text-xs font-semibold text-[#EAD4A4]",
        className,
      )}
      {...props}
    />
  );
}
