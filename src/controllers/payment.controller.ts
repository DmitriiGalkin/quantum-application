import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';

import { PaymentService } from '../services/payment.service.js';

import type { PaymentCreateDto, PaymentCreateResponseDto, PaymentDto } from 'entities';

const create: ControllerWithAuth<PaymentCreateResponseDto, PaymentCreateDto> = async (req, res) => {
  try {
    const payment = await PaymentService.createForPassport(req.passport!.id, {
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

    const response = await PaymentService.confirmResult({ OutSum, InvId, SignatureValue });

    ok(res, response);
  } catch (error) {
    fail(res, 'Ошибка подтверждения платежа от платежной системы');
  }
};

const findById: ControllerWithAuth<PaymentDto> = async (req, res) => {
  try {
    const payment = await PaymentService.getById(Number(req.params.id));

    if (!payment) {
      fail(res, 'Платеж не обнаружен', 404);
    }

    ok(res, payment);
  } catch (err) {
    fail(res, 'Ошибка при получении встречи');
  }
};

export default {
  create,
  result,
  findById,
};
