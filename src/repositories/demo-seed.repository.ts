import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { DemoSeedRecord } from 'entities';

export default class DemoSeedRepository {
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM demoSeedRecord FOR UPDATE');
    return rows;
  }

  static async removeRecord(entityType: string, recordId: number, conn: PoolConnection): Promise<void> {
    await conn.execute('DELETE FROM demoSeedRecord WHERE entityType = ? AND recordId = ?', [entityType, recordId]);
  }
  static async findAll(seedKey: string, conn: PoolConnection): Promise<DemoSeedRecord[]> {
    const [rows] = await conn.execute<(DemoSeedRecord & RowDataPacket)[]>(
      'SELECT seedKey, entityType, entityKey, recordId FROM demoSeedRecord WHERE seedKey = ? FOR UPDATE', [seedKey],
    );
    return rows;
  }

  static async save(record: DemoSeedRecord, conn: PoolConnection): Promise<void> {
    await conn.execute('INSERT INTO demoSeedRecord (seedKey, entityType, entityKey, recordId) VALUES (?, ?, ?, ?)',
      [record.seedKey, record.entityType, record.entityKey, record.recordId]);
  }

  static async clear(seedKey: string, conn: PoolConnection): Promise<void> {
    await conn.execute('DELETE FROM demoSeedRecord WHERE seedKey = ?', [seedKey]);
  }
}
