import type { CreateProjectCampaign, ProjectCampaign } from 'entities';
import { type Controller, type ControllerWithAuth, ok } from './helper.js';
import { requireId } from '../utils/validation.js';
import { ProjectCampaignService } from '../services/project-campaign.service.js';

const create: ControllerWithAuth<number, CreateProjectCampaign> = async (req, res) => {
  ok(res, await ProjectCampaignService.create(requireId(req.body?.projectId), req.passport.id, req.body?.channel));
};
const list: ControllerWithAuth<ProjectCampaign[]> = async (req, res) => {
  ok(res, await ProjectCampaignService.list(requireId(req.params.projectId), req.passport.id));
};
const visit: Controller<void, { token: string; projectId: number; visitorId: string }> = async (req, res) => {
  await ProjectCampaignService.visit(req.body?.token, requireId(req.body?.projectId), req.body?.visitorId);
  ok(res, { message: 'Переход учтён' });
};
export default { create, list, visit };
