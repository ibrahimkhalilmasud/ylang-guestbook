import { NextResponse } from "next/server";
import { z } from "zod";
import { createGuest, listGuests } from "@/lib/db";

export const dynamic = "force-static";

const guestSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(5),
  whatsapp_number: z.string().min(5),
  email: z.email(),
  country: z.string().min(2),
  nationality: z.string().min(2),
  preferred_language: z.string().min(2),
  date_of_birth: z.string().optional().nullable(),
  anniversary: z.string().optional().nullable(),
  passport: z.string().optional().nullable(),
  dietary_preferences: z.string().optional().nullable(),
  room_preferences: z.string().optional().nullable(),
  special_notes: z.string().optional().nullable(),
  vip_status: z.boolean().optional(),
  tags: z
    .array(
      z.enum([
        "VIP",
        "honeymoon",
        "family",
        "influencer",
        "returning guest",
        "corporate",
        "anniversary guest",
      ]),
    )
    .optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guests = await listGuests({
      q: searchParams.get("q") || undefined,
      nationality: searchParams.get("nationality") || undefined,
      vip: searchParams.get("vip") || undefined,
      repeat: searchParams.get("repeat") || undefined,
    });
    return NextResponse.json(guests);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = guestSchema.parse(await request.json());
    const guest = await createGuest(payload);
    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : (error as Error).message;
    return NextResponse.json({ error: message || "Invalid request" }, { status: 400 });
  }
}
