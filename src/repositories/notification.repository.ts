import type { PoolConnection } from 'mysql2/promise';
import type { AppNotification } from 'entities';
import { db } from '../utils/dbNext.js';
export class NotificationRepository {
  static async readConversation(passportId: number,conversationId: number,messageId: number) {
    await db.execute("UPDATE appNotification SET readAt=COALESCE(readAt,NOW()) WHERE passportId=? AND url=? AND eventKey LIKE 'message-%' AND CAST(SUBSTRING(eventKey,9) AS UNSIGNED)<=?",[passportId,`/chats/${conversationId}`,messageId]);
  }
  static async create(passportId: number, eventKey: string, title: string, body: string, url: string, conn: PoolConnection) {
    await conn.execute('INSERT IGNORE INTO appNotification (passportId,eventKey,title,body,url) VALUES (?,?,?,?,?)', [passportId,eventKey,title,body,url]);
  }
  static list(passportId: number) { return db.query<AppNotification>('SELECT id,passportId,title,body,url,readAt,createdAt FROM appNotification WHERE passportId=? ORDER BY id DESC LIMIT 100', [passportId]); }
  static async read(passportId: number, id: number) { await db.execute('UPDATE appNotification SET readAt=COALESCE(readAt,NOW()) WHERE id=? AND passportId=?', [id,passportId]); }
  static queued() { return db.query<AppNotification>('SELECT id,passportId,title,body,url,readAt,createdAt FROM appNotification WHERE pushedAt IS NULL AND readAt IS NULL AND attempts<5 ORDER BY id LIMIT 50'); }
  static async delivered(id: number) { await db.execute('UPDATE appNotification SET pushedAt=NOW() WHERE id=?', [id]); }
  static async retry(id: number) { await db.execute('UPDATE appNotification SET attempts=attempts+1 WHERE id=?', [id]); }
}
