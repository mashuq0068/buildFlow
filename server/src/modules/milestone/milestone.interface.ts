export interface ICreateMilestone {
  title: string;
  description?: string;
  projectId: string;
  targetDate: string;
}

export interface IUpdateMilestone {
  title?: string;
  description?: string;
  targetDate?: string;
  completed?: boolean;
}
