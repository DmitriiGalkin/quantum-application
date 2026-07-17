import PaymentRepository from '../repositories/payment.repository.js';
import type { Payment, PaymentProvider } from '../entities/payment.types.js';
import MeetRepository from '../repositories/meet.repository.js';
import RobokassaService from './robokassa.service.js';
import { PaymentDto, PaymentTargetType } from '@shared/types';
import PlaceRepository from '../repositories/place.repository.js';
import { Place } from '../entities/place.js';
import UserRepository from '../repositories/user.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import { Passport } from '../entities/passport.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';

interface CreatePaymentDto {
  passportId: number;
  userId: number;

  provider: PaymentProvider;

  targetType: PaymentTargetType;
  targetId: number;

  currency?: string;

  metadata?: unknown;
}

// type YooKassaPayment = {
//   id: string;
//   status: string;
//   paid: boolean;
//   amount: {
//     value: string;
//     currency: string;
//   };
//   metadata?: {
//     meetId?: string;
//     ideaId?: string;
//     projectId?: string;
//     userId?: string;
//   };
// };

export class PaymentService {
  static async create({ passportId, provider, targetType, targetId, currency = 'RUB', userId }: CreatePaymentDto) {
    let amount = 0;
    let description = '';
    switch (targetType) {
      case 'meet': {
        const meet = await MeetRepository.findById(targetId);

        if (!meet) throw new Error('Встреча не найдена');
        if (!meet.price) throw new Error('Встреча то бесплатная');

        description = `Оплата встречи «${meet.id}»`;
        amount = meet.price;
        break;
      }
    }

    const paymentId = await PaymentRepository.create({
      passportId,
      userId,
      provider,
      status: 'pending',
      amount,
      currency,
      targetType,
      targetId,
      description,
    });

    const payment = await PaymentRepository.getById(paymentId);

    if (!payment) {
      throw new Error('Payment was not created.');
    }

    const paymentUrl = RobokassaService.createPaymentUrl(payment.id, payment.amount, payment.description || '');

    return {
      payment,
      paymentUrl,
    };
  }

  static async getById(id: number): Promise<PaymentDto> {
    const payment = await PaymentRepository.getById(id);

    if (!payment) {
      throw new Error('Payment not found.');
    }

    const meet = (payment.targetType === 'meet' && payment.targetId) ? await MeetRepository.findById(payment.targetId) : null;

    return { ...payment, meet };
  }
  //
  // async getByPassportId(passportId: number) {
  //   return PaymentRepository.findByPassportId(passportId);
  // }
  //
  // async getByUserId(userId: number) {
  //   return PaymentRepository.findByUserId(userId);
  // }
  //
  // async getByTarget(targetType: PaymentTargetType, targetId: number) {
  //   return PaymentRepository.findByTarget(targetType, targetId);
  // }

  static async markPaid(paymentId: number) {
    await PaymentRepository.setStatus(paymentId, 'paid');
  }

  static async markFailed(paymentId: number) {
    await PaymentRepository.setStatus(paymentId, 'failed');
  }

  static async markCancelled(paymentId: number) {
    await PaymentRepository.setStatus(paymentId, 'cancelled');
  }

  static async markPending(paymentId: number) {
    await PaymentRepository.setStatus(paymentId, 'pending');
  }

  // static async isPaid(paymentId: number): Promise<boolean> {
  //   const payment = await this.getById(paymentId);
  //
  //   return payment.status === 'paid';
  // }
}
