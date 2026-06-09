export interface Place {
  id: number;
  providerId: number;
  provider: string;
  title?: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  image?: string;
}
