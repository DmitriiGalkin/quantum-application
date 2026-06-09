export type CreateMeetInput = {
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: string; // ISO
};

export type UpdateMeetInput = Partial<{
  startedAt: string;
  duration: number | null;
  price: number | null;
}>;
