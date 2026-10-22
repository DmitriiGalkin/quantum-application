import { expect, it, vi } from 'vitest';
import type { PoolConnection } from 'mysql2/promise';

vi.mock('../utils/dbNext.js', () => ({ db: {} }));
import PlaceRepository from './place.repository.js';

it('persists an uploaded main image when creating a centre', async () => {
  const execute = vi.fn().mockResolvedValue([{ insertId: 597 }]);
  const connection = { execute } as unknown as PoolConnection;
  const id = await PlaceRepository.create({ title: 'Живой источник', image: 'https://example.com/centre.jpg' }, connection);
  expect(id).toBe(597);
  const [sql, values] = execute.mock.calls[0] as [string, unknown[]];
  expect(sql).toMatch(/INSERT INTO place[\s\S]*\bimage\b/);
  expect(values[2]).toBe('https://example.com/centre.jpg');
});
