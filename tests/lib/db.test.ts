import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db";

describe("database connection", () => {
  it("exports a prisma client", () => {
    expect(prisma).toBeDefined();
    expect(typeof (prisma as { $connect: () => Promise<void> }).$connect).toBe("function");
  });
});
