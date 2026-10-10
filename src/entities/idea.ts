import type { RowDataPacket } from 'mysql2/promise';
import type { UserDto } from './user.js';
import type { ProjectDto, Sort } from 'entities';

export interface IdeaRow extends RowDataPacket {
  id: number;
  userId: number;
  passportId: number | null;
  title: string;
  description: string;
  image: string | null;
  catalogId?: string | null;
  cardData?: Record<string, JsonValue> | null;
  catalogMetadata?: Record<string, JsonValue> | null;
  userCount: number;
  createdAt: string;
  deletedAt: string | null;
  isLiked: 0 | 1;
}

export interface Idea extends Omit<IdeaRow, 'deletedAt'> {
  today: boolean;
  photos: IdeaPhoto[];
}

export interface IdeaDto extends Idea {
  user: UserDto | null;
}

export type CreateIdeaInput = {
  title: string | null;
  description: string | null;
  userId: number | null;
  passportId: number | null;
  catalogId?: string | null;
  cardData?: Record<string, JsonValue> | null;
  catalogMetadata?: Record<string, JsonValue> | null;
  image?: string | null;
};

export type UpdateIdeaInput = Partial<{
  title: string | null;
  description: string | null;
  image: string | null;
  cardData: Record<string, JsonValue> | null;
  catalogMetadata: Record<string, JsonValue> | null;
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
  catalogId?: string;
  cardData?: Record<string, JsonValue> | null;
  photos?: IdeaPhoto[];
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

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

/** Original catalog fields remain intact, including unknown fields and explicit nulls. */
export interface IdeaPhoto extends Record<string, JsonValue> {
  id: string;
  fileName: string;
  driveFileId: string;
  url: string;
  isCover: boolean;
}


/** File format only; imported items become the existing Idea entity. */
export interface IdeaCatalog extends Record<string, JsonValue> {
  schemaVersion: number;
  items: (Record<string, JsonValue> & { id: string; name: string; description: string; photos: IdeaPhoto[] })[];
}

export interface IdeaPhotoRow extends RowDataPacket {
  id: string;
  ideaId: number;
  photoData: IdeaPhoto | string;
}
