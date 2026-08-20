import type { Passport } from '../../entities/passport.js';
import type { Place } from '../../entities/place.js';
import type { Project } from '../../entities/project.js';
import type { User } from '../../entities/user.js';
import type { Idea, IdeaExtendedEntity } from '../../entities/idea.js';
import type { Meet } from '../../entities/meet.js';
import type { IdeaExtendedDto, Ui } from 'dto';

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

export type DraftMeet = {
  startedAt: string;
  duration: number | null;
  price: number | null;
};

export interface Context {
  user?: User;
  draftUser?: DraftUser;
  passport?: Passport;
  teacher?: Teacher;
  draftTeacher?: DraftTeacher;
  ideas?: Idea[];
  idea?: IdeaExtendedEntity | IdeaExtendedDto;
  draftIdea?: DraftIdea;
  project?: Project;
  //draftProject?: DraftProject;
  place?: Place;
  meet?: Meet;
  draftMeet?: DraftMeet;
  ui?: Ui;
}
