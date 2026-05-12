import { NextResponse } from "next/server";
import { z } from "zod";
import { createTemplate, listTemplates } from "@/lib/db";

export const dynamic = "force-static";

const templateSchema = z.object({
  name: z.string().min(2),
  channel: z.enum(["email", "whatsapp"]),
  occasion: z.enum(["Eid Mubarak", "Christmas", "New Year", "birthday", "anniversary"]),
  subject: z.string().optional().nullable(),
  body: z.string().min(3),
});

export async function GET() {
  try {
    const templates = await listTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = templateSchema.parse(await request.json());
    const template = await createTemplate(payload);
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : (error as Error).message;
    return NextResponse.json({ error: message || "Invalid request" }, { status: 400 });
  }
}
