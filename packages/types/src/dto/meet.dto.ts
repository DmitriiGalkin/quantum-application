export interface MeetDto {
  id: number;
  projectId: number;
  startedAt: string;
  duration: number | null;
  price: number | null;

  project: {
    id: number;
    title: string;
    place: {
      id: number;
      title: string;
    } | null;
  } | null;

  users: {
    id: number;
    meetUserId?: number;
    title: string;
    age: number | null;
    image: string | null;
  }[];
}
