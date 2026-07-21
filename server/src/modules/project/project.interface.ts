export interface ICreateProject {
  name: string;
  summary?: string;
  teamId: string;
}

export interface IUpdateProject {
  name?: string;
  summary?: string;
}
