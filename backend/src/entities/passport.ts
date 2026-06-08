export interface Passport {
  id: number;
  provider: string;
  providerId: string;
  title: string | null;
  description?: string | null;
  email: string | null;
  image: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  accessToken: string | null;
}
