export interface PlaceProjectStats {
  projectId: number;
  title: string;
  meets: number;
  bookings: number;
  knownCapacity: number;
  unknownCapacityMeets: number;
}

export interface PlaceStatsDto {
  days: 7 | 30 | 90;
  meets: number;
  bookings: number;
  knownCapacity: number;
  unknownCapacityMeets: number;
  projects: PlaceProjectStats[];
  campaigns: {
    id: number;
    projectId: number;
    projectTitle: string;
    channel: string;
    initiator: 'teacher' | 'place';
    visits: number;
    bookings: number;
  }[];
}
