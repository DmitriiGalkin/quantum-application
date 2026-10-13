import type { Passport, PassportDto, PlaceProfile } from 'entities';
import PlaceRepository from '../repositories/place.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import PlaceLocationService from './placeLocation.service.js';
import { HttpError } from '../utils/http-error.js';

export const publicTeacher = (passport: Passport): PassportDto => ({ id: passport.id, title: passport.title,
  description: passport.description, image: passport.image });

export class PlaceProfileService {
  static async find(id: number): Promise<PlaceProfile> {
    const place = await PlaceRepository.findById(id);
    if (!place) throw new HttpError('Центр не найден', 404);
    const [schedule, rooms, members, meets] = await Promise.all([
      PlaceScheduleRepository.findByPlaceId(id), PlaceLocationService.findAll(id),
      PlacePassportRepository.members(id), MeetRepository.publicUpcoming(id),
    ]);
    const [passports, projects, participants, teacherFlags] = await Promise.all([
      PassportRepository.findByIds([...members.map(member => member.passportId), ...meets.map(meet => meet.passportId)]),
      ProjectRepository.findAll({ placeId: id }),
      MeetUserRepository.findByMeetIds(meets.map(meet => meet.id)),
      Promise.all(members.map(async member => ({ ...member,
        teacher: member.role === 'teacher' || await ProjectRepository.hasProjects(member.passportId) }))),
    ]);
    const teachers = new Set(teacherFlags.filter(member => member.teacher).map(member => member.passportId));
    return {
      place: { id: place.id, title: place.title, description: place.description, image: place.image,
        address: place.address, latitude: place.latitude, longitude: place.longitude, phone: place.phone, priceFrom: place.priceFrom },
      schedule: schedule.map(day => ({ weekday: day.weekday, enabled: Boolean(day.enabled), startTime: day.startTime, endTime: day.endTime })),
      rooms, teachers: passports.filter(passport => teachers.has(passport.id)).map(publicTeacher),
      meets: meets.flatMap(meet => {
        const teacher = passports.find(passport => passport.id === meet.passportId);
        const project = projects.find(project => project.id === meet.projectId);
        if (!teacher || !project) return [];
        return [{ id: meet.id, projectId: meet.projectId, projectTitle: project.title, teacher: publicTeacher(teacher),
          locationTitle: rooms.find(room => room.id === meet.locationId)?.title ?? null,
          startedAt: meet.startedAt, duration: meet.duration, price: meet.price,
          availableSeats: meet.maxParticipants === null ? null : Math.max(0, meet.maxParticipants - participants.filter(row => row.meetId === meet.id).length) }];
      }),
    };
  }

  static async meta(id: number) {
    const place = await PlaceRepository.findById(id);
    if (!place) throw new HttpError('Центр не найден', 404);
    const title = place.title ?? 'Образовательный центр';
    const description = place.description ?? place.address;
    return { title: `${title} | Quantum`, description, ogTitle: title, ogDescription: description,
      ogImage: place.image ?? '', ogType: 'website', ogSiteName: 'Quantum' };
  }
}
