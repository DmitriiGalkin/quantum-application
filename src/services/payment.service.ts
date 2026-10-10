import PaymentRepository from '../repositories/payment.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import RobokassaService from './robokassa.service.js';
import { getPassportUserIds } from './project-user.service.js';
import type { CreatePaymentDto, PaymentDto } from 'entities';
import { MeetService } from './meet.service.js';
import { HttpError } from '../utils/http-error.js';


export class PaymentService {
  static async createForPassport(passportId: number, data: Omit<CreatePaymentDto, 'passportId'>) {
    const allowedIds = await getPassportUserIds(passportId);

    if (!allowedIds.includes(data.userId)) {
      throw new HttpError('Нельзя добавлять участника не из своего пасспорта', 403);
    }

    return PaymentService.create({
      ...data,
      passportId,
    });
  }

  static async create({ passportId, provider, targetType, targetId, currency = 'RUB', userId }: CreatePaymentDto) {
    let amount = 0;
    let description = '';
    switch (targetType) {
      case 'meet': {
        const meet = await MeetRepository.findById(targetId);

        if (!meet) throw new HttpError('Встреча не найдена', 404);
        if (!meet.price) throw new HttpError('Встреча то бесплатная', 400);

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

  static async getById(id: number, passportId: number): Promise<PaymentDto> {
    const payment = await PaymentRepository.getById(id);

    if (!payment) {
      throw new HttpError('Платеж не найден', 404);
    }
    if (payment.passportId !== passportId) throw new HttpError('Нет доступа к платежу', 403);

    const meet = (payment.targetType === 'meet' && payment.targetId) ? await MeetService.findById(payment.targetId) : null;

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

  static async confirmResult({ OutSum, InvId, SignatureValue }: { OutSum: string; InvId: string; SignatureValue: string }) {
    const isValid = RobokassaService.verifyResultSignature(OutSum, InvId, SignatureValue);

    if (!isValid) {
      throw new HttpError('Неверная подпись', 400);
    }

    const payment = await PaymentRepository.getById(Number(InvId));

    if (!payment) {
      throw new HttpError('Платеж не обнаружен', 404);
    }

    if (payment.status !== 'paid') {
      if (Number(payment.amount) !== Number(OutSum)) {
        throw new HttpError('Стоимость не совпадает', 400);
      }

      await PaymentService.markPaid(payment.id);
    }

    return `OK${InvId}`;
  }

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
