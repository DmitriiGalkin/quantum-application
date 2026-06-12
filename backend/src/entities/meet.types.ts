export type CreateMeetInput = {
  passportId: number;
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: Date
};

export type UpdateMeetInput = Partial<{
  startedAt: string;
  duration: number | null;
  price: number | null;
}>;
