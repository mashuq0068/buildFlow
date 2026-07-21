import type { StatusCategory } from "@prisma/client";

export interface ICreateStatusOption {
  name: string;
  color: string;
  icon?: string;
  category: StatusCategory;
}

export interface IUpdateStatusOption {
  name?: string;
  color?: string;
  icon?: string;
  category?: StatusCategory;
}
