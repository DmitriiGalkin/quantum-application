export type CreatePassportInput = {
  providerId: string;
  provider: string;
  accessToken: string;
  title?: string | null;
  email: string;
};

export type UpdatePassportInput = Partial<{
  title: string | null;
  description: string | null;
}>;
