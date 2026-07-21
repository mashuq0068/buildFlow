import { z } from "zod";

const priorityEnum = z.enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"]);

const create = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1),
    priority: priorityEnum.optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: priorityEnum.optional(),
  }),
});

export const draftValidation = { create, update };
