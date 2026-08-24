import type { RowDataPacket } from 'mysql2/promise';

export interface ProjectUserRow extends RowDataPacket {
  id: number;
  projectId: number;
  userId: number;
  createdAt: string;
}

export interface ProjectUser {
  id: number;
  projectId: number;
  userId: number;
  createdAt: string;
}

export type CreateProjectUserInput = {
  projectId: number;
  userId: number;
};

export interface CreateProjectUser {
  projectId: number;
  userId: number;
}