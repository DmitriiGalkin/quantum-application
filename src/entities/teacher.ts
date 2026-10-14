import type { ProjectDto, MeetDto, PassportDto, IdeaDto, PlaceDto } from 'entities';

export type TeacherDto = {
  id: number;
  title: string;
  image?: string | null;
  description?: string | null;
  projectCount?: number;
};

export interface TeacherDashboardDto {
  projects: number;
  meets: number;
  students: number;
  debit: number | null;

  bmeets: MeetDto[];
}

export interface TeacherPublicDto {
  passport: PassportDto;
  projects: ProjectDto[];
  ideas: IdeaDto[];

  meets: number;
  students: number;
  centersCount: number; // Add centers count
  centers: PlaceDto[]; // Add list of centers
}
