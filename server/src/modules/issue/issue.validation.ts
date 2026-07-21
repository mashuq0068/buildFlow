import { z } from "zod";

const statusEnum = z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELED"]);
const priorityEnum = z.enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"]);
const labelInput = z.object({ name: z.string().min(1), color: z.string().min(1) });

const create = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1),
    assigneeId: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    cycleId: z.string().optional(),
    parentId: z.string().optional(),
    labels: z.array(labelInput).optional(),
    aiSuggestedLabels: z.array(z.string()).optional(),
    aiSuggestedReasoning: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    assigneeId: z.string().nullable().optional(),
    cycleId: z.string().nullable().optional(),
    labels: z.array(labelInput).optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: statusEnum,
  }),
});

const aiSuggest = z.object({
  body: z.object({
    title: z.string().min(1),
  }),
});

const reorder = z.object({
  body: z.object({
    projectId: z.string().min(1),
    status: statusEnum,
    orderedIds: z.array(z.string().min(1)).min(1),
  }),
});

export const issueValidation = { create, update, updateStatus, aiSuggest, reorder };
