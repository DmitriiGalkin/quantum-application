import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type { IdeaCardModel, IdeaCardRow } from '../entities/idea-card.js';
import { db } from '../utils/dbNext.js';

/** Only the idea table; photo orchestration belongs to the service. */
export class IdeaCardRepository {
  static async findAll(): Promise<IdeaCardRow[]> {
    return db.query<IdeaCardRow>('SELECT * FROM idea WHERE catalogId IS NOT NULL AND deletedAt IS NULL ORDER BY id');
  }

  static async findById(id: string, conn?: PoolConnection): Promise<IdeaCardRow | null> {
    const sql = 'SELECT * FROM idea WHERE catalogId = ? AND deletedAt IS NULL';
    const rows = conn
      ? (await conn.execute<IdeaCardRow[]>(sql + ' FOR UPDATE', [id]))[0]
      : await db.query<IdeaCardRow>(sql, [id]);
    return rows[0] ?? null;
  }

  static async create(data: IdeaCardModel, conn: PoolConnection): Promise<number> {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO idea (catalogId, title, description, image, cardData, catalogMetadata, passportId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.catalogId, data.title, data.description, data.image, JSON.stringify(data.cardData),
        data.catalogMetadata === null ? null : JSON.stringify(data.catalogMetadata), data.passportId],
    );
    return result.insertId;
  }

  static async update(id: number, data: IdeaCardModel, conn: PoolConnection): Promise<void> {
    await conn.execute(
      'UPDATE idea SET title = ?, description = ?, image = ?, cardData = ?, catalogMetadata = ? WHERE id = ?',
      [data.title, data.description, data.image, JSON.stringify(data.cardData),
        data.catalogMetadata === null ? null : JSON.stringify(data.catalogMetadata), id],
    );
  }
}
