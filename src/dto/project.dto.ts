import type { FeedItem, IdeaDto, MeetExtendedDto, PassportDto, PlaceDto, UserDto } from 'dto/index.ts';
import type { Project } from '../entities/project.ts';

export interface ProjectDto extends Omit<Project, 'passportId' | 'placeId' | 'ideaId'> {
  passport: PassportDto;
  place: PlaceDto;
  meets: MeetExtendedDto[];
  users: UserDto[];
  idea: IdeaDto | null;
}

export interface ProjectFullDto extends ProjectDto {
  feeds?: FeedItem[];
  isPaid?: boolean;
}