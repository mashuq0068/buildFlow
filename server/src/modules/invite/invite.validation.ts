import { z } from "zod";

const create = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(["ADMIN", "MEMBER"]).optional(),
  }),
});

const accept = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
  }),
});

export const inviteValidation = { create, accept };
