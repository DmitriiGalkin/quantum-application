import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type { RefundOperation } from 'entities';
import { db } from '../utils/dbNext.js';
export class RefundRepository {
  static async enqueue(paymentId: number, conn: PoolConnection) { await conn.execute('INSERT IGNORE INTO paymentRefund (paymentId) VALUES (?)',[paymentId]); }
  static pending() { return db.query<RefundOperation>("SELECT id,paymentId,status,requestId,error FROM paymentRefund WHERE status IN ('queued','processing') OR (status='submitting' AND updatedAt<DATE_SUB(NOW(),INTERVAL 2 MINUTE)) ORDER BY id LIMIT 50"); }
  static async claim(id: number) {
    const result = await db.execute<ResultSetHeader>("UPDATE paymentRefund SET status='submitting',error=NULL WHERE id=? AND status='queued'",[id]);
    return result.affectedRows > 0;
  }
  static async set(id: number, status: RefundOperation['status'], requestId: string | null, error: string | null) {
    await db.execute('UPDATE paymentRefund SET status=?,requestId=?,error=? WHERE id=?',[status,requestId,error?.slice(0,2000) ?? null,id]);
  }
  static async annotate(id: number,error: string) { await db.execute('UPDATE paymentRefund SET error=? WHERE id=? AND status=\'queued\'',[error,id]); }
  static async finish(id: number,conn: PoolConnection) { await conn.execute("UPDATE paymentRefund SET status='finished',error=NULL WHERE id=?",[id]); }
  static attention() { return db.query<RefundOperation>("SELECT id,paymentId,status,requestId,error FROM paymentRefund WHERE status IN ('failed','uncertain') OR (status='queued' AND error IS NOT NULL) ORDER BY id DESC LIMIT 100"); }
}
