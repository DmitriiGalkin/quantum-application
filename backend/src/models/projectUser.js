import pool from '../db.js'; // Импортируем пул соединений

class ProjectUser {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.projectId = data.projectId;
    // Добавим даты, если они есть в таблице
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Создает новую запись об участии.
   * @param {Object} data - Данные для вставки (userId, projectId).
   * @returns {Promise<number>} ID созданной записи.
   */
  static async create(data) {
    try {
      const [result] = await pool.query(
          'INSERT INTO `projectUser` (projectId, userId) VALUES (?, ?)',
          [data.projectId, data.userId],
      );
      return result.insertId;
    } catch (err) {
      console.error('projectUser.create error:', err);
      throw err;
    }
  }

  /**
   * Удаляет участие по ID.
   * @param {number} id - ID записи участия.
   * @returns {Promise<void>}
   */
  static async delete(id) {
    try {
      await pool.query('DELETE FROM projectUser WHERE id = ?', [id]);
    } catch (err) {
      console.error('projectUser.delete error:', err);
      throw err;
    }
  }

  /**
   * Удаляет все участия пользователя.
   * @param {string} userId - ID пользователя.
   * @returns {Promise<void>}
   */
  static async deleteByUserId(userId) {
    try {
      await pool.query('DELETE FROM projectUser WHERE userId = ?', [userId]);
    } catch (err) {
      console.error('projectUser.deleteByUserId error:', err);
      throw err;
    }
  }

  /**
   * Находит участие по ID.
   * @param {number} id - ID записи.
   * @returns {Promise<ProjectUser|null>}
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM projectUser WHERE id = ?', [id]);
      return rows.length > 0 ? new ProjectUser(rows[0]) : null;
    } catch (err) {
      console.error('projectUser.findById error:', err);
      throw err;
    }
  }

  /**
   * Находит все участия в проекте.
   * @param {number} projectId - ID проекта.
   * @returns {Promise<ProjectUser[]>}
   */
  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.query('SELECT * FROM projectUser WHERE projectId = ?', [
        projectId,
      ]);
      return rows.map(row => new ProjectUser(row));
    } catch (err) {
      console.error('projectUser.findByProjectId error:', err);
      throw err;
    }
  }

  /**
   * Проверяет, участвует ли пользователь в проекте.
   * @param {number} userId - ID пользователя.
   * @param {number} projectId - ID проекта.
   * @returns {Promise<ProjectUser|null>}
   */
  static async findByUserAndProjectIds(userId, projectId) {
    try {
      const sql = 'SELECT * FROM projectUser WHERE userId = ? AND projectId = ?';
      const [rows] = await pool.query(sql, [userId, projectId]);
      return rows.length > 0 ? new ProjectUser(rows[0]) : null;
    } catch (err) {
      console.error('projectUser.findByUserAndProjectIds error:', err);
      throw err;
    }
  }
}

export default ProjectUser;
