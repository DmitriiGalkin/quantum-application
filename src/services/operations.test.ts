import { beforeEach, expect, it, vi } from 'vitest';
import type { Meet, PlaceLocation } from 'entities';
const conn = vi.hoisted(() => ({ execute:vi.fn() }));
vi.mock('../utils/dbNext.js',() => ({ db:{ transaction:vi.fn(async (fn:(value:unknown)=>unknown)=>fn(conn)) } }));
vi.mock('../repositories/meet.repository.js',() => ({default:{findById:vi.fn(),update:vi.fn(),findConflict:vi.fn()}}));
vi.mock('../repositories/passport.repository.js',() => ({default:{lockByIds:vi.fn()}}));
vi.mock('../repositories/place.repository.js',() => ({default:{findById:vi.fn()}}));
vi.mock('../repositories/place-location.repository.js',() => ({default:{lockByIds:vi.fn(),findByIds:vi.fn()}}));
vi.mock('../repositories/place-passport.repository.js',() => ({default:{findMembership:vi.fn()}}));
vi.mock('../repositories/place-schedule.repository.js',() => ({default:{findByPlaceId:vi.fn()}}));
vi.mock('../repositories/meet-user.repository.js',() => ({default:{findParticipants:vi.fn(),delete:vi.fn()}}));
vi.mock('../repositories/rental.repository.js',() => ({RentalRepository:{conflicts:vi.fn()}}));
vi.mock('./booking-change.service.js',async () => {
  const actual = await vi.importActual<typeof import('./booking-change.service.js')>('./booking-change.service.js');
  return {...actual,BookingChangeService:{announce:vi.fn()}};
});
vi.mock('./refund.service.js',() => ({RefundService:{enqueueForMeet:vi.fn()}}));
vi.mock('./notification.service.js',async () => {
  const actual = await vi.importActual<typeof import('./notification.service.js')>('./notification.service.js');
  return {...actual,NotificationService:{notify:vi.fn()}};
});
import Meets from '../repositories/meet.repository.js';
import Places from '../repositories/place.repository.js';
import Rooms from '../repositories/place-location.repository.js';
import Members from '../repositories/place-passport.repository.js';
import Schedule from '../repositories/place-schedule.repository.js';
import Participants from '../repositories/meet-user.repository.js';
import { MeetService } from './meet.service.js';
import { RefundService } from './refund.service.js';
import { BookingChangeService, changeReason } from './booking-change.service.js';
import { validatePushSubscription } from './notification.service.js';
const meet:Meet = {id:9,projectId:3,passportId:42,placeId:597,locationId:6,maxParticipants:8,price:500,duration:60,startedAt:'2099-01-05T10:00:00+03:00',status:'published',deletedAt:null,bookingRevision:0,bookingState:'confirmed'};
beforeEach(()=>{
  vi.resetAllMocks();
  vi.mocked(Meets.findById).mockResolvedValue({...meet});
  vi.mocked(Rooms.findByIds).mockResolvedValue([{id:6,placeId:597,capacity:12}] as PlaceLocation[]);
  vi.mocked(Schedule.findByPlaceId).mockResolvedValue([{id:1,placeId:597,weekday:1,enabled:true,startTime:'08:00',endTime:'18:00'}]);
  vi.mocked(Members.findMembership).mockResolvedValue({id:1,role:'admin'});
  vi.mocked(Participants.findParticipants).mockResolvedValue([]);
});
it('cancels a confirmed booking without deleting enrolments or requesting refunds',async()=>{
  await MeetService.cancelBooking(9,42,'Ищем другой зал');
  expect(Meets.update).toHaveBeenCalledWith(9,expect.objectContaining({status:'pending',locationId:null,bookingState:'needs_location',bookingRevision:1}),conn);
  expect(Participants.delete).not.toHaveBeenCalled();
  expect(RefundService.enqueueForMeet).not.toHaveBeenCalled();
  expect(BookingChangeService.announce).toHaveBeenCalled();
});
it('queues refunds only when cancelling the whole meeting',async()=>{
  await MeetService.cancelBooking(9,42,'Встреча не состоится',undefined,true);
  expect(Meets.update).toHaveBeenCalledWith(9,expect.objectContaining({status:'cancelled'}),conn);
  expect(RefundService.enqueueForMeet).toHaveBeenCalledWith(9,undefined,conn);
});
it('rechecks the active centre after taking the lock',async()=>{
  vi.mocked(Meets.findById).mockResolvedValueOnce(meet).mockResolvedValueOnce({...meet,placeId:598});
  await expect(MeetService.cancelBooking(9,50,'Зал недоступен',597)).rejects.toMatchObject({status:403});
  expect(Meets.update).not.toHaveBeenCalled();
});
it('rejects a room belonging to a different destination centre',async()=>{
  vi.mocked(Places.findById).mockResolvedValue({id:598} as Awaited<ReturnType<typeof Places.findById>>);
  await expect(MeetService.update({id:9,placeId:598,locationId:6,reason:'Перенос'},42)).rejects.toMatchObject({status:400});
  expect(Meets.update).not.toHaveBeenCalled();
});
it('does not let an old centre approve a meeting after a concurrent relocation',async()=>{
  vi.mocked(Meets.findById).mockResolvedValueOnce(meet).mockResolvedValueOnce({...meet,placeId:598});
  await expect(MeetService.updateStatus(9,'published',50,597)).rejects.toMatchObject({status:403});
  expect(Meets.update).not.toHaveBeenCalled();
});
it('requires an explanation before cancelling and cannot cancel another teacher meeting',async()=>{
  expect(()=>changeReason(' ')).toThrow();
  await expect(MeetService.cancelBooking(9,77,'Причина')).rejects.toMatchObject({status:403});
  expect(Meets.update).not.toHaveBeenCalled();
});
it('moves a meeting to the destination centre while keeping its identity and enrolments',async()=>{
  vi.mocked(Places.findById).mockResolvedValue({id:598} as Awaited<ReturnType<typeof Places.findById>>);
  vi.mocked(Rooms.findByIds).mockResolvedValue([{id:9,placeId:598,capacity:12}] as PlaceLocation[]);
  await MeetService.update({id:9,placeId:598,locationId:9,reason:'Переезд мастерской'},42);
  expect(Meets.update).toHaveBeenCalledWith(9,expect.objectContaining({placeId:598,locationId:9,status:'pending',bookingState:'requested',bookingRevision:1}),conn);
  expect(Participants.delete).not.toHaveBeenCalled();
  expect(BookingChangeService.announce).toHaveBeenCalledWith(meet,expect.objectContaining({id:9,projectId:3,price:500,maxParticipants:8}),42,'Переезд мастерской',conn);
});
it('rejects private network and lookalike push endpoints',()=>{
  const keys={p256dh:'abc',auth:'xyz'};
  expect(()=>validatePushSubscription({endpoint:'https://127.0.0.1/private',keys})).toThrow();
  expect(()=>validatePushSubscription({endpoint:'https://fcm.googleapis.com.attacker.test/send',keys})).toThrow();
  expect(validatePushSubscription({endpoint:'https://fcm.googleapis.com/send/123',keys}).endpoint).toContain('googleapis.com');
});
