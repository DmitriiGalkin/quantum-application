import type { UserDto } from '@shared/types';
import { User, UserWithMeet } from '../entities/user.js';
import { UserRow, UserWithMeetRow } from '../entities/user.db.js';

export function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    passportId: row.passportId,
    title: row.title,
    description: row.description,
    age: row.age,
    image: row.image,
  };
}

export function mapUserWithMeetRow(row: UserWithMeetRow): UserWithMeet {
  return {
    ...mapUserRow(row),
    meetUserId: row.meetUserId,
  };
}

export const toUser = (row: User): UserDto => ({
  id: row.id,
  title: row.title,
  description: row.description,
  age: row.age,
  image: row.image,
});
