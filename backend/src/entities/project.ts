export interface Project {
  id: number;
  title: string;
  description: string | null;
  ideaId: number;
  placeId: number | null;
  passportId: number;
}

export interface FindAllProjectInput{
  userId?: string | number;
  passportId?: string | number;
  deleted?: 'true' | 'false';
  currentUserId?: number;
}