import type { RowDataPacket } from 'mysql2/promise';
import type { PaymentStatus } from 'entities';
import type { MeetDto } from './meet.js';

export type PaymentProvider = 'yookassa' | 'cloudpayments' | 'tbank' | 'stripe' | 'paypal' | 'robokassa';
export type PaymentTargetType = 'project' | 'meet' | 'subscription' | 'other';

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

export interface PaymentCreateDto {
  userId: number;

  targetType: PaymentTargetType;
  targetId: number;
}

export interface PaymentDto {
  id: number;

  passportId: number;
  userId: number | null;

  targetType: PaymentTargetType;
  targetId: number | null;

  amount: number;
  status: PaymentStatus;

  meet: MeetDto | null;
}

export interface PaymentCreateResponseDto {
  paymentId: number;
  paymentUrl: string;
}

export interface Payment {
  id: number;

  passportId: number;
  userId: number | null;

  targetType: PaymentTargetType;
  targetId: number | null;

  provider: PaymentProvider;

  amount: number;

  description: string | null;
  metadata: string;

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

export interface CreatePaymentDto {
  passportId: number;
  userId: number;

  provider: PaymentProvider;

  targetType: PaymentTargetType;
  targetId: number;

  currency?: string;

  metadata?: unknown;
}