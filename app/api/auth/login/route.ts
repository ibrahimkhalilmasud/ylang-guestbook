import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import type { Role } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const users = (process.env.ADMIN_USERS || "")
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((entry) => {
      const [entryEmail, entryPassword, role] = entry.split(":");
      return { email: entryEmail?.toLowerCase(), password: entryPassword, role: (role as Role) || "manager" };
    });

  const account = users.find((user) => user.email === email && user.password === password);
  if (!account || !account.email) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(account.email, account.role);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
