import { ProjectDto } from '../index';
import { UserDto } from './user.dto';

export interface IdeaDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  isLiked?: boolean;
}

export interface IdeaFullDto extends IdeaDto {
  user: UserDto | null;
  projects: ProjectDto[];
}