import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
