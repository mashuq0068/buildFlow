import { z } from "zod";

const create = z.object({
  body: z.object({
    name: z.string().min(1),
    key: z.string().min(1).max(6),
    workspaceId: z.string().min(1),
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    key: z.string().min(1).max(6).optional(),
  }),
});

export const teamValidation = { create, update };
