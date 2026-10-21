import type { PlaceProjectStats, PlaceStatsDto } from 'entities';
import MeetRepository from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import PlaceLocationService from './placeLocation.service.js';
import { HttpError } from '../utils/http-error.js';
import ProjectCampaignRepository from '../repositories/project-campaign.repository.js';
import ProjectCampaignVisitRepository from '../repositories/project-campaign-visit.repository.js';
import ProjectCampaignBookingRepository from '../repositories/project-campaign-booking.repository.js';

export class PlaceStatsService {
  static async get(passportId: number, placeId: number, days: number): Promise<PlaceStatsDto> {
    if (days !== 7 && days !== 30 && days !== 90) throw new HttpError('Период: 7, 30 или 90 дней', 400);
    await PlaceLocationService.requireAdmin(passportId, placeId);
    const start = Date.now() - days * 86400000;
    const meets = (await MeetRepository.findByPlaceIds([placeId])).filter(meet =>
      !meet.deletedAt && meet.status === 'published' && Boolean(meet.startedAt) &&
      new Date(meet.startedAt).getTime() >= start && new Date(meet.startedAt).getTime() < Date.now());
    const [bookings, projects, projectIds] = await Promise.all([
      MeetUserRepository.findByMeetIds(meets.map(meet => meet.id)),
      ProjectRepository.findByIds([...new Set(meets.map(meet => meet.projectId))]),
      ProjectRepository.findIdsByPlaceId(placeId),
    ]);
    const bookingCounts = new Map<number, number>();
    for (const booking of bookings) bookingCounts.set(booking.meetId, (bookingCounts.get(booking.meetId) ?? 0) + 1);
    const projectTitles = new Map(projects.map(project => [project.id, project.title]));
    const projectStats = new Map<number, PlaceProjectStats>();
    for (const meet of meets) {
      const row = projectStats.get(meet.projectId) ?? {
        projectId: meet.projectId, title: projectTitles.get(meet.projectId) ?? 'Проект',
        meets: 0, bookings: 0, knownCapacity: 0, unknownCapacityMeets: 0,
      };
      row.meets++;
      row.bookings += bookingCounts.get(meet.id) ?? 0;
      if (meet.maxParticipants === null) row.unknownCapacityMeets++;
      else row.knownCapacity += meet.maxParticipants;
      projectStats.set(meet.projectId, row);
    }
    const rows = [...projectStats.values()].sort((a, b) => b.bookings - a.bookings || a.title.localeCompare(b.title));
    const campaigns = await ProjectCampaignRepository.findByProjectIds(projectIds);
    const campaignIds = campaigns.map(campaign => campaign.id);
    const [campaignVisits, campaignBookings, allMeets, allProjects] = await Promise.all([
      ProjectCampaignVisitRepository.findByCampaignIds(campaignIds, days),
      ProjectCampaignBookingRepository.findByCampaignIds(campaignIds, days),
      MeetRepository.findByPlaceIds([placeId]),
      ProjectRepository.findByIds(projectIds),
    ]);
    const activeMeetIds = new Set(allMeets.filter(meet => !meet.deletedAt && meet.status === 'published').map(meet => meet.id));
    const campaignMeetUsers = await MeetUserRepository.findByIds(campaignBookings.map(booking => booking.meetUserId));
    const activeBookingIds = new Set(campaignMeetUsers.filter(booking => activeMeetIds.has(booking.meetId)).map(booking => booking.id));
    const allProjectTitles = new Map(allProjects.map(project => [project.id, project.title]));
    return {
      days, meets: meets.length, bookings: bookings.length,
      knownCapacity: rows.reduce((sum, row) => sum + row.knownCapacity, 0),
      unknownCapacityMeets: rows.reduce((sum, row) => sum + row.unknownCapacityMeets, 0),
      projects: rows,
      campaigns: campaigns.map(campaign => ({
        id: campaign.id, projectId: campaign.projectId, projectTitle: allProjectTitles.get(campaign.projectId) ?? 'Проект',
        channel: campaign.channel, initiator: campaign.initiator,
        visits: campaignVisits.filter(visit => visit.campaignId === campaign.id).length,
        bookings: campaignBookings.filter(booking => booking.campaignId === campaign.id && activeBookingIds.has(booking.meetUserId)).length,
      })),
    };
  }
}
