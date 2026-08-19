export type CreateUserInput = {
  passportId: number;
  title: string;
  description?: string | null;
  age?: number | null;
};

export type UpdateUserInput = Partial<{
  title: string;
  age: number | null;
  image: string | null;
}>;
