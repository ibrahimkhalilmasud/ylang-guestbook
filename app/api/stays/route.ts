import { NextResponse } from "next/server";
import { z } from "zod";
import { createStay, listStays } from "@/lib/db";

export const revalidate = 1;

const staySchema = z.object({
  guest_id: z.string().uuid(),
  arrival_date: z.string(),
  departure_date: z.string(),
  villa_room: z.string().min(2),
  booking_source: z.string().min(2),
  travel_agent: z.string().optional().nullable(),
  total_spend: z.coerce.number().min(0),
});

export async function GET() {
  try {
    const stays = await listStays();
    return NextResponse.json(stays);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = staySchema.parse(await request.json());
    const stay = await createStay(payload);
    return NextResponse.json(stay, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : (error as Error).message;
    return NextResponse.json({ error: message || "Invalid request" }, { status: 400 });
  }
}
