import { z } from "zod";

const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

const create = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1),
    targetDate: dateString,
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    targetDate: dateString.optional(),
    completed: z.boolean().optional(),
  }),
});

export const milestoneValidation = { create, update };
