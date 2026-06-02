import pool from '../db.js'; // Импортируем пул соединений

class IdeaUser {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.ideaId = data.ideaId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
          'INSERT INTO `ideaUser` (ideaId, userId) VALUES (?, ?)',
          [data.ideaId, data.userId],
      );
      return result.insertId;
    } catch (err) {
      console.error('ideaUser.create error:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM ideaUser WHERE id = ?', [id]);
    } catch (err) {
      console.error('ideaUser.delete error:', err);
      throw err;
    }
  }

  static async deleteByUserId(userId) {
    try {
      await pool.query('DELETE FROM ideaUser WHERE userId = ?', [userId]);
    } catch (err) {
      console.error('ideaUser.deleteByUserId error:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM ideaUser WHERE id = ?', [id]);
      return rows.length > 0 ? new IdeaUser(rows[0]) : null;
    } catch (err) {
      console.error('ideaUser.findById error:', err);
      throw err;
    }
  }

  static async findByIdeaId(projectId) {
    try {
      const [rows] = await pool.query('SELECT * FROM ideaUser WHERE ideaId = ?', [
        projectId,
      ]);
      return rows.map(row => new IdeaUser(row));
    } catch (err) {
      console.error('ideaUser.findByProjectId error:', err);
      throw err;
    }
  }
}

export default IdeaUser;
