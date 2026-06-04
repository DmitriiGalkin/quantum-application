import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { ChatMessage } from '../../../application/src/types';

class MessageModel {
  static async create(data: ChatMessage): Promise<number> {
    const sql = `
      INSERT INTO message
        (chatId, passportId, role, content, metadata, target)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `;

    // Сериализуем metadata в JSON здесь, чтобы не передавать в запрос сырые объекты.
    const values = [
      data.chatId,
      data.passportId || null,
      data.role,
      data.content || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.target || null,
    ];

    try {
      const [result] = await pool.query<ResultSetHeader>(sql, values);
      return result.insertId;
    } catch (err) {
      console.error('Message.create error:', err);
      throw err;
    }
  }

  static async findById(id: string | number): Promise<ChatMessage | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM message WHERE id = ?', [id]);
      return rows.length > 0 ? (rows[0] as ChatMessage) : null;
    } catch (err) {
      console.error('Message.findById error:', err);
      throw err;
    }
  }

  static async findByChatId(chatId: string | number): Promise<ChatMessage[]> {
    const sql = `
      SELECT *
      FROM message
      WHERE chatId = ?
      ORDER BY createdAt ASC, id ASC
    `;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [chatId]);
      return rows as ChatMessage[];
    } catch (err) {
      console.error('Message.findByChatId error:', err);
      throw err;
    }
  }

  static async findLastByChatId(chatId: string | number, limit: number): Promise<ChatMessage[]> {
    const sql = `
      SELECT *
      FROM message
      WHERE chatId = ?
      ORDER BY createdAt DESC, id DESC
      LIMIT ?
    `;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [chatId, limit]);

      // Реверс нужен, чтобы вернуть сообщения в хронологическом порядке (старый -> новый)
      return rows.reverse() as ChatMessage[];
    } catch (err) {
      console.error('Message.findLastByChatId error:', err);
      throw err;
    }
  }

  static async update(id: string | number, updateData: { content?: string; metadata?: object }): Promise<number> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Нет данных для обновления');
    }

    const sqlParts: string[] = [];
    const values: (string | number)[] = [];

    // Динамически строим SET часть запроса.
    if (updateData.content !== undefined) {
      sqlParts.push('content = ?');
      values.push(updateData.content);
    }

    if (updateData.metadata !== undefined) {
      sqlParts.push('metadata = ?');
      // Сериализуем metadata перед добавлением в запрос.
      values.push(JSON.stringify(updateData.metadata));
    }

    if (sqlParts.length === 0) {
      throw new Error('Нет валидных полей для обновления');
    }

    values.push(id); // Добавляем ID в конец массива значений для WHERE

    const sql = `
      UPDATE message
      SET ${sqlParts.join(', ')}
      WHERE id = ?
    `;

    try {
      const [result]  = await pool.query<ResultSetHeader>(sql, values);
      return result.affectedRows;
    } catch (err) {
      console.error('Message.update error:', err);
      throw err;
    }
  }
}

export default MessageModel;
