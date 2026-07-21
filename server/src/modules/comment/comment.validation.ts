import { z } from "zod";

const attachmentInput = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  size: z.string().min(1),
  isImage: z.boolean().optional(),
});

const create = z.object({
  body: z.object({
    body: z.string().min(1),
    parentId: z.string().optional(),
    attachments: z.array(attachmentInput).optional(),
  }),
});

const update = z.object({
  body: z.object({
    body: z.string().min(1),
  }),
});

const react = z.object({
  body: z.object({
    emoji: z.string().min(1).max(8),
  }),
});

export const commentValidation = { create, update, react };
