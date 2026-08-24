import type { Ui } from 'entities';
import type { PlaceDto } from './place.dto.ts';
import type { MeetDto } from './meet.dto.ts';
import type { IdeaFullDto } from './idea.dto.ts';
import type { ProjectDto } from './project.dto.ts';
import type { PassportDto } from './passport.dto.ts';

export interface ContextDto {
  ui?: Ui;
  place?: PlaceDto;
  meet?: MeetDto;
  ideas?: IdeaFullDto[];
  project?: ProjectDto;
  idea?: IdeaFullDto;
  passport?: PassportDto;
}