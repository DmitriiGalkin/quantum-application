import { ResultSetHeader } from 'mysql2/promise';

import { db } from '../dbNext.js';

import { PaymentRow } from '../entities/payment.db.js';
import { CreatePaymentInput, Payment } from '../entities/payment.types.js';

import { toPayment } from '../mappers/payment.mapper.js';

class PaymentRepository {
  // ✅ CREATE
  static async create(data: CreatePaymentInput): Promise<number> {
    console.log('create payment', data);
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
        data.description
      ],
    );
    console.log('create payment result', result);

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
    await db.execute(
      `UPDATE payment
          SET status = 'paid',
              paidAt = NOW()
        WHERE id = ?`,
      [id],
    );
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
