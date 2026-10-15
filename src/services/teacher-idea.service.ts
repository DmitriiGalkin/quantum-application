import type { TeacherStudentIdeaDto } from 'entities';
import IdeaRepository from '../repositories/idea.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import { StudentAccessService, publicStudent } from './student-access.service.js';

export class TeacherIdeaService {
  static async findIdeasByTeacher(passportId: number): Promise<TeacherStudentIdeaDto[]> {
    const students = await StudentAccessService.forTeacher(passportId);
    const ideas = await IdeaRepository.findByUserIds(students.map(user => user.id));
    const projects = await ProjectRepository.findByIdeaIds(ideas.map(idea => idea.id));
    const [projectUsers, allMeets] = await Promise.all([
      ProjectUserRepository.findByProjectIds(projects.map(project => project.id)),
      MeetRepository.findByProjectIds(projects.map(project => project.id)),
    ]);
    const meets = allMeets.filter(meet => !meet.deletedAt && meet.status === 'published');
    const meetUsers = await MeetUserRepository.findByMeetIds(meets.map(meet => meet.id));
    const users = new Map(students.map(user => [user.id, user]));
    return ideas.flatMap(idea => {
      const user = users.get(idea.userId);
      if (!user) return [];
      return [{ id: idea.id, title: idea.title, description: idea.description, image: idea.image,
        createdAt: idea.createdAt, user: publicStudent(user), canContactParent: user.passportId !== passportId,
        projects: projects.filter(project => project.ideaId === idea.id).map(project => ({
          id: project.id, title: project.title,
          enrolledInProject: projectUsers.some(join => join.projectId === project.id && join.userId === user.id),
          enrolledInMeets: meetUsers.some(join => join.userId === user.id && meets.some(meet => meet.id === join.meetId && meet.projectId === project.id)),
        })),
      }];
    });
  }
}
