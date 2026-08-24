import type { MeetDto } from 'dto/meet.dto.ts';

export type PaymentTargetType = 'project' | 'meet' | 'subscription' | 'other';

export interface PaymentCreateDto {
  userId: number;

  targetType: PaymentTargetType;
  targetId: number;
}

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'cancelled';

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