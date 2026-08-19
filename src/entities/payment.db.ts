import { PaymentProvider, PaymentStatus } from './payment.types.js';
import { RowDataPacket } from 'mysql2/promise';
import { PaymentTargetType } from 'types';

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
