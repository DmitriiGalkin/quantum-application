import type { ControllerWithAuth } from './helper.js';
import { ok } from './helper.js';
import { NotificationService } from '../services/notification.service.js';
import { requireId } from '../utils/validation.js';
const list: ControllerWithAuth<unknown> = async (req,res) => {
  const beforeId = req.query.beforeId === undefined ? null : requireId(req.query.beforeId);
  ok(res,await NotificationService.list(req.passport.id,req.query.unread === 'true',beforeId));
};
const unreadCount: ControllerWithAuth<{ count: number }> = async (req,res) => { ok(res,{ count: await NotificationService.unreadCount(req.passport.id) }); };
const read: ControllerWithAuth<unknown> = async (req,res) => { await NotificationService.read(req.passport.id,requireId(req.params.id)); ok(res,true); };
const config: ControllerWithAuth<unknown> = async (_req,res) => { ok(res,{ publicKey:process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT ? process.env.VAPID_PUBLIC_KEY || null : null }); };
const subscribe: ControllerWithAuth<unknown,unknown> = async (req,res) => { await NotificationService.subscribe(req.passport.id,req.body); ok(res,true); };
const unsubscribe: ControllerWithAuth<unknown,{ endpoint: string }> = async (req,res) => { if (typeof req.body.endpoint === 'string') await NotificationService.unsubscribe(req.passport.id,req.body.endpoint); ok(res,true); };
export default { list,unreadCount,read,config,subscribe,unsubscribe };
