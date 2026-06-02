import pool from '../db.js'; // Импортируем пул соединений

class Idea {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.image = data.image;
    this.userId = data.userId;
    this.passportId = data.passportId;
    this.deletedAt = data.deletedAt;
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
          'INSERT INTO idea SET `title` = :title, `description` = :description, `userId` = :userId, `passportId` = :passportId',
          data // Передаем объект data как есть
      );
      return result.insertId;
    } catch (err) {
      console.error('idea.create error:', err);
      throw err;
    }
  }

  static async update(id, obj) {
    const sql = `
      UPDATE idea 
      SET title = ?, description = ?, image = ?
      WHERE id = ?
    `;
    const values = [obj.title, obj.description, obj.image, id];

    try {
      await pool.query(sql, values);
    } catch (err) {
      console.error('idea.update error:', err);
      throw err;
    }
  }

  static async delete(id) {
    // Логическое удаление (soft delete)
    const sql = 'UPDATE idea SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?';

    try {
      await pool.query(sql, [id]);
    } catch (err) {
      console.error('idea.delete error:', err);
      throw err;
    }
  }

  /**
   * Сложный метод поиска с динамическими условиями.
   * @param {Object} params - Параметры фильтрации.
   */
  static async findAll(params) {
    // Безопасное построение запроса с плейсхолдерами
    let sql = 'SELECT idea.* FROM idea';
    const conditions = [];
    const values = [];

    // Условие для JOIN (participation)
    if (params?.variant === 'participation' && params?.userId) {
      sql += ' LEFT JOIN participation ON participation.projectId = idea.id';
      conditions.push('participation.userId = ?');
      values.push(params.userId);
    }

    // Условие для владельца (self)
    if (params?.variant === 'self' && params?.passportId) {
      conditions.push('idea.passportId = ?');
      values.push(params.passportId);
    }

    // Условие для рекомендаций (НЕ владелец)
    if (params?.type === 'recommendation' && params?.passportId) {
      conditions.push('idea.passportId != ?');
      values.push(params.passportId);
    }

    // Условие удаления (deletedAt)
    if (params?.deleted === 'true') {
      conditions.push('idea.deletedAt IS NOT NULL');
    } else {
      conditions.push('idea.deletedAt IS NULL');
    }

    // Собираем финальный запрос, если есть условия WHERE
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    try {
      const [rows] = await pool.query(sql, values);
      return rows;
    } catch (err) {
      console.error('idea.findAll error:', err);
      throw err;
    }
  }

  static async findById(id) {
    const sql = 'SELECT * FROM idea WHERE id = ?';

    try {
      const [rows] = await pool.query(sql, [id]);
      return rows.length > 0 ? new Idea(rows[0]) : null;
    } catch (err) {
      console.error('idea.findById error:', err);
      throw err;
    }
  }
}

export default Idea;
