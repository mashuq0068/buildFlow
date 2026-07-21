import { z } from "zod";

const create = z.object({
  body: z.object({
    body: z.string().min(1),
  }),
});

export const projectChatValidation = { create };
