export interface ICreateWorkspace {
  name: string;
  slug: string;
  color?: string;
}

export interface IUpdateWorkspace {
  name?: string;
  slug?: string;
  color?: string;
}
