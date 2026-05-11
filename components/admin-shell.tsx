"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/guests", label: "Guests" },
  { href: "/stays", label: "Stays" },
  { href: "/templates", label: "Templates" },
  { href: "/greetings", label: "Greetings" },
  { href: "/reports", label: "Exports" },
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2f271c_0,#111_55%)] text-[#F6F1E7]">
      <header className="border-b border-[#473f33] bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs tracking-[0.25em] text-[#C8A76A]">YLANG GUEST VAULT</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <Button variant="outline" onClick={logout}>Log out</Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm font-medium transition",
                pathname === link.href
                  ? "bg-[#C8A76A] text-[#1C1A17]"
                  : "bg-[#1D1B18] text-[#F6F1E7] hover:bg-[#2A2722]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
