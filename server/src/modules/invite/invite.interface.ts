import type { Role } from "@prisma/client";

export interface ICreateInvite {
  email: string;
  role?: Role;
}

export interface IAcceptInvite {
  name?: string;
  password?: string;
}
