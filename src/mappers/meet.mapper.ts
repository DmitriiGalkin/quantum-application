import type { Meet, MeetWithProjectTitle, MeetRow, MeetWithProjectTitleRow } from 'entities';

export function toMeet(row: MeetRow): Meet {
  return {
    bookingState: row.bookingState,
    bookingRevision: row.bookingRevision,
    locationId: row.locationId ?? null,
    maxParticipants: row.maxParticipants ?? null,
    id: row.id,
    projectId: row.projectId,
    passportId: row.passportId,
    price: row.price,
    duration: row.duration,
    startedAt: new Date(row.startedAt).toISOString(),
    deletedAt: row.deletedAt,
    placeId: row.placeId,
    status: row.status,
  };
}

export function mapMeetWithProjectTitle(row: MeetWithProjectTitleRow): MeetWithProjectTitle {
  return {
    ...toMeet(row),
    title: row.title,
  };
}
