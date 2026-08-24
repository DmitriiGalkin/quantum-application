import type { PaymentRow } from 'entities/payment.db.js';
import type { Payment } from 'entities/payment.types.js';

export const toPayment = (row: PaymentRow): Payment => ({
  ...row,
  metadata: row.metadata ? JSON.parse(row.metadata) : null,
});
