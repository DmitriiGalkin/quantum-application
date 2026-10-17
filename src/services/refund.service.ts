import jwt from 'jsonwebtoken';
import type { PoolConnection } from 'mysql2/promise';
import { RefundRepository } from '../repositories/refund.repository.js';
import PaymentRepository from '../repositories/payment.repository.js';
import { NotificationService } from './notification.service.js';
import { db } from '../utils/dbNext.js';
import RobokassaService from './robokassa.service.js';
import MeetRepository from '../repositories/meet.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';

const base = 'https://services.robokassa.ru/RefundService/Refund';
export class RefundService {
  static async enqueueForMeet(meetId: number, userId: number | undefined, conn: PoolConnection) {
    const meet = await MeetRepository.findById(meetId,conn,false);
    for (const payment of await PaymentRepository.paidForMeet(meetId,userId,conn)) {
      await RefundRepository.enqueue(payment.id,conn);
      await NotificationService.notify([payment.passportId],`refund-${payment.id}-queued`,'Возврат оплаты','Возврат поставлен в обработку',meet ? `/project/${meet.projectId}#meet-${meetId}` : '/chats',conn);
    }
  }
  static async dispatch() {
    if (!process.env.ROBOKASSA_PASSWORD3 || process.env.ROBOKASSA_TEST_MODE === 'true') return;
    for (const operation of await RefundRepository.pending()) {
      const payment = await PaymentRepository.getById(operation.paymentId);
      if (!payment || payment.provider !== 'robokassa') {
        await RefundRepository.set(operation.id,'failed',null,'Платёж Robokassa не найден'); continue;
      }
      if (operation.status === 'submitting') {
        await RefundRepository.set(operation.id,'uncertain',operation.requestId,'Результат предыдущего запроса неизвестен; сверить возврат в Robokassa до повторной отправки');
        continue;
      }
      if (operation.status === 'queued') {
        // OpKey is not the invoice number. Never substitute a local payment ID.
        if (!payment.providerPaymentId || !/^[A-Za-z0-9-]{40,60}$/.test(payment.providerPaymentId)) {
          try {
            payment.providerPaymentId = await RobokassaService.operationKey(payment.id);
            await PaymentRepository.setProviderPaymentId(payment.id,payment.providerPaymentId);
          } catch { await RefundRepository.annotate(operation.id,'Не удалось получить OpKey оплаты. Повторная проверка выполняется автоматически; организатору следует проверить платёж в Robokassa.'); continue; }
        }
        if (!await RefundRepository.claim(operation.id)) continue;
        try {
          const token = jwt.sign({ OpKey:payment.providerPaymentId },process.env.ROBOKASSA_PASSWORD3,{ algorithm:'HS256',noTimestamp:true });
          const response = await fetch(`${base}/Create`,{ method:'POST',headers:{ 'Content-Type':'application/json' },body:JSON.stringify(token),signal:AbortSignal.timeout(15000) });
          const result: unknown = await response.json();
          if (response.ok && result && typeof result === 'object' && 'success' in result && result.success === true && 'requestId' in result && typeof result.requestId === 'string') {
            await RefundRepository.set(operation.id,'processing',result.requestId,null);
          } else if (response.ok && result && typeof result === 'object' && 'success' in result && result.success === false) {
            await RefundRepository.set(operation.id,'failed',null,'Robokassa отклонила возврат; проверьте операцию в личном кабинете');
          } else await RefundRepository.set(operation.id,'uncertain',null,'Robokassa вернула неопределённый результат; повторная отправка заблокирована');
        } catch {
          await RefundRepository.set(operation.id,'uncertain',null,'Связь прервана; сверить операцию в Robokassa до повторной отправки');
        }
      } else if (operation.requestId) {
        try {
          const response = await fetch(`${base}/GetState?id=${encodeURIComponent(operation.requestId)}`,{ signal:AbortSignal.timeout(15000) });
          const result: unknown = await response.json();
          if (!response.ok || !result || typeof result !== 'object' || !('label' in result)) continue;
          if (result.label === 'finished' && 'amount' in result && Number(result.amount) === Number(payment.amount)) {
            await db.transaction(async conn => {
              await PaymentRepository.setRefunded(payment.id,conn);
              await RefundRepository.finish(operation.id,conn);
              await NotificationService.notify([payment.passportId],`refund-${payment.id}-finished`,'Оплата возвращена','Robokassa подтвердила полный возврат оплаты','/chats',conn);
            });
          } else if (result.label === 'canceled') await RefundRepository.set(operation.id,'failed',operation.requestId,'Возврат отменён в Robokassa');
        } catch { /* Polling is read-only; the next worker cycle checks the same request ID. */ }
      }
    }
    for (const operation of await RefundRepository.attention()) {
      const payment = await PaymentRepository.getById(operation.paymentId);
      if (!payment) continue;
      const meet = payment.targetId ? await MeetRepository.findById(payment.targetId) : null;
      const admins = meet ? (await PlacePassportRepository.members(meet.placeId)).filter(p => p.role === 'admin').map(p => p.passportId) : [];
      await db.transaction(conn => NotificationService.notify([payment.passportId,...admins,...(meet ? [meet.passportId] : [])],`refund-${payment.id}-attention-${operation.status}`,
        'Возврат требует внимания',operation.error || 'Обратитесь к организатору для проверки возврата','/chats',conn));
    }
  }
}
