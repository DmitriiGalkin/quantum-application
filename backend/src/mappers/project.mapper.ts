import { ProjectDto } from '@shared/types';
import { Project, ProjectFullEntity } from '../entities/project.js';
import { ProjectRow } from '../entities/project.db.js';

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    ideaId: row.ideaId,
    placeId: row.placeId,
    passportId: row.passportId,
  };
}

export const toProjectDto = (project: ProjectFullEntity): ProjectDto => ({
  id: project.id,
  idea: project.idea ? {
    id: project.idea.id,
    title: project.idea.title,
    description: project.idea.description,
    image: project.idea.image,
  } : null,
  users: project.users.map((u: any) => ({
    id: u.id,
    title: u.title,
    age: u.age,
    image: u.image,
  })),
  passport: {
    title: project.passport.title,
    image: project.passport.image,
  },
  place: project.place
    ? {
        title: project.place.title,
        address: project.place.address,
        description: project.place.description,
      }
    : null,
  meets: project.meets.map(u => ({
    id: u.id,
    startedAt: u.startedAt,
    duration: u.duration,
    price: u.price,
  })),
});
