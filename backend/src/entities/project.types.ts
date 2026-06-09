export type CreateProjectInput = {
  title: string;
  description?: string | null;
  ideaId: number;
  passportId: number;
};

export type UpdateProjectInput = Partial<{
  title: string;
  description: string | null;
}>;
