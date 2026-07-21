import { z } from "zod";

const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");
const statusEnum = z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"]);

const create = z.object({
  body: z.object({
    name: z.string().min(1),
    teamKey: z.string().min(1).max(6),
    color: z.string().optional(),
    summary: z.string().optional(),
    status: statusEnum.optional(),
    startDate: dateString.optional(),
    targetDate: dateString.optional(),
    workspaceId: z.string().min(1),
    leadId: z.string().optional(),
    memberUserIds: z.array(z.string()).optional(),
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    teamKey: z.string().min(1).max(6).optional(),
    color: z.string().optional(),
    summary: z.string().optional(),
    status: statusEnum.optional(),
    startDate: dateString.optional(),
    targetDate: dateString.optional(),
    leadId: z.string().nullable().optional(),
  }),
});

const addMembers = z.object({
  body: z.object({
    userIds: z.array(z.string().min(1)).min(1),
  }),
});

export const projectValidation = { create, update, addMembers };
