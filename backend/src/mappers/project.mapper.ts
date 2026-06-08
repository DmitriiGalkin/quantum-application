import { ProjectDto } from '@shared/types';

export const toProjectDto = (project: any): ProjectDto => ({
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
  passportId: project.passportId,
  placeId: project.placeId,
  ideaId: project.ideaId,
});
