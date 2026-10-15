import type { RowDataPacket } from 'mysql2/promise';
import type { Sort, FeedItem } from 'entities';
import type { PassportDto } from './passport.js';
import type { PlaceDto } from './place.js';
import type { UserDto } from './user.js';
import type { MeetDto } from './meet.js';
import type { IdeaDto } from './idea.js';
import type { LocationDto } from './location.js';

export interface ProjectRow extends RowDataPacket {
  locationId: number | null;
  id: number;
  title: string;
  description: string;
  image: string | null;
  ideaId: number | null;
  placeId: number;
  passportId: number;
  createdAt: string;
  deletedAt: string;
}

export interface Project {
  locationId?: number | null;
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  ideaId: number | null;
  placeId: number;
  passportId: number;
}

export interface GetProjectsQuery {
  q?: string;
  upcomingOnly?: boolean | 'true' | 'false';
  userId?: string | number;
  ideaId?: number;
  placeId?: number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
  currentUserId?: number;
  when?: 'today' | 'tomorrow';
  sort?: Sort;
  latitude?: number;
  longitude?: number;
}

export interface ProjectDto extends Omit<Project, 'passportId' | 'placeId' | 'ideaId'> {
  location?: LocationDto | null;
  passport: PassportDto;
  place: PlaceDto;
  meets: MeetDto[];
  users: UserDto[];
  idea: IdeaDto | null;
  feeds?: FeedItem[];
  isPaid?: boolean;
}

export type CreateProjectInput = {
  locationId?: number | null;
  placeId: number;
  title: string;
  description: string;
  image: string | null;
  ideaId?: number;
  passportId: number;
};

export interface CreateProject {
  locationId?: number | null;
  title: string;
  description: string;
  image: string;
  ideaId?: number;
  placeId: number;
}
