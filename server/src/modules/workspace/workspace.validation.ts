import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers, and hyphens");

const create = z.object({
  body: z.object({
    name: z.string().min(1),
    slug,
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    slug: slug.optional(),
  }),
});

export const workspaceValidation = { create, update };
