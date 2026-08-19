import type{ PaymentProvider, PaymentStatus } from './payment.types.js';
import type { RowDataPacket } from 'mysql2/promise';
import type{ PaymentTargetType } from 'dto';

export interface PaymentRow extends RowDataPacket {
  id: number;

  passportId: number;
  userId: number;

  provider: PaymentProvider;
  providerPaymentId: string | null;

  status: PaymentStatus;

  amount: number;
  currency: string;

  targetType: PaymentTargetType;
  targetId: number;

  metadata: string | null;
  description: string | null;

  paidAt: string | null;

  createdAt: string;
  updatedAt: string;
}
