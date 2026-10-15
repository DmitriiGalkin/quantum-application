import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';
import type { IdeaRow, CreateIdeaInput, FindAllIdeaInput, Idea, UpdateIdeaInput } from 'entities';
import { mapIdeaRow } from '../mappers/idea.mapper.js';

class IdeaRepository {
  static async findByUserIds(ids: number[]): Promise<Idea[]> {
    if (!ids.length) return [];
    return (await db.query<IdeaRow>('SELECT * FROM idea WHERE userId IN (?) AND deletedAt IS NULL ORDER BY createdAt DESC, id DESC', [[...new Set(ids)]])).map(mapIdeaRow);
  }

  static async recountLikes(id: number, count: number, conn: PoolConnection): Promise<void> {
    await conn.execute('UPDATE idea SET userCount = ? WHERE id = ?', [count, id]);
  }
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM idea FOR UPDATE');
    return rows;
  }

  static async removeSeedRows(ids: number[], conn: PoolConnection): Promise<void> {
    if (ids.length) await conn.query('DELETE FROM idea WHERE id IN (?)', [ids]);
  }

  static async findByIds(ids: number[]): Promise<Idea[]> {
    if (!ids.length) return [];
    const rows = await db.query<IdeaRow>(
      'SELECT * FROM idea WHERE id IN (?) AND deletedAt IS NULL',
      [[...new Set(ids)]],
    );
    return rows.map(mapIdeaRow);
  }

  static async create(data: CreateIdeaInput, conn?: PoolConnection): Promise<number> {
    const sql = 'INSERT INTO idea (title, description, userId, passportId, catalogId, cardData, catalogMetadata, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [data.title, data.description, data.userId, data.passportId, data.catalogId ?? null,
      data.cardData == null ? null : JSON.stringify(data.cardData),
      data.catalogMetadata == null ? null : JSON.stringify(data.catalogMetadata), data.image ?? null];
    const result = conn ? (await conn.execute<ResultSetHeader>(sql, values))[0] : await db.execute<ResultSetHeader>(sql, values);
    return result.insertId;
  }

  static async update(id: number, data: UpdateIdeaInput, conn?: PoolConnection): Promise<boolean> {
    const keys = ['title', 'description', 'image', 'cardData', 'catalogMetadata'] as const;
    const entries = keys.filter(key => data[key] !== undefined);
    if (!entries.length) return false;
    const fields = entries.map(key => key + ' = ?').join(', ');
    const values = entries.map(key => {
      const value = data[key];
      return value == null ? null : typeof value === 'object' ? JSON.stringify(value) : value;
    });
    const sql = 'UPDATE idea SET ' + fields + ' WHERE id = ?';
    const result = conn ? (await conn.execute<ResultSetHeader>(sql, [...values, id]))[0]
      : await db.execute<ResultSetHeader>(sql, [...values, id]);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<void> {
    await db.execute('UPDATE idea SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?', [id]);
  }

  // ✅ FIND ALL
  static async findAll(params?: FindAllIdeaInput): Promise<Idea[]> {
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

      if (params?.currentUserId !== undefined) values.push(params.currentUserId);
    }

    if (params?.sort === 'nearby' && params.latitude !== undefined && params.longitude !== undefined) {
      select.push(`
    (
      SELECT MIN(
        6371 * ACOS(LEAST(1, GREATEST(-1,
          COS(RADIANS(?)) *
          COS(RADIANS(pl.latitude)) *
          COS(RADIANS(pl.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) *
          SIN(RADIANS(pl.latitude))
        )))
      )
      FROM project p2
      JOIN meet m2 ON m2.projectId = p2.id
      JOIN place pl ON pl.id = m2.placeId
      WHERE p2.ideaId = idea.id
        AND pl.latitude IS NOT NULL
        AND pl.longitude IS NOT NULL
    ) AS distance
  `);

      values.push(params.latitude, params.longitude, params.latitude);
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

    // =========================
    if (params?.when) {
      switch (params.when) {
        case 'today':
          sql += `
          AND EXISTS (
            SELECT 1
            FROM project p
            JOIN meet m ON m.projectId = p.id
            WHERE p.ideaId = idea.id
              AND m.startedAt >= CURDATE()
              AND m.startedAt < CURDATE() + INTERVAL 1 DAY
          )
        `;
          break;

        case 'tomorrow':
          sql += `
          AND EXISTS (
            SELECT 1
            FROM project p
            JOIN meet m ON m.projectId = p.id
            WHERE p.ideaId = idea.id
              AND m.startedAt >= CURDATE() + INTERVAL 1 DAY
              AND m.startedAt < CURDATE() + INTERVAL 2 DAY
          )
        `;
          break;
      }
    }

    sql += params?.deleted === 'true' ? ' AND idea.deletedAt IS NOT NULL' : ' AND idea.deletedAt IS NULL';

    switch (params?.sort) {
      case 'nearby':
        sql += params?.latitude !== undefined && params.longitude !== undefined
          ? ' ORDER BY distance IS NULL, distance ASC, idea.createdAt DESC, idea.id DESC'
          : ' ORDER BY idea.createdAt DESC, idea.id DESC';
        break;
      case 'new':
      default:
        sql += ' ORDER BY idea.createdAt DESC, idea.id DESC';
        break;
      case 'popular':
        sql += ' ORDER BY idea.userCount DESC, idea.createdAt DESC, idea.id DESC';
        break;
    }

    const rows = await db.query<IdeaRow>(sql, values);
    return rows.map(mapIdeaRow);
  }

  // ✅ FIND BY ID
  static async findById(id: number | string, conn?: PoolConnection): Promise<Idea | null> {
    const sql = typeof id === 'number'
      ? 'SELECT * FROM idea WHERE id = ? AND deletedAt IS NULL'
      : 'SELECT * FROM idea WHERE catalogId = ? AND deletedAt IS NULL';
    const rows = conn ? (await conn.execute<IdeaRow[]>(sql + ' FOR UPDATE', [id]))[0] : await db.query<IdeaRow>(sql, [id]);
    return rows[0] ? mapIdeaRow(rows[0]) : null;
  }

  static async findByTeacherId(passportId: number): Promise<Idea[]> {
    const rows = await db.query<IdeaRow>(
      `
    SELECT *
    FROM idea
    WHERE passportId = ?
    ORDER BY createdAt DESC
    `,
      [passportId],
    );

    return rows.map(mapIdeaRow);
  }
}

export default IdeaRepository;
