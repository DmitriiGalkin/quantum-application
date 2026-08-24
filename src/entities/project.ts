import type { RowDataPacket } from 'mysql2/promise';
import type { Sort, FeedItem } from 'entities';
import type { PassportDto } from './passport.js';
import type { PlaceDto } from './place.js';
import type { UserDto } from './user.js';
import type { MeetDto } from './meet.js';
import type { IdeaDto } from './idea.js';

export interface ProjectRow extends RowDataPacket {
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
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  ideaId: number | null;
  placeId: number;
  passportId: number;
}

export interface FindAllProjectInput {
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
  passport: PassportDto;
  place: PlaceDto;
  meets: MeetDto[];
  users: UserDto[];
  idea: IdeaDto | null;
  feeds?: FeedItem[];
  isPaid?: boolean;
}

export type CreateProjectInput = {
  placeId: number;
  title: string;
  description: string;
  image: string;
  ideaId?: number;
  passportId: number;
};

export interface CreateProject {
  title: string;
  description: string;
  image: string;
  ideaId?: number;
  placeId: number;
}

export interface GetProjectsQuery {
  userId?: number;
  sort?: Sort;
  when?: 'today' | 'tomorrow';
  latitude?: number;
  longitude?: number;
}