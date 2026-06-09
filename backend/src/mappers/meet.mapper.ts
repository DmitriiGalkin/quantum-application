import type { MeetDto } from '@shared/types';
import { Meet, MeetWithProjectTitle } from '../entities/meet.js';
import { MeetRow, MeetWithProjectTitleRow } from '../entities/meet.db.js';

export function mapMeetRow(row: MeetRow): Meet {
  return {
    id: row.id,
    projectId: row.projectId,
    price: row.price,
    duration: row.duration,
    startedAt: row.startedAt,
    placeId: row.placeId,
  };
}

export function mapMeetWithProjectTitle(row: MeetWithProjectTitleRow): MeetWithProjectTitle {
  return {
    ...mapMeetRow(row),
    title: row.title,
  };
}

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
