import type { RowDataPacket } from 'mysql2/promise';
import type { UserDto } from './user.js';
import type { ProjectDto, Sort } from 'entities';

export interface IdeaRow extends RowDataPacket {
  id: number;
  userId: number;
  passportId: number;
  title: string;
  description: string;
  image: string | null;
  userCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface IdeaWithLikeRow extends IdeaRow {
  isLiked: 0 | 1; // MySQL boolean
}

export interface Idea {
  id: number;
  userId: number;
  passportId: number | null;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  today: boolean;
  createdAt: string;
}

export interface IdeaDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  isLiked?: boolean;
  createdAt: string;
  user: UserDto | null;
  //projects: ProjectDto[] | null;
}

export interface IdeaWithLike extends Idea {
  isLiked: boolean;
}

export type CreateIdeaInput = {
  title: string | null;
  description: string | null;
  userId: number | null;
  passportId: number | null;
};

export type UpdateIdeaInput = Partial<{
  title: string | null;
  description: string | null;
  image: string | null;
}>;

export interface FindAllIdeaInput {
  userId?: string | number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
  currentUserId?: number;
  when?: 'today' | 'tomorrow';
  sort?: Sort;
  latitude?: number;
  longitude?: number;
}

export interface CreateIdea {
  title: string;
  description: string;
}

export interface GetIdeasQuery {
  userId?: number;
  sort?: Sort;
  when?: 'today' | 'tomorrow';
  latitude?: number;
  longitude?: number;
}


export interface IdeaDashboard extends IdeaDto {
  projects: ProjectDto[];
}
