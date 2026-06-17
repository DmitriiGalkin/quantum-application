import { ProjectDto } from '@shared/types';
import { Project, ProjectFullEntity } from '../entities/project.js';
import { ProjectRow } from '../entities/project.db.js';

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ideaId: row.ideaId,
    placeId: row.placeId,
    passportId: row.passportId,
  };
}

export const toProjectDto = (project: ProjectFullEntity): ProjectDto => ({
  id: project.id,
  title: project.title,
  description: project.description,
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
  place: project.place ? {
    title: project.place.title,
    address: project.place.address,
  } : null,
});
