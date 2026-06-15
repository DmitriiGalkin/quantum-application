import type { Passport } from '../../entities/passport.js';
import { Place } from '../../entities/place.js';
import { Project } from '../../entities/project.js';
import { User } from '../../entities/user.js';
import { Idea } from '../../entities/idea.js';
import { Meet } from '../../entities/meet.js';

export interface Teacher {
  description: string;
}
export interface DraftTeacher {
  description: string;
}
export type DraftUser = {
  title: string;
  description: string;
  age: number;
};
export type DraftIdea = {
  title: string;
  description: string;
  steps: string[];
};
export type DraftProject = {
  ideaId: number;
}
export type DraftMeet = {
  startedAt: string;
  duration: number | null;
  price: number | null;
};

export interface Context {
  user: User | null;
  draftUser: DraftUser | null;
  passport: Passport | null;
  teacher: Teacher | null;
  draftTeacher: DraftTeacher | null;
  idea: Idea | null;
  draftIdea: DraftIdea | null;
  project: Project | null;
  draftProject: DraftProject | null;
  place: Place | null;
  meet: Meet | null;
  draftMeet: DraftMeet | null;
  ui: string;
}
