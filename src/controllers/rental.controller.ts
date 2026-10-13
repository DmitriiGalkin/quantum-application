import type { BusyInterval, CreateRental, RentalDto, RentalStatus } from 'entities';
import { type Controller, type ControllerWithAuth, ok } from './helper.js';
import { requireId } from '../utils/validation.js';
import { RentalService } from '../services/rental.service.js';

const create: ControllerWithAuth<number, CreateRental> = async (req, res) => {
  ok(res, await RentalService.create(req.passport.id, req.body));
};
const mine: ControllerWithAuth<RentalDto[]> = async (req, res) => {
  ok(res, await RentalService.list(req.passport.id));
};
const centre: ControllerWithAuth<RentalDto[]> = async (req, res) => {
  ok(res, await RentalService.list(req.passport.id, requireId(req.viewer?.placeId, 'центра')));
};
const status: ControllerWithAuth<void, { status: RentalStatus; reason?: string }> = async (req, res) => {
  await RentalService.changeStatus(requireId(req.params.id, 'заявки'), req.passport.id, req.body?.status, req.body?.reason, req.viewer?.placeId);
  ok(res);
};
const busy: Controller<BusyInterval[]> = async (req, res) => {
  ok(res, await RentalService.busy(requireId(req.params.id, 'зала'), req.query.date));
};
export default { create, mine, centre, status, busy };
