export interface Passport {
  id: number;
  providerId: string;
  provider: string;
  accessToken: string;
  title: string | null;
  email: string;
}