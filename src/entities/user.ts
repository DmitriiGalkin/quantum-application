import type { RowDataPacket } from 'mysql2/promise';
import type { ProjectDto } from 'entities/project.ts';

export interface UserRow extends RowDataPacket {
  id: number;
  passportId: number;
  title: string;
  description: string;
  age: number | null;
  image: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface UserWithMeetRow extends UserRow {
  meetUserId: number;
}


export interface User {
  id: number;
  passportId: number;
  title: string;
  description: string;
  age: number | null;
  image: string | null;
}

export interface UserWithMeet extends User {
  meetUserId: number;
}
export interface UserDto {
  id: number;
  title: string;
  description?: string | null;
  age: number | null;
  image: string | null;
}

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

export interface UserDashboardDto {
  projects: ProjectDto[];
}
