import { UserDto } from './user.dto';

export interface PassportDto {
  id: number;
  title: string;
  description: string | null;
}

export interface PassportFullDto extends PassportDto{
  users: UserDto[];
}
