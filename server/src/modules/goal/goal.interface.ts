export interface ICreateGoal {
  title: string;
  description?: string;
  projectId: string;
  ownerId?: string;
  targetDate: string;
}

export interface IUpdateGoal {
  title?: string;
  description?: string;
  ownerId?: string | null;
  targetDate?: string;
}
