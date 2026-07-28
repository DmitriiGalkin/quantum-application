// components/meet/types.ts

export interface Meet {
  id: number;

  title: string;

  startedAt: string | Date;

  endedAt: string | Date;

  color?: string;

  project?: {
    id: number;
    name: string;
  };
}
