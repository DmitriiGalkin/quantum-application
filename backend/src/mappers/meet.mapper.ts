import type { MeetDto } from '@shared/types';

export const toMeetDto = (meet: any): MeetDto => {
  return {
    ...meet,
    project: meet.project
      ? {
          id: meet.project.id,
          title: meet.project.title,
          place: meet.project.place ?? null,
        }
      : null,
    meetUsers: meet.meetUsers ?? [],
  };
};
