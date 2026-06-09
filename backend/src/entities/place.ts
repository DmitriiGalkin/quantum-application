export interface Place {
  id: number;
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  provider: string | null;
  providerId: number | null;
  phone: string | null;
}

export type CreatePlaceInput = {
  title: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  provider?: string | null;
  providerId?: number | null;
};

export type UpdatePlaceInput = Partial<{
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  provider: string | null;
  providerId: number | null;
  phone: string | null;
  priceFrom: number | null;
}>;