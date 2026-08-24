import type { UserRow, UserWithMeetRow, User, UserWithMeet } from 'entities';

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
