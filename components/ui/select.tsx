import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-[#5D5344] bg-[#181715] px-3 py-2 text-sm text-[#F6F1E7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A76A]/70",
        className,
      )}
      {...props}
    />
  );
}
