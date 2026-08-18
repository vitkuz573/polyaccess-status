import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { runAllChecks } from "@/lib/monitor";

export async function POST(): Promise<NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await runAllChecks();
  return NextResponse.json({ ok: true, checksRun: count });
}
