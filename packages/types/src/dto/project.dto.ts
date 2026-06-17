import { IdeaDto } from './idea.dto';
import { MeetDto } from './meet.dto';
import { UserDto } from './user.dto';
import { PlaceDto } from './place.dto';
import { PassportDto } from './passport.dto';

export interface ProjectDto {
  id: number;
}

export interface ProjectFullDto extends ProjectDto {
  idea: IdeaDto;
  passport: PassportDto | null;
  place: PlaceDto | null;
  meets?: MeetDto[];
  users?: UserDto[];
}
