import type { User, UserDto } from 'entities';
import UserRepository from '../repositories/user.repository.js';
import TeacherUserRepository from '../repositories/teacher-user.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import PlaceTeacherService from './placeTeacher.service.js';
import { HttpError } from '../utils/http-error.js';
import { ConversationService } from './conversation.service.js';

export function publicStudent({ id, title, description, age, image }: User): UserDto {
  return { id, title, description, age, image };
}

export class StudentAccessService {
  static async forPlace(placeId: number): Promise<UserDto[]> {
    const meets = await MeetRepository.findPublishedByPlaceId(placeId);
    const joins = await MeetUserRepository.findByMeetIds(meets.map(meet => meet.id));
    const users = await UserRepository.findByIds([...new Set(joins.map(join => join.userId))], true);
    return users.map(publicStudent);
  }

  static async forTeacher(passportId: number): Promise<User[]> {
    const [direct, projects, meets] = await Promise.all([
      TeacherUserRepository.findByTeacherId(passportId),
      ProjectRepository.findAll({ passportId }),
      MeetRepository.findActiveByTeacherId(passportId),
    ]);
    const [projectUsers, meetUsers] = await Promise.all([
      ProjectUserRepository.findByProjectIds(projects.map(project => project.id)),
      MeetUserRepository.findByMeetIds(meets.map(meet => meet.id)),
    ]);
    return UserRepository.findByIds([...new Set([...direct, ...projectUsers, ...meetUsers].map(join => join.userId))], true);
  }

  static async parentConversation(passportId: number, userId: number, placeId?: number) {
    const [user] = await UserRepository.findByIds([userId], true);
    if (!user) throw new HttpError('Ученик не найден', 404);
    let allowed: boolean;
    if (placeId !== undefined) {
      await PlaceTeacherService.requireAdmin(passportId, placeId);
      allowed = (await this.forPlace(placeId)).some(student => student.id === userId);
    } else {
      allowed = (await this.forTeacher(passportId)).some(student => student.id === userId);
    }
    if (!allowed) throw new HttpError('Нет доступа к контакту семьи', 403);
    if (user.passportId === passportId) throw new HttpError('Это ваш аккаунт', 400);
    return ConversationService.startConversation({ passportId, targetPassportId: user.passportId });
  }
}
