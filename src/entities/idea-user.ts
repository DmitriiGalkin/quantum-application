import type { RowDataPacket } from 'mysql2/promise';

export interface IdeaUserRow extends RowDataPacket {
  id: number;
  ideaId: number;
  userId: number;
}

export interface IdeaUser {
  id: number;
  ideaId: number;
  userId: number;
}

export type CreateIdeaUserInput = {
  ideaId: number;
  userId: number;
};

export interface CreateIdeaUser {
  ideaId: number;
  userId: number;
}
export interface DeleteIdeaUser {
  ideaId: number;
  userId: number;
}