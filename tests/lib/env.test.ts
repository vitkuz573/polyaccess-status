import { describe, it, expect } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const originalEnv = process.env;

describe("env validation", () => {
  it("validates missing required variables", async () => {
    process.env = { ...originalEnv, DATABASE_URL: "", ADMIN_API_KEY: "" };
    await expect(import("@/lib/env")).rejects.toThrow(/DATABASE_URL/);
  });
});
