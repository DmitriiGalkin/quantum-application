import webpush, { type PushSubscription } from 'web-push';
import type { PoolConnection } from 'mysql2/promise';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { PushSubscriptionRepository } from '../repositories/push-subscription.repository.js';
import { HttpError } from '../utils/http-error.js';
export function validatePushSubscription(value: unknown): PushSubscription {
  if (!value || typeof value !== 'object' || !('endpoint' in value) || typeof value.endpoint !== 'string' || !('keys' in value) || !value.keys || typeof value.keys !== 'object'
    || !('p256dh' in value.keys) || typeof value.keys.p256dh !== 'string' || !('auth' in value.keys) || typeof value.keys.auth !== 'string') throw new HttpError('Некорректная Push-подписка', 400);
  let url: URL;
  try { url = new URL(value.endpoint); } catch { throw new HttpError('Некорректный адрес Push',400); }
  const allowed = ['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com','notify.windows.com'];
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !allowed.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) throw new HttpError('Неизвестный сервер Push', 400);
  if (value.endpoint.length > 4000 || value.keys.auth.length > 200 || value.keys.p256dh.length > 200) throw new HttpError('Некорректная Push-подписка', 400);
  return { endpoint: value.endpoint, keys: { p256dh: value.keys.p256dh, auth: value.keys.auth } };
}
export class NotificationService {
  static async notify(ids: number[], key: string, title: string, body: string, url: string, conn: PoolConnection) {
    for (const id of new Set(ids)) await NotificationRepository.create(id,key,title,body,url,conn);
  }
  static async subscribe(passportId: number, input: unknown) {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) throw new HttpError('Push ещё не настроен', 503);
    await PushSubscriptionRepository.save(passportId,validatePushSubscription(input));
  }
  static list = NotificationRepository.list;
  static unreadCount = NotificationRepository.unreadCount;
  static read = NotificationRepository.read;
  static unsubscribe = PushSubscriptionRepository.remove;
  static async dispatch() {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) return;
    webpush.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
    for (const item of await NotificationRepository.queued()) {
      let failed = false;
      for (const device of await PushSubscriptionRepository.list(item.passportId)) {
        try {
          const subscription = typeof device.subscription === 'string' ? JSON.parse(device.subscription) as PushSubscription : device.subscription;
          await webpush.sendNotification(subscription,JSON.stringify({ title:item.title,body:item.body,url:item.url,tag:`notification-${item.id}` }),{ TTL:3600, timeout:10000 });
        } catch (error) {
          if (error && typeof error === 'object' && 'statusCode' in error && [404,410].includes(Number(error.statusCode))) await PushSubscriptionRepository.removeId(device.id);
          else failed = true;
        }
      }
      if (failed) await NotificationRepository.retry(item.id); else await NotificationRepository.delivered(item.id);
    }
  }
}
