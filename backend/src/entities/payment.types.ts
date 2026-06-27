export type PaymentProvider = 'yookassa' | 'cloudpayments' | 'tbank' | 'stripe' | 'paypal';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';

export type PaymentTargetType = 'idea' | 'meet' | 'project';

export interface Payment {
  id: number;

  passportId: number;

  provider: PaymentProvider;
  providerPaymentId: string | null;

  status: PaymentStatus;

  amount: number;
  currency: string;

  targetType: PaymentTargetType;
  targetId: number;

  metadata: unknown;

  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  passportId: number;

  provider: PaymentProvider;
  status: PaymentStatus;

  amount: number;
  currency: string;

  targetType: PaymentTargetType;
  targetId: number;

  metadata?: unknown;
}