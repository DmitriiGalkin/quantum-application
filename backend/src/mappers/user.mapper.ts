import { User } from '../entities/user.js';

export const toUser = (row: any): User => ({
  id: row.id,
  passportId: row.passportId,
  title: row.title,
});
