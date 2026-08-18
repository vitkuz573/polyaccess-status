import { z } from "zod";
import { ComponentStatus } from "@prisma/client";

const componentStatusValues = Object.values(ComponentStatus) as [ComponentStatus, ...ComponentStatus[]];

const checkSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Check name is required"),
  type: z.enum(["http", "heartbeat"]),
  target: z.string().min(1, "Target is required"),
  timeout: z.number().int().min(1, "Timeout must be at least 1 second").max(300, "Timeout must be at most 300 seconds"),
  interval: z.number().int().min(5, "Interval must be at least 5 seconds").max(86400, "Interval must be at most 86400 seconds"),
  expectedStatus: z.number().int().min(100).max(599).optional().nullable(),
  method: z.enum(["GET", "POST", "HEAD"]),
  headers: z.string().optional().nullable(),
  enabled: z.boolean(),
});

export const componentFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name must be 120 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
  groupId: z.string().optional().nullable(),
  newGroupName: z.string().max(120).optional().nullable(),
  position: z.number().int(),
  statusOverride: z.enum(componentStatusValues).optional().nullable(),
  active: z.boolean(),
  checks: z.array(checkSchema).min(1, "At least one health check is required"),
});

export type ComponentFormInput = z.input<typeof componentFormSchema>;
export type ComponentFormValues = z.output<typeof componentFormSchema>;
