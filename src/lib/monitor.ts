import { prisma } from "./db";
import { redis } from "./redis";
import { ComponentStatus } from "@prisma/client";

export type CheckResultPayload = {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  statusCode?: number;
  message?: string;
};

function isProviderHealthBody(body: unknown): body is {
  providers?: Record<string, { healthy?: boolean; status?: string }>;
} {
  return typeof body === "object" && body !== null && "providers" in body;
}

async function fetchHealth(target: string, timeoutMs: number): Promise<CheckResultPayload> {
  const start = Date.now();

  try {
    const res = await fetch(target, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json" },
    });
    const responseTime = Date.now() - start;

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        status: "down",
        responseTime,
        statusCode: res.status,
        message: `HTTP ${res.status}`,
      };
    }

    // Challenge Proxy returns { providers: { ... } } with per-provider health.
    if (isProviderHealthBody(body)) {
      const providers = body.providers;
      const values = Object.values(providers ?? {});
      if (values.length === 0) {
        return { status: "up", responseTime, statusCode: res.status, message: "Healthy" };
      }
      const down = values.filter((p) => p.healthy === false).length;
      if (down === 0) {
        return { status: "up", responseTime, statusCode: res.status, message: "All providers healthy" };
      }
      if (down === values.length) {
        return {
          status: "down",
          responseTime,
          statusCode: res.status,
          message: `All ${values.length} providers down`,
        };
      }
      return {
        status: "degraded",
        responseTime,
        statusCode: res.status,
        message: `${down} of ${values.length} providers down`,
      };
    }

    return {
      status: "up",
      responseTime,
      statusCode: res.status,
      message: body ? "Healthy" : "No body",
    };
  } catch (err) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      message: err instanceof Error ? err.message : "Request failed",
    };
  }
}

export async function runCheck(checkId: string): Promise<CheckResultPayload> {
  const check = await prisma.check.findUnique({
    where: { id: checkId },
    include: { component: true },
  });
  if (!check) throw new Error("Check not found");

  const payload = await fetchHealth(check.target, check.timeout * 1000);

  await prisma.checkResult.create({
    data: {
      checkId: check.id,
      status: payload.status,
      responseTime: payload.responseTime,
      statusCode: payload.statusCode,
      message: payload.message,
      checkedAt: new Date(),
      region: "default",
    },
  });

  await aggregateComponentStatus(check.componentId);

  await redis.publish(
    "status:updates",
    JSON.stringify({ componentId: check.componentId, status: payload.status })
  );

  return payload;
}

export async function aggregateComponentStatus(componentId: string): Promise<ComponentStatus> {
  const checks = await prisma.check.findMany({
    where: { componentId, enabled: true },
    include: { results: { orderBy: { checkedAt: "desc" }, take: 1 } },
  });

  if (checks.length === 0) {
    await prisma.component.update({ where: { id: componentId }, data: { status: "operational" } });
    return "operational";
  }

  const latest = checks.map((c) => c.results[0]?.status).filter(Boolean);
  let status: ComponentStatus = "operational";
  if (latest.includes("down")) status = "major_outage";
  else if (latest.includes("degraded")) status = "degraded";

  await prisma.component.update({ where: { id: componentId }, data: { status } });
  return status;
}

export async function runAllChecks(): Promise<number> {
  const checks = await prisma.check.findMany({ where: { enabled: true } });
  await Promise.all(checks.map((c) => runCheck(c.id).catch(() => null)));
  return checks.length;
}
