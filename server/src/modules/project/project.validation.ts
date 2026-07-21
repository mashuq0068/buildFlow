import { z } from "zod";

const create = z.object({
  body: z.object({
    name: z.string().min(1),
    summary: z.string().optional(),
    teamId: z.string().min(1),
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    summary: z.string().optional(),
  }),
});

export const projectValidation = { create, update };
