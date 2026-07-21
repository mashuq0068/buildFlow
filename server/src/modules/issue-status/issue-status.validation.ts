import { z } from "zod";

const categoryEnum = z.enum(["BACKLOG", "UNSTARTED", "STARTED", "COMPLETED", "CANCELED"]);

const create = z.object({
  body: z.object({
    name: z.string().min(1).max(30),
    color: z.string().min(1),
    icon: z.string().min(1).optional(),
    category: categoryEnum,
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).max(30).optional(),
    color: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    category: categoryEnum.optional(),
  }),
});

const reorder = z.object({
  body: z.object({
    orderedIds: z.array(z.string().min(1)).min(1),
  }),
});

export const issueStatusValidation = { create, update, reorder };
