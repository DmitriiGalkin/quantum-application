import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(), execute: vi.fn(), getConnection: vi.fn(), end: vi.fn(),
}));
vi.mock('mysql2/promise', () => ({ default: { createPool: () => mocks } }));
import { DatabaseService } from './dbNext.js';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('database failure handling', () => {
  it('does not repeat a write whose outcome is unknown', async () => {
    const error = Object.assign(new Error('Disconnected'), { code: 'ECONNRESET' });
    mocks.execute.mockRejectedValueOnce(error);
    await expect(new DatabaseService().execute('INSERT INTO example VALUES (?)', [1])).rejects.toBe(error);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });

  it('retries a disconnected read and returns its result', async () => {
    mocks.query.mockRejectedValueOnce(Object.assign(new Error('Disconnected'), { code: 'ECONNRESET' }))
      .mockResolvedValueOnce([[{ id: 1 }], []]);
    expect(await new DatabaseService().query('SELECT id FROM example')).toEqual([{ id: 1 }]);
    expect(mocks.query).toHaveBeenCalledTimes(2);
  });

  it('does not retry SQL errors', async () => {
    mocks.query.mockRejectedValueOnce(Object.assign(new Error('Invalid SQL'), { code: 'ER_PARSE_ERROR' }));
    await expect(new DatabaseService().query('SELECT invalid')).rejects.toThrow('Invalid SQL');
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });

  it('does not retry legacy writes routed through query()', async () => {
    const error = Object.assign(new Error('Disconnected'), { code: 'ECONNRESET' });
    mocks.query.mockRejectedValueOnce(error);
    await expect(new DatabaseService().query('DELETE FROM example WHERE id = ?', [1])).rejects.toBe(error);
    expect(mocks.query).toHaveBeenCalledOnce();
  });

  it('rolls back and releases the connection while preserving the original error', async () => {
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn().mockRejectedValue(new Error('Disconnected')), release: vi.fn() };
    mocks.getConnection.mockResolvedValueOnce(connection);
    const error = new Error('Operation failed');
    await expect(new DatabaseService().transaction(async () => { throw error; })).rejects.toBe(error);
    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
  });
});
