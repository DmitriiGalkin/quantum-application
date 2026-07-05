import { Controller, ControllerWithAuth, fail, ok } from './helper.js';

import { PaymentService } from '../services/payment.service.js';

import { getPassportUserIds } from '../services/project-user.service.js';
import { PaymentCreateDto, PaymentCreateResponseDto } from '@shared/types';
import RobokassaService from '../services/robokassa.service.js';

const create: ControllerWithAuth<PaymentCreateResponseDto, PaymentCreateDto> = async (req, res) => {
  try {
    const allowedIds = await getPassportUserIds(req.passport!.id);

    if (!allowedIds.includes(req.body.userId)) {
      throw new Error('Нельзя добавлять участника не из своего пасспорта');
    }

    const payment = await PaymentService.create({
      passportId: req.passport!.id,
      provider: 'yookassa',

      targetType: req.body.targetType,
      targetId: req.body.targetId,
      userId: req.body.userId,
    });

    ok(res, payment);
  } catch (err) {
    fail(res, 'Не удалось создать платеж');
  }
};

const result: Controller<string> = async (req, res) => {
  try {
    const { OutSum, InvId, SignatureValue } = req.body;

    const isValid = RobokassaService.verifyResultSignature(OutSum, InvId, SignatureValue);

    if (!isValid) {
      fail(res, 'Наверная подпись', 400);
    }

    const payment = await PaymentService.getById(Number(InvId));

    if (!payment) {
      fail(res, 'Платеж не обнаружен', 404);
    }

    if (payment.status !== 'paid') {
      if (Number(payment.amount) !== Number(OutSum)) {
        fail(res, 'Стоимость не совпадает', 400);
      }

      await PaymentService.markPaid(payment.id);
    }

    ok(res, `OK${InvId}`);
  } catch (error) {
    console.error(error);

    fail(res, 'Ошибка подтверждения платежа от платежной системы');
  }
};

export default {
  create,
  result,
};
