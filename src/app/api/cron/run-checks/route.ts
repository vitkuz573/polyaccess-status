import { NextRequest, NextResponse } from "next/server";
import { runAllChecks } from "@/lib/monitor";
import { env } from "@/lib/env";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : request.headers.get("x-admin-api-key");

  if (env.NODE_ENV === "production" && token !== env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await runAllChecks();
  return NextResponse.json({ ok: true, checksRun: count });
}
