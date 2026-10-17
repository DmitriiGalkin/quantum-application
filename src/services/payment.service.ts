import PaymentRepository from '../repositories/payment.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import RobokassaService from './robokassa.service.js';
import { getPassportUserIds } from './project-user.service.js';
import type { CreatePaymentDto, PaymentDto } from 'entities';
import { MeetService } from './meet.service.js';
import { HttpError } from '../utils/http-error.js';
import { requireId } from '../utils/validation.js';
import { db } from '../utils/dbNext.js';
import { RefundService } from './refund.service.js';
import { MeetChangeParticipantRepository } from '../repositories/meet-change-participant.repository.js';

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
    if (targetType !== 'meet' || provider !== 'robokassa' || currency !== 'RUB') {
      throw new HttpError('Поддерживается только оплата встреч через Robokassa в RUB', 400);
    }
    requireId(targetId);
    RobokassaService.requireConfiguration();
    let amount = 0;
    let description = '';
    switch (targetType) {
      case 'meet': {
        const meet = await MeetRepository.findById(targetId);

        if (!meet || meet.deletedAt) throw new HttpError('Встреча не найдена', 404);
        if (meet.status !== 'published' || meet.bookingState === 'needs_location') throw new HttpError('Оплата доступна после подтверждения площадки', 409);
        if (typeof meet.price !== 'number' || !Number.isSafeInteger(meet.price) || meet.price <= 0)
          throw new HttpError('Встреча бесплатная или цена некорректна', 400);

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

    const meet = payment.targetType === 'meet' && payment.targetId ? await MeetService.findById(payment.targetId) : null;

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
    if (
      typeof OutSum !== 'string' ||
      !/^\d+(?:\.\d{1,6})?$/.test(OutSum) ||
      !Number.isFinite(Number(OutSum)) ||
      Number(OutSum) <= 0 ||
      typeof SignatureValue !== 'string'
    )
      throw new HttpError('Некорректные параметры оплаты', 400);
    const id = requireId(InvId);
    const isValid = RobokassaService.verifyResultSignature(OutSum, InvId, SignatureValue);

    if (!isValid) {
      throw new HttpError('Неверная подпись', 400);
    }

    const payment = await PaymentRepository.getById(id);

    if (!payment) {
      throw new HttpError('Платеж не обнаружен', 404);
    }

    if (Number(payment.amount) !== Number(OutSum)) {
      throw new HttpError('Стоимость не совпадает', 400);
    }

    if (payment.status !== 'paid' && payment.status !== 'refunded') {
      if (payment.status !== 'pending') throw new HttpError('Платёж уже закрыт', 409);
      await PaymentService.markPaid(payment.id);
    }

    return `OK${InvId}`;
  }

  static async markPaid(paymentId: number) {
    const payment = await PaymentRepository.getById(paymentId);
    if (!payment) throw new HttpError('Платёж не найден',404);
    if (payment.targetType !== 'meet' || !payment.targetId) return PaymentRepository.setPaid(paymentId);
    await db.transaction(async conn => {
      const meet = await MeetRepository.findById(payment.targetId!,conn);
      await PaymentRepository.setPaid(paymentId,conn);
      const change = meet?.bookingRevision && payment.userId ? await MeetChangeParticipantRepository.get(meet.id,meet.bookingRevision,payment.userId) : null;
      if (meet?.status === 'cancelled' || change?.response === 'declined') await RefundService.enqueueForMeet(payment.targetId!,payment.userId ?? undefined,conn);
    });
  }

  static async markFailed(paymentId: number) {
    await PaymentRepository.setStatus(paymentId, 'failed');
  }

  static async markCancelled(paymentId: number) {
    await PaymentRepository.setStatus(paymentId, 'canceled');
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
