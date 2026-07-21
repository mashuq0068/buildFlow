import { z } from "zod";

const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

const create = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1),
    startDate: dateString,
    endDate: dateString,
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
  }),
});

export const cycleValidation = { create, update };
