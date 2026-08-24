import type { Ui } from 'dto/index.ts';
import type { PlaceDto } from 'dto/place.dto.ts';
import type { MeetDto } from 'dto/meet.dto.ts';
import type { IdeaFullDto } from 'dto/idea.dto.ts';
import type { ProjectDto } from 'dto/project.dto.ts';
import type { PassportDto } from 'dto/passport.dto.ts';

export interface ContextDto {
  ui?: Ui;
  place?: PlaceDto;
  meet?: MeetDto;
  ideas?: IdeaFullDto[];
  project?: ProjectDto;
  idea?: IdeaFullDto;
  passport?: PassportDto;
}