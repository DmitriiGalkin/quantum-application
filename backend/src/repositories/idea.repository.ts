import { db } from '../dbNext.js';
import { ResultSetHeader } from 'mysql2/promise';
import { IdeaRow, IdeaWithLikeRow } from '../entities/idea.db.js';
import { mapIdeaRow, mapIdeaWithLikeRow } from '../mappers/idea.mapper.js';
import { CreateIdeaInput, FindAllIdeaInput, Idea, IdeaWithLike, UpdateIdeaInput } from '../entities/idea.js';

class IdeaRepository {
  // ✅ CREATE
  static async create(data: CreateIdeaInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO idea (title, description, userId, passportId)
       VALUES (?, ?, ?, ?)`,
      [data.title, data.description, data.userId, data.passportId],
    );

    return result.insertId;
  }

  // ✅ UPDATE
  static async update(id: number, data: UpdateIdeaInput): Promise<boolean> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);

    const result = await db.execute<ResultSetHeader>(`UPDATE idea SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
  }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    await db.execute(`UPDATE idea SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?`, [id]);
  }

  // ✅ FIND ALL
  static async findAll(params?: FindAllIdeaInput): Promise<(Idea | IdeaWithLike)[]> {
    const select: string[] = ['idea.*'];
    const values: (string | number)[] = [];

    const withLike = Boolean(params?.currentUserId);

    if (withLike) {
      select.push(`
        EXISTS (
          SELECT 1
          FROM ideaUser iu
          WHERE iu.ideaId = idea.id
            AND iu.userId = ?
        ) AS isLiked
      `);

      values.push(params?.currentUserId!);
    }

    let sql = `
      SELECT ${select.join(', ')}
      FROM idea
      WHERE 1=1
    `;

    if (params?.userId) {
      sql += ' AND idea.userId = ?';
      values.push(params?.userId);
    }

    sql += params?.deleted === 'true' ? ' AND idea.deletedAt IS NOT NULL' : ' AND idea.deletedAt IS NULL';

    if (withLike) {
      const rows = await db.query<IdeaWithLikeRow>(sql, values);
      return rows.map(mapIdeaWithLikeRow);
    }

    const rows = await db.query<IdeaRow>(sql, values);
    return rows.map(mapIdeaRow);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<IdeaWithLikeRow | null> {
    const rows = await db.query<IdeaWithLikeRow>(
      `SELECT *, EXISTS (
          SELECT 1
          FROM ideaUser iu
          WHERE iu.ideaId = idea.id
            AND iu.userId = ?
        ) AS isLiked FROM idea WHERE id = ?`,
      [id],
    );

    if (!rows[0]) return null;

    return mapIdeaRow(rows[0]);
  }
}

export default IdeaRepository;
