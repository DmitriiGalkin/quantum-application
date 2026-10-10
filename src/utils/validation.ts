import { HttpError } from './http-error.js';

export function requireId(value: unknown, label = 'записи'): number {
  if (!(typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value)))) {
    throw new HttpError(`Некорректный ID ${label}`, 400);
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new HttpError(`Некорректный ID ${label}`, 400);
  return id;
}
