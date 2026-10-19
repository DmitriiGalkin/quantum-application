export interface LocationDto {
  id: number;
  title: string;
}

export interface CreateLocation {
  title: string;
}

export interface PlaceLocation extends LocationDto {
  placeId: number;
  deletedAt: string | null;
  description: string | null;
  capacity: number | null;
  hourlyRate: number | null;
}

export interface LocationPhoto {
  id: number;
  locationId: number;
  url: string;
  position: number;
}

export interface RoomDto extends PlaceLocation {
  photos: LocationPhoto[];
}

export interface UpdateLocation {
  title: string;
  description: string | null;
  capacity: number | null;
  hourlyRate: number | null;
  photoUrls: string[];
}

export interface BusyInterval {
  startedAt: string;
  endedAt: string;
}
