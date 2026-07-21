import { z } from "zod";

const addMember = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    title: z.string().optional(),
    role: z.enum(["ADMIN", "MEMBER"]).optional(),
  }),
});

const updateRole = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "MEMBER"]),
  }),
});

export const userValidation = { addMember, updateRole };
