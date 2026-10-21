import { randomUUID } from 'node:crypto';
import type { ProjectCampaign } from 'entities';
import ProjectRepository from '../repositories/project.repository.js';
import ProjectCampaignRepository from '../repositories/project-campaign.repository.js';
import ProjectCampaignVisitRepository from '../repositories/project-campaign-visit.repository.js';
import ProjectCampaignBookingRepository from '../repositories/project-campaign-booking.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import PlaceLocationService from './placeLocation.service.js';
import { HttpError } from '../utils/http-error.js';

export class ProjectCampaignService {
  static validVisitorId(value: unknown): value is string {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  static async requireProjectAccess(projectId: number, passportId: number): Promise<{ placeId: number; initiator: 'teacher' | 'place' }> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new HttpError('Проект не найден', 404);
    if (project.passportId === passportId) return { placeId: project.placeId, initiator: 'teacher' };
    await PlaceLocationService.requireAdmin(passportId, project.placeId);
    return { placeId: project.placeId, initiator: 'place' };
  }

  static async create(projectId: number, passportId: number, channel: unknown): Promise<number> {
    if (typeof channel !== 'string' || !channel.trim() || channel.trim().length > 120) throw new HttpError('Укажите название канала (до 120 символов)', 400);
    const { initiator } = await this.requireProjectAccess(projectId, passportId);
    return ProjectCampaignRepository.create(projectId, passportId, initiator, channel.trim(), randomUUID());
  }

  static async visit(token: unknown, projectId: number, visitorId: unknown): Promise<void> {
    if (typeof token !== 'string' || !this.validVisitorId(visitorId)) throw new HttpError('Некорректная ссылка кампании', 400);
    const campaign = await ProjectCampaignRepository.findByToken(token);
    if (!campaign || campaign.projectId !== projectId) throw new HttpError('Кампания не найдена', 404);
    await ProjectCampaignVisitRepository.record(campaign.id, visitorId);
  }

  static async list(projectId: number, passportId: number, days?: number): Promise<ProjectCampaign[]> {
    const { placeId } = await this.requireProjectAccess(projectId, passportId);
    const campaigns = await ProjectCampaignRepository.findByProjectIds([projectId]);
    const ids = campaigns.map(campaign => campaign.id);
    const [visits, bookings, meets] = await Promise.all([
      ProjectCampaignVisitRepository.findByCampaignIds(ids, days),
      ProjectCampaignBookingRepository.findByCampaignIds(ids, days),
      MeetRepository.findByPlaceIds([placeId]),
    ]);
    const activeMeetIds = new Set(meets.filter(meet => meet.projectId === projectId && !meet.deletedAt && meet.status === 'published').map(meet => meet.id));
    const activeBookings = await MeetUserRepository.findByIds(bookings.map(booking => booking.meetUserId));
    const activeBookingIds = new Set(activeBookings.filter(booking => activeMeetIds.has(booking.meetId)).map(booking => booking.id));
    return campaigns.map(campaign => ({
      id: campaign.id, projectId: campaign.projectId, creatorPassportId: campaign.creatorPassportId,
      initiator: campaign.initiator, channel: campaign.channel, token: campaign.token, createdAt: campaign.createdAt,
      visits: visits.filter(visit => visit.campaignId === campaign.id).length,
      bookings: bookings.filter(booking => booking.campaignId === campaign.id && activeBookingIds.has(booking.meetUserId)).length,
    }));
  }
}
