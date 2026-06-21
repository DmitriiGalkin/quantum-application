import type { ProjectFullDto } from '@shared/types';
import type { Project, ProjectFullEntity } from '../entities/project.js';
import type { ProjectRow } from '../entities/project.db.js';

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    ideaId: row.ideaId,
    placeId: row.placeId,
    passportId: row.passportId,
  };
}

export const toProjectFullDto = (project: ProjectFullEntity): ProjectFullDto => ({
  id: project.id,
  idea: {
    id: project.idea.id,
    title: project.idea.title,
    description: project.idea.description,
    image: project.idea.image,
    userCount: project.idea.userCount,
  },
  users: project.users.map((u: any) => ({
    id: u.id,
    title: u.title,
    age: u.age,
    image: u.image,
  })),
  passport: {
    id: project.passport.id,
    title: project.passport.title,
    description: project.passport.description,
    image: project.passport.image,
  },
  place: {
    id: project.place.id,
    title: project.place.title,
    address: project.place.address,
    description: project.place.description,
    latitude: project.place.latitude,
    longitude: project.place.longitude,
    priceFrom: project.place.priceFrom,
  },
  meets: project.meets.map(u => ({
    id: u.id,
    projectId: u.projectId,
    startedAt: u.startedAt,
    duration: u.duration,
    price: u.price,
    users: u.users,
    project: u.project,
  })),
  feeds: project.feeds,
});
