import { prisma } from "./db";
import { redis } from "./redis";
import { ComponentStatus } from "@prisma/client";

export type CheckResultPayload = {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  statusCode?: number;
  message?: string;
};

async function fetchHealth(target: string, timeoutMs: number): Promise<CheckResultPayload> {
  const start = Date.now();

  try {
    const res = await fetch(target, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json" },
    });
    const responseTime = Date.now() - start;

    if (!res.ok) {
      return { status: "down", responseTime, statusCode: res.status, message: `HTTP ${res.status}` };
    }

    const body = await res.json().catch(() => null);
    return { status: "up", responseTime, statusCode: res.status, message: body ? "Healthy" : "No body" };
  } catch (err) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      message: err instanceof Error ? err.message : "Request failed",
    };
  }
}

async function fetchChallengeProxyHealth(
  target: string,
  timeoutMs: number
): Promise<CheckResultPayload> {
  const result = await fetchHealth(target, timeoutMs);
  if (result.status !== "up") return result;

  try {
    const res = await fetch(target, { headers: { Accept: "application/json" } });
    const body = await res.json();
    const providers = body.providers as Record<string, { healthy: boolean; status?: string }> | undefined;
    if (!providers) return { ...result, status: "up" };

    const values = Object.values(providers);
    const down = values.filter((p) => !p.healthy).length;
    if (down === 0) return { ...result, status: "up", message: "All providers healthy" };
    if (down === values.length) return { ...result, status: "down", message: `All ${values.length} providers down` };
    return { ...result, status: "degraded", message: `${down} of ${values.length} providers down` };
  } catch {
    return { ...result, status: "up" };
  }
}

export async function runCheck(checkId: string): Promise<CheckResultPayload> {
  const check = await prisma.check.findUnique({
    where: { id: checkId },
    include: { component: true },
  });
  if (!check) throw new Error("Check not found");

  const payload =
    check.type === "challenge_proxy_health"
      ? await fetchChallengeProxyHealth(check.target, check.timeout * 1000)
      : await fetchHealth(check.target, check.timeout * 1000);

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

  await redis.publish("status:updates", JSON.stringify({ componentId: check.componentId, status: payload.status }));

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
