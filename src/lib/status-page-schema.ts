import { z } from "zod";

const hostnameRegex =
  /^(?!-)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.(?!-)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.?$/;

export const statusPageFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name must be 120 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(64, "Slug must be 64 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens only"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .nullable(),
  customDomain: z
    .string()
    .max(253, "Domain is too long")
    .regex(hostnameRegex, "Enter a valid domain name")
    .optional()
    .nullable(),
  isPublic: z.boolean(),
});

export type StatusPageFormInput = z.input<typeof statusPageFormSchema>;
export type StatusPageFormValues = z.output<typeof statusPageFormSchema>;
