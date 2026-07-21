import { z } from "zod";

const statusEnum = z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELED"]);
const priorityEnum = z.enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"]);

const create = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1),
    creatorId: z.string().min(1),
    assigneeId: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    parentId: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    assigneeId: z.string().nullable().optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: statusEnum,
  }),
});

export const issueValidation = { create, update, updateStatus };
