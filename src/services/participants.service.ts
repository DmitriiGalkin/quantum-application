import UserRepository from '../repositories/user.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import { HttpError } from '../utils/http-error.js';
import type { MeetUser, User, UserWithMeet } from 'entities';

export class ParticipantsService {
  static async forProjects(projectIds: number[]): Promise<Map<number, User[]>> {
    const joins = await ProjectUserRepository.findByProjectIds(projectIds);
    const users = new Map((await UserRepository.findByIds(joins.map(join => join.userId))).map(user => [user.id, user]));
    const groups = new Map<number, User[]>();
    for (const join of joins) {
      const user = users.get(join.userId);
      if (!user) continue;
      const group = groups.get(join.projectId) ?? [];
      group.push(user);
      groups.set(join.projectId, group);
    }
    return groups;
  }

  static async forMeets(meetIds: number[], preloadedJoins?: MeetUser[]): Promise<Map<number, UserWithMeet[]>> {
    const joins = preloadedJoins ?? await MeetUserRepository.findByMeetIds(meetIds);
    const users = new Map(
      (
        await UserRepository.findByIds(
          joins.map(join => join.userId),
          true,
        )
      ).map(user => [user.id, user]),
    );
    const groups = new Map<number, UserWithMeet[]>();
    for (const join of joins) {
      const user = users.get(join.userId);
      if (!user) continue;
      const group = groups.get(join.meetId) ?? [];
      group.push({ ...user, meetUserId: join.id });
      groups.set(join.meetId, group);
    }
    return groups;
  }

  static async requireOwnUser(passportId: number, userId: number): Promise<User> {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new HttpError('Некорректный ID участника', 400);
    const [user] = await UserRepository.findByIds([userId], true);
    if (!user) throw new HttpError('Участник не найден', 404);
    if (user.passportId !== passportId) throw new HttpError('Нет доступа к участнику', 403);
    return user;
  }
}
