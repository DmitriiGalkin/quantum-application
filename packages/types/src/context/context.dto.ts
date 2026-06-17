import { Ui } from '../types/enums';
import { IdeaDto, MeetDto, PlaceDto, ProjectDto } from '../dto';

export interface ContextDto {
  ui?: Ui;
  place?: PlaceDto;
  meet?: MeetDto;
  ideas?: IdeaDto[];
  project?: ProjectDto;
  idea?: IdeaDto;
}
