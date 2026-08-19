import { db } from '../dbNext.js';
import { ResultSetHeader } from 'mysql2/promise';
import { IdeaRow, IdeaWithLikeRow } from '../entities/idea.db.js';
import { mapIdeaRow, mapIdeaWithLikeRow } from '../mappers/idea.mapper.js';
import { CreateIdeaInput, FindAllIdeaInput, Idea, IdeaWithLike, UpdateIdeaInput } from '../entities/idea.js';

class IdeaRepository {
  // ✅ CREATE
  static async create(data: CreateIdeaInput): Promise<number> {
    console.log(data, 'data');
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

    if (params?.sort === 'nearby' && params.latitude && params.longitude) {
      select.push(`
    (
      SELECT MIN(
        6371 * ACOS(
          COS(RADIANS(?)) *
          COS(RADIANS(pl.latitude)) *
          COS(RADIANS(pl.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) *
          SIN(RADIANS(pl.latitude))
        )
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
        sql += ' ORDER BY distance IS NULL, distance ASC';
        break;
      case 'new':
        sql += ' ORDER BY idea.createdAt DESC';
        break;
      case 'popular':
        sql += ' ORDER BY idea.userCount DESC';
        break;
    }

    if (withLike) {
      const rows = await db.query<IdeaWithLikeRow>(sql, values);
      return rows.map(mapIdeaWithLikeRow);
    }

    const rows = await db.query<IdeaRow>(sql, values);
    return rows.map(mapIdeaRow);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Idea | null> {
    const rows = await db.query<IdeaRow>(`SELECT * FROM idea WHERE id = ?`, [id]);

    if (!rows[0]) return null;

    return mapIdeaRow(rows[0]);
  }

  static async findByTeacherId(passportId: number): Promise<Idea[]> {
    const rows = await db.query(
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
