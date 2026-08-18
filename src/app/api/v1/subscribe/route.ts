import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const subscribeSchema = z.object({
  channel: z.literal("email"),
  target: z.string().email(),
  slug: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }

  const { channel, target, slug } = parsed.data;

  const statusPage = await prisma.statusPage.findUnique({
    where: { slug },
  });

  if (!statusPage || !statusPage.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const normalizedTarget = target.toLowerCase().trim();

  try {
    await prisma.subscriber.create({
      data: {
        channel,
        target: normalizedTarget,
        statusPageId: statusPage.id,
        active: true,
        verified: false,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ ok: true, message: "Already subscribed" });
    }
    throw err;
  }

  return NextResponse.json({ ok: true, message: "Subscribed successfully" });
}
