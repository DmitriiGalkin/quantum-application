import { MeetUser, MeetUserWithMeet } from '../entities/meet-user.js';
import { MeetUserFullRow, MeetUserRow, MeetUserWithMeetRow } from '../entities/meet-user.db.js';
import { MeetUserFull } from '../entities/meet-user.view.js';

export function mapMeetUserRow(row: MeetUserRow): MeetUser {
  return {
    id: row.id,
    userId: row.userId,
    meetId: row.meetId,
  };
}

export function mapMeetUserWithMeetRow(row: MeetUserWithMeetRow): MeetUserWithMeet {
  return {
    ...mapMeetUserRow(row),
    startedAt: row.startedAt,
  };
}

// 🔥 сложный mapper (вынесли из repository)
export function mapMeetUserFullRow(row: MeetUserFullRow): MeetUserFull {
  return {
    id: row.id,
    userId: row.userId,
    meetId: row.meetId,

    meet: row.meetIdJoin
      ? {
          id: row.meetIdJoin,
          startedAt: row.meetStartedAt,

          project: row.projectIdJoin
            ? {
                id: row.projectIdJoin,
                title: row.projectTitle,

                place: row.placeIdJoin
                  ? {
                      id: row.placeIdJoin,
                      title: row.placeTitle,
                      latitude: row.latitude,
                      longitude: row.longitude,
                    }
                  : null,
              }
            : null,
        }
      : null,
  };
}
