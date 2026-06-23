export type CreateMeetInput = {
  passportId: number;
  projectId: number;
  placeId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
};

export type UpdateMeetInput = Partial<{
  startedAt: string;
  duration: number | null;
  price: number | null;
}>;
