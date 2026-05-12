import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { ROLE_VALUES, type Role } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const adminEmailSchema = z.string().email();

const validRoles = new Set<Role>(ROLE_VALUES);

function parseRole(role?: string): Role | null {
  if (role && validRoles.has(role as Role)) return role as Role;
  return null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsedBody = loginSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const email = parsedBody.data.email.trim().toLowerCase();
  const password = parsedBody.data.password;

  const users = (process.env.ADMIN_USERS || "")
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((entry) => {
      const [entryEmail, entryPassword, role] = entry.split(":");
      return { email: entryEmail?.toLowerCase(), password: entryPassword, role: parseRole(role) };
    })
    .filter(
      (entry): entry is { email: string; password: string; role: Role } =>
        typeof entry.email === "string" &&
        adminEmailSchema.safeParse(entry.email).success &&
        typeof entry.password === "string" &&
        entry.password.length > 0 &&
        entry.role !== null,
    );

  const account = users.find((user) => user.email === email && user.password === password);
  if (!account || !account.email) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(account.email, account.role);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
