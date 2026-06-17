export interface ProjectDto {
  id: number;
}

export interface ProjectFullDto extends ProjectDto {
  idea: {
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    image: string | null;
  };
  passport: {
    title: string;
    image: string | null;
  } | null;
  place: {
    title: string;
    address: string | null;
    description: string | null;
  } | null;
  meets?: {
    id: number;
    projectId: number;
    startedAt: string;
    duration: number | null;
    price: number | null;
    project: null;
    users: null;
  }[];
  users?: {
    id: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}
