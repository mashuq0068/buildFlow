import type { Role } from "@prisma/client";

export interface IAddMemberInput {
  name: string;
  email: string;
  title?: string;
  role?: Role;
}
