import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db";

export const dynamic = "force-static";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
