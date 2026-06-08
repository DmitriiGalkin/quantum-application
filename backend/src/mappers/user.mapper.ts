import { User } from '../entities/user.js';
import type { UserDto } from '@shared/types';

export const toUser = (row: User): UserDto => ({
  id: row.id,
  title: row.title,
  description: row.description,
  age: row.age,
  image: row.image,
});
