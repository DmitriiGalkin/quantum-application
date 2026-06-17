import { ProjectDto } from './project.dto';
import { UserDto } from './user.dto';

export interface MeetDto {
  id: number;
  projectId: number;
  startedAt: string;
  duration: number | null;
  price: number | null;
}

export interface MeetFullDto extends MeetDto {
  project: ProjectDto | null;
  users: UserDto[];
}
