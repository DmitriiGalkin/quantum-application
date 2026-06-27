import { PaymentProvider, PaymentStatus, PaymentTargetType } from './payment.types.js';
import { RowDataPacket } from 'mysql2/promise';

export interface PaymentRow extends RowDataPacket {
  id: number;

  passportId: number;

  provider: PaymentProvider;
  providerPaymentId: string | null;

  status: PaymentStatus;

  amount: number;
  currency: string;

  targetType: PaymentTargetType;
  targetId: number;

  metadata: string | null;

  paidAt: string | null;

  createdAt: string;
  updatedAt: string;
}
