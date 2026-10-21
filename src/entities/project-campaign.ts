export interface ProjectCampaign {
  id: number;
  projectId: number;
  creatorPassportId: number;
  initiator: 'teacher' | 'place';
  channel: string;
  token: string;
  createdAt: string;
  visits: number;
  bookings: number;
}

export interface CreateProjectCampaign {
  projectId: number;
  channel: string;
}
