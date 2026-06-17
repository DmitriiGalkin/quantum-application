import { ProjectDto } from '../index';

export interface IdeaDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  isLiked?: boolean;

  user: {
    id: number;
    title: string;
    age: number;
  } | null;

  projects: ProjectDto[];
}