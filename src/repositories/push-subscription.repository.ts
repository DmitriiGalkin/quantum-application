import { createHash } from 'node:crypto';
import type { PushSubscription } from 'web-push';
import { db } from '../utils/dbNext.js';
export class PushSubscriptionRepository {
  static async save(passportId: number, subscription: PushSubscription) {
    await db.execute(`INSERT INTO pushSubscription (passportId,endpoint,endpointHash,subscription) VALUES (?,?,?,?)
      ON DUPLICATE KEY UPDATE passportId=VALUES(passportId),subscription=VALUES(subscription)`,
    [passportId,subscription.endpoint,createHash('sha256').update(subscription.endpoint).digest('hex'),JSON.stringify(subscription)]);
  }
  static list(passportId: number) { return db.query<{ id: number; subscription: PushSubscription | string }>('SELECT id,subscription FROM pushSubscription WHERE passportId=?', [passportId]); }
  static async remove(passportId: number, endpoint: string) { await db.execute('DELETE FROM pushSubscription WHERE passportId=? AND endpointHash=?', [passportId,createHash('sha256').update(endpoint).digest('hex')]); }
  static async removeId(id: number) { await db.execute('DELETE FROM pushSubscription WHERE id=?', [id]); }
}
