import type { PoolConnection } from 'mysql2/promise';
import type { AppNotification, NotificationPage } from 'entities';
import { db } from '../utils/dbNext.js';
export class NotificationRepository {
  static async readConversation(passportId: number,conversationId: number,messageId: number) {
    await db.execute("UPDATE appNotification SET readAt=COALESCE(readAt,NOW()) WHERE passportId=? AND url=? AND (eventKey=? OR (eventKey LIKE 'message-%' AND CAST(SUBSTRING(eventKey,9) AS UNSIGNED)<=?))",[passportId,`/chats/${conversationId}`,`chat-${conversationId}-started`,messageId]);
  }
  static async create(passportId: number, eventKey: string, title: string, body: string, url: string, conn: PoolConnection) {
    await conn.execute('INSERT IGNORE INTO appNotification (passportId,eventKey,title,body,url) VALUES (?,?,?,?,?)', [passportId,eventKey,title,body,url]);
  }
  static async list(passportId: number, unreadOnly: boolean, beforeId: number | null): Promise<NotificationPage> {
    const clauses = ['passportId = ?'];
    const values: number[] = [passportId];
    if (unreadOnly) clauses.push('readAt IS NULL');
    if (beforeId !== null) { clauses.push('id < ?'); values.push(beforeId); }
    const rows = await db.query<AppNotification>(`SELECT id,passportId,title,body,url,readAt,createdAt FROM appNotification WHERE ${clauses.join(' AND ')} ORDER BY id DESC LIMIT 21`, values);
    return { items: rows.slice(0, 20), nextCursor: rows.length > 20 ? rows[19].id : null };
  }
  static async unreadCount(passportId: number): Promise<number> {
    const [row] = await db.query<{ count: number }>('SELECT COUNT(*) AS count FROM appNotification WHERE passportId=? AND readAt IS NULL', [passportId]);
    return Number(row.count);
  }
  static async read(passportId: number, id: number) { await db.execute('UPDATE appNotification SET readAt=COALESCE(readAt,NOW()) WHERE id=? AND passportId=?', [id,passportId]); }
  static queued() { return db.query<AppNotification>('SELECT id,passportId,title,body,url,readAt,createdAt FROM appNotification WHERE pushedAt IS NULL AND readAt IS NULL AND attempts<5 ORDER BY id LIMIT 50'); }
  static async delivered(id: number) { await db.execute('UPDATE appNotification SET pushedAt=NOW() WHERE id=?', [id]); }
  static async retry(id: number) { await db.execute('UPDATE appNotification SET attempts=attempts+1 WHERE id=?', [id]); }
}
