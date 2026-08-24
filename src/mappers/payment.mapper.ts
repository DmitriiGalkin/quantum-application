import type { PaymentRow, Payment } from 'entities';

export const toPayment = (row: PaymentRow): Payment => ({
  ...row,
  metadata: row.metadata ? JSON.parse(row.metadata) : null,
});
