import { NextResponse } from "next/server";
import { z } from "zod";
import { createGreeting, listGreetings } from "@/lib/db";

export const dynamic = "force-static";

const greetingSchema = z.object({
  guest_id: z.string().uuid(),
  template_id: z.string().uuid(),
  send_at: z.string(),
  channel: z.enum(["email", "whatsapp"]),
  status: z.enum(["draft", "scheduled", "sent"]).optional(),
});

export async function GET() {
  try {
    const greetings = await listGreetings();
    return NextResponse.json(greetings);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = greetingSchema.parse(await request.json());
    const greeting = await createGreeting(payload);
    return NextResponse.json(greeting, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : (error as Error).message;
    return NextResponse.json({ error: message || "Invalid request" }, { status: 400 });
  }
}
