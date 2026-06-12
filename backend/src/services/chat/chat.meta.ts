import type { Passport } from '../../entities/passport.js';
import { Place } from '../../entities/place.js';
import { Project } from '../../entities/project.js';

export interface TeacherDraft {
  description: string;
}
export type UserDraft = {
  title: string;
  description: string;
  age: number;
};
export type IdeaDraft = {
  title: string;
  description: string;
  steps: string[];
};
export type ProjectDraft = {
  ideaId: number;
}
export type MeetDraft = {
  startedAt: string;
  duration: number;
};

export interface Context {
  user: UserDraft | null;
  passport: Passport | null;
  teacher: TeacherDraft | null;
  idea: IdeaDraft | null;
  project: ProjectDraft | Project | null;
  place: Place | null;
  meet: MeetDraft | null;
}
