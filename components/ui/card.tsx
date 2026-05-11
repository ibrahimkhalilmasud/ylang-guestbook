import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-[#4F463A] bg-[#151412]/95 p-5", className)} {...props} />;
}
