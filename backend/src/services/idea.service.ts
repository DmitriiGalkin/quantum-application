import UserRepository from '../models/user.repository.js';
import { IParams } from '@shared/types';
import IdeaRepository from '../models/idea.repository.js';
import IdeaUserRepository from '../models/ideaUser.repository.js';
import PassportRepository from '../models/passport.repository.js';
import ProjectRepository from '../models/project.repository.js';
import PlaceRepository from '../models/place.repository.js';
import { generateProjectImage, uploadImage } from '../assistants/imageAssistant.js';

export class IdeaService {
  static async findAll(params: IParams) {
    const ideas = await IdeaRepository.findAll(params);

    const [users, ideaUsers] = await Promise.all([
      Promise.all(ideas.map(i => UserRepository.findById(i.userId))),
      Promise.all(ideas.map(i => IdeaUserRepository.findByIdeaId(i.id))),
    ]);

    return ideas.map((idea, i) => ({
      ...idea,
      user: users[i],
      ideaUsers: ideaUsers[i],
    }));
  }
  static async findById(id: number) {
    const idea = await IdeaRepository.findById(id);
    if (!idea) return null;

    const [passport, user, projects, ideaUsers] = await Promise.all([
      PassportRepository.findById(idea.passportId || 0),
      UserRepository.findById(idea.userId || 0),
      ProjectRepository.findByIdeaId(idea.id),
      IdeaUserRepository.findByIdeaId(idea.id),
    ]);

    const usersForProjects = await Promise.all(projects.map(p => UserRepository.findByProjectId(p.id)));

    const projectPassports = await Promise.all(projects.map(p => PassportRepository.findById(p.passportId)));

    const projectPlaces = await Promise.all(projects.map(p => PlaceRepository.findById(p.placeId)));

    return {
      ...idea,
      passport,
      user,
      projects: projects.map((project, idx) => ({
        ...project,
        passport: projectPassports[idx],
        place: projectPlaces[idx],
        users: usersForProjects[idx],
      })),
    };
  }

  static async generateProjectImage(projectId: number) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) return null;

    const imageBinary = await generateProjectImage(project);
    const image = await uploadImage(imageBinary);

    await ProjectRepository.update(projectId, { ...project, image });

    return project;
  }
}
