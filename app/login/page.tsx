"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function getSafeNextPath() {
    if (typeof window === "undefined") return null;
    const nextPath = new URLSearchParams(window.location.search).get("next");
    if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) return null;
    return nextPath;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error || "Login failed");
      setLoading(false);
      return;
    }

    const nextPath = getSafeNextPath();
    router.push(nextPath || "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#2f271c_0,#111_55%)] p-4 text-[#F6F1E7]">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-full max-w-md space-y-5">
          <div>
            <p className="text-xs tracking-[0.25em] text-[#C8A76A]">WELCOME</p>
            <h1 className="font-heading text-3xl">Ylang Guest Vault</h1>
            <p className="text-sm text-[#BDAF95]">Secure admin login</p>
          </div>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ylang.com" type="email" required />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" required />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
