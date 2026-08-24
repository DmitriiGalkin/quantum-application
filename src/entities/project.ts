import type { Sort } from 'entities';

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
