import { expect, it, vi } from 'vitest';
vi.mock('../utils/dbNext.js', () => ({ db: { query: vi.fn(async () => []) } }));
import { db } from '../utils/dbNext.js';
import ProjectRepository from './project.repository.js';

it('parameterizes every search word literally and defers showcase dates to the eligible meeting filter', async () => {
  await ProjectRepository.findAll({ q: "  wood  50% _ '  ", upcomingOnly: true, when: 'tomorrow', sort: 'new' });
  const [sql, values] = vi.mocked(db.query).mock.calls.at(-1)!;
  expect(values).toEqual(['wood', 'wood', '50%', '50%', '_', '_', "'", "'"]);
  expect(sql).not.toContain('50%');
  expect(sql).not.toContain('CURDATE');
  expect(sql.match(/AND \(LOCATE/g)).toHaveLength(4);
  expect(sql).toContain('ORDER BY project.createdAt DESC');
});
