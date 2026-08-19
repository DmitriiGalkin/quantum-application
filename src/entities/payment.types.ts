import type { PaymentTargetType } from 'types';

export type PaymentProvider = 'yookassa' | 'cloudpayments' | 'tbank' | 'stripe' | 'paypal' | 'robokassa';

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'cancelled';

export interface Payment {
  id: number;

  passportId: number;
  userId: number | null;

  targetType: PaymentTargetType;
  targetId: number | null;

  provider: PaymentProvider;

  amount: number;

  description: string | null;
  metadata: string

  status: PaymentStatus;

  providerPaymentId: string | null;

  paidAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  passportId: number;
  userId: number;

  provider: PaymentProvider;
  status: PaymentStatus;

  amount: number;
  currency: string;

  targetType: PaymentTargetType;
  targetId: number;

  description?: string;
}