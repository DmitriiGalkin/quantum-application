export interface Idea {
  id: number;
  userId: number;
  passportId: number | null;
  title: string | null;
  description: string | null;
  image: string | null;
  deletedAt: string | null;
  userCount: number;
  isLiked: boolean;
}
