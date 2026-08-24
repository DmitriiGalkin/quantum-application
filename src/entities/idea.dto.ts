import type { ProjectDto, UserDto } from 'entities';

export interface IdeaDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface IdeaExtendedDto extends IdeaDto {
  user: UserDto | null;
}

export interface IdeaFullDto extends IdeaDto {
  user: UserDto | null;
  projects: ProjectDto[];
}