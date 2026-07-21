export interface ICreateTeam {
  name: string;
  key: string;
  workspaceId: string;
}

export interface IUpdateTeam {
  name?: string;
  key?: string;
}
