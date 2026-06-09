export interface MeetUser {
  id: number;
  userId: number;
  meetId: number;
}

export interface MeetUserWithMeet extends MeetUser {
  startedAt: Date | null;
}
