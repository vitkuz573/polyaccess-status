import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  void request;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("data: connected\n\n"));

      const handler = (channel: string, message: string) => {
        if (channel === "status:updates") {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        }
      };

      redis.subscribe("status:updates", (err) => {
        if (err) controller.close();
      });
      redis.on("message", handler);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode("data: ping\n\n"));
      }, 30000);

      const cleanup = () => {
        clearInterval(keepAlive);
        redis.unsubscribe("status:updates");
        redis.off("message", handler);
        controller.close();
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (controller as any).cleanup = cleanup;
    },
    cancel(controller) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanup = (controller as any).cleanup as (() => void) | undefined;
      cleanup?.();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
