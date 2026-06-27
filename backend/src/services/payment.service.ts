import { Context } from './chat/chat.meta.js';
import PaymentRepository from '../repositories/payment.repository.js';
import type { PaymentProvider, PaymentTargetType } from '../entities/payment.types.js';
import MeetRepository from '../repositories/meet.repository.js';

interface CreatePaymentDto {
  passportId: number;

  provider: PaymentProvider;

  targetType: PaymentTargetType;
  targetId: number;

  currency?: string;

  metadata?: unknown;
}

type YooKassaPayment = {
  id: string;
  status: string;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  metadata?: {
    meetId?: string;
    ideaId?: string;
    projectId?: string;
    userId?: string;
  };
};

export class PaymentService {
  static async create({ passportId, provider, targetType, targetId, currency = 'RUB', metadata }: CreatePaymentDto) {
    let amount = 0;
    switch (targetType) {
      case 'meet': {
        const meet = await MeetRepository.findById(targetId);

        if (!meet) throw new Error('Встреча не найдена');
        if (!meet.price) throw new Error('Встреча то бесплатная');

        amount = meet.price;
        break;
      }
    }

    const paymentId = await PaymentRepository.create({
      passportId,
      provider,
      status: 'pending',
      amount,
      currency,
      targetType,
      targetId,
      metadata,
    });

    // TODO:
    // здесь будет создание платежа через API ЮKassa / Stripe
    // const externalPayment = await provider.createPayment(...)

    // await paymentRepository.setProviderPaymentId(paymentId, externalPayment.id)

    return {
      paymentId,

      // Пока заглушка
      paymentUrl: '',
    };
  }

  static async webhookPaid(payment: YooKassaPayment) {
    const provider: PaymentProvider = 'yookassa';
    console.log('1')
    const dbPayment = await PaymentRepository.getByProviderPaymentId(provider, payment.id);
    console.log('2', dbPayment);
    if (!dbPayment) {
      throw new Error('Payment not found');
    }
    console.log('2.1', dbPayment);
    // идемпотентность
    if (dbPayment.status === 'paid') {
      return dbPayment;
    }
    console.log('3');
    if (!payment.paid || payment.status !== 'succeeded') {
      return dbPayment;
    }

    await PaymentRepository.setPaid(dbPayment.id);
    console.log('4');
    switch (dbPayment.targetType) {
      case 'meet':
        if (payment.metadata?.meetId) {
          console.log('Поздраляю наш сервис с оплатой')
        }
        break;
    }

    return dbPayment;
  }

  static async getById(a: any) {
    return PaymentRepository.getById(a);
  }
}
