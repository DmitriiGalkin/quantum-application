import { Controller, ControllerWithAuth, fail, ok } from './helper.js';

import { PaymentService } from '../services/payment.service.js';

import { CreatePayment, CreatePaymentResult } from '@shared/types';
import { Payment } from '../entities/payment.types.js';


const create: ControllerWithAuth<CreatePaymentResult, CreatePayment> = async (req, res) => {
  try {
    const payment = await PaymentService.create({
      passportId: req.passport!.id,

      provider: 'yookassa',

      targetType: req.body.targetType,
      targetId: req.body.targetId,
    });

    ok(res, payment);
  } catch (err) {
    fail(res, 'Не удалось создать платеж');
  }
};

// const webhook: Controller<void> = async (req, res) => {
//   try {
//     await PaymentService.webhookPaid(req.body.provider, req.body.providerPaymentId);
//
//     ok(res, 1);
//   } catch (err) {
//     fail(res, 'Ошибка обработки платежа');
//   }
// };

const webhook: Controller<void> = async (req, res) => {
  try {
    if (req.body.event !== 'payment.succeeded') {
      ok(res, 1);
    }

    await PaymentService.webhookPaid(req.body.object);

    ok(res, 1);
  } catch (err) {
    fail(res, 'Ошибка обработки платежа');
  }
};

const getById: ControllerWithAuth<Payment, void> = async (req, res) => {
  try {
    const payment = await PaymentService.getById(Number(req.params.id));

    if (!payment) {
      return fail(res, 'Платеж не найден', 404);
    }

    ok(res, payment);
  } catch (err) {
    fail(res, 'Не удалось получить платеж');
  }
};

export default {
  create,
  webhook,
  getById,
};
