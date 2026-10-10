import type { PoolConnection } from 'mysql2/promise';
import type { IdeaPhoto, IdeaPhotoRow } from '../entities/idea.js';
import { db } from '../utils/dbNext.js';

export class IdeaPhotoRepository {
  static async findByIdeaIds(ideaIds: number[]): Promise<IdeaPhotoRow[]> {
    if (!ideaIds.length) return [];
    return db.query<IdeaPhotoRow>('SELECT * FROM ideaPhoto WHERE ideaId IN (?) ORDER BY position, id', [ideaIds]);
  }
  static async findByIdeaId(ideaId: number, conn?: PoolConnection): Promise<IdeaPhoto[]> {
    const sql = 'SELECT * FROM ideaPhoto WHERE ideaId = ? ORDER BY position, id';
    const rows = conn ? (await conn.execute<IdeaPhotoRow[]>(sql + ' FOR UPDATE', [ideaId]))[0]
      : await db.query<IdeaPhotoRow>(sql, [ideaId]);
    return rows.map(row => typeof row.photoData === 'string' ? JSON.parse(row.photoData) as IdeaPhoto : row.photoData);
  }

  static async replace(ideaId: number, photos: IdeaPhoto[], conn: PoolConnection): Promise<void> {
    await conn.execute('DELETE FROM ideaPhoto WHERE ideaId = ?', [ideaId]);
    for (const [position, photo] of photos.entries()) {
      // A plain INSERT rejects IDs belonging to another idea instead of moving their photos.
      await conn.execute('INSERT INTO ideaPhoto (id, ideaId, position, photoData) VALUES (?, ?, ?, ?)',
        [photo.id, ideaId, position, JSON.stringify(photo)]);
    }
  }
}
