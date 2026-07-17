import { Controller, ControllerWithAuth, fail, ok } from './helper.js';

import { PaymentService } from '../services/payment.service.js';

import { getPassportUserIds } from '../services/project-user.service.js';
import { type MeetExtendedDto, PaymentCreateDto, PaymentCreateResponseDto, PaymentDto } from '@shared/types';
import RobokassaService from '../services/robokassa.service.js';
import { MeetService } from '../services/meet.service.js';

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
  // 2026-07-16 09:02:15: {
  //   2026-07-16 09:02:15:   out_summ: '300',
  //   2026-07-16 09:02:15:   OutSum: '300',
  //   2026-07-16 09:02:15:   inv_id: '18',
  //   2026-07-16 09:02:15:   InvId: '18',
  //   2026-07-16 09:02:15:   crc: 'E797A299563B0F444180DA52191A0AC1',
  //   2026-07-16 09:02:15:   SignatureValue: 'E797A299563B0F444180DA52191A0AC1',
  //   2026-07-16 09:02:15:   PaymentMethod: 'PayButton',
  //   2026-07-16 09:02:15:   IncSum: '300',
  //   2026-07-16 09:02:15:   IncCurrLabel: 'SBPPSR',
  //   2026-07-16 09:02:15:   IsTest: '1',
  //   2026-07-16 09:02:15:   EMail: '',
  //   2026-07-16 09:02:15:   Fee: '0.0'
  //   2026-07-16 09:02:15: } RESULT

  try {
    console.log(req.body, 'RESULT');
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
