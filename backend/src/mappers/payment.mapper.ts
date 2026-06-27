import { PaymentRow } from '../entities/payment.db.js';
import { Payment } from '../entities/payment.types.js';

export const toPayment = (row: PaymentRow): Payment => ({
  ...row,
  metadata: row.metadata ? JSON.parse(row.metadata) : null,
  paidAt: row.paidAt ? new Date(row.paidAt) : null,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});
