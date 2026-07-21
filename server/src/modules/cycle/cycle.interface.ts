export interface ICreateCycle {
  name: string;
  description?: string;
  projectId: string;
  startDate: string;
  endDate: string;
}

export interface IUpdateCycle {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}
