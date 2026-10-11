import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { db } from '../utils/dbNext.js';

import type { PaymentRow, CreatePaymentInput, Payment } from 'entities';

import { toPayment } from '../mappers/payment.mapper.js';

class PaymentRepository {
  static async moveSeedTarget(id: number, ideaId: number, conn: PoolConnection): Promise<void> {
    await conn.execute("UPDATE payment SET targetId = ? WHERE id = ? AND targetType = 'idea'", [ideaId, id]);
  }

  static async removeSeedRows(ids: number[], conn: PoolConnection): Promise<void> {
    if (ids.length) await conn.query('DELETE FROM payment WHERE id IN (?)', [ids]);
  }
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM payment FOR UPDATE');
    return rows;
  }

  // ✅ CREATE
  static async create(data: CreatePaymentInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO payment
        (
          passportId,
          userId,
          provider,
          status,
          amount,
          currency,
          targetType,
          targetId,
          description
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.passportId,
        data.userId,
        data.provider,
        data.status,
        data.amount,
        data.currency,
        data.targetType,
        data.targetId,
        data.description ?? null
      ],
    );

    return result.insertId;
  }

  // ✅ READ
  static async getById(id: number): Promise<Payment | null> {
    const rows = await db.execute<PaymentRow[]>(
      `SELECT *
         FROM payment
        WHERE id = ?`,
      [id],
    );

    return rows.length ? toPayment(rows[0]) : null;
  }

  static async getByProviderPaymentId(provider: Payment['provider'], providerPaymentId: string): Promise<Payment | null> {
    const rows = await db.execute<PaymentRow[]>(
      `SELECT *
         FROM payment
        WHERE provider = ?
          AND providerPaymentId = ?`,
      [provider, providerPaymentId],
    );

    return rows.length ? toPayment(rows[0]) : null;
  }

  static async findPaidMeetIdsByUser(userId: number, meetIds: number[]): Promise<number[]> {
    const rows = await db.execute<PaymentRow[]>(
      `SELECT targetId
       FROM payment
       WHERE userId = ?
         AND targetType = 'meet'
         AND status = 'paid'
         AND targetId IN (${meetIds.map(() => '?').join(',')})`,
      [userId, ...meetIds],
    );

    return rows.map(r => r.targetId);
  }

  // ✅ UPDATE
  static async setProviderPaymentId(id: number, providerPaymentId: string): Promise<void> {
    await db.execute(
      `UPDATE payment
          SET providerPaymentId = ?
        WHERE id = ?`,
      [providerPaymentId, id],
    );
  }

  static async setPaid(id: number): Promise<void> {
    const result = await db.execute<ResultSetHeader>(
      `UPDATE payment
          SET status = 'paid',
              paidAt = NOW()
        WHERE id = ? AND status = 'pending'`,
      [id],
    );
    if (!result.affectedRows) {
      const payment = await this.getById(id);
      if (payment?.status !== 'paid') throw new Error('Payment could not be confirmed');
    }
  }

  static async setStatus(id: number, status: Payment['status']): Promise<void> {
    await db.execute(
      `UPDATE payment
          SET status = ?
        WHERE id = ?`,
      [status, id],
    );
  }
}

export default PaymentRepository;
