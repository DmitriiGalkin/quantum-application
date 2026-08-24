import type { FeedItem, IdeaDto, MeetDto, PassportDto, PlaceDto, UserDto } from 'dto/index.ts';
import type { Project } from '../entities/project.ts';

export interface ProjectDto extends Omit<Project, 'passportId' | 'placeId' | 'ideaId'> {
  passport: PassportDto;
  place: PlaceDto;
  meets: MeetDto[];
  users: UserDto[];
  idea: IdeaDto | null;
  feeds?: FeedItem[];
  isPaid?: boolean;
}