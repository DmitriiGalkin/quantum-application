import { requireId } from '../utils/validation.js';
import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';

import { PaymentService } from '../services/payment.service.js';

import type { PaymentCreateDto, PaymentCreateResponseDto, PaymentDto } from 'entities';

const create: ControllerWithAuth<PaymentCreateResponseDto, PaymentCreateDto> = async (req, res) => {
  const payment = await PaymentService.createForPassport(req.passport!.id, {
    provider: 'yookassa',
    targetType: req.body.targetType,
    targetId: req.body.targetId,
    userId: req.body.userId,
  });

  ok(res, payment);
};

const result: Controller<string, { OutSum: string; InvId: string; SignatureValue: string }> = async (req, res) => {
  const { OutSum, InvId, SignatureValue } = req.body;

  const response = await PaymentService.confirmResult({ OutSum, InvId, SignatureValue });

  ok(res, response);
};

const findById: ControllerWithAuth<PaymentDto> = async (req, res) => {
  const payment = await PaymentService.getById(requireId(req.params.id), req.passport.id);

  if (!payment) {
    fail('Платеж не обнаружен', 404);
  }

  ok(res, payment);
};

export default {
  create,
  result,
  findById,
};
