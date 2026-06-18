import { IdeaExtendedEntity } from '../entities/idea.js';
import { Meet, MeetExtendedEntity } from '../entities/meet.js';
import { User } from '../entities/user.js';

import { ProjectUser } from '../entities/project-user.js';
import { FeedItem } from '@shared/types';
import { toMeetDto, toMeetExtendedDto } from '../mappers/meet.mapper.js';

interface Join extends ProjectUser {
  user: User
}

interface MergeFeed {
  meets: MeetExtendedEntity[];
  comments: any[];
  joins: Join[];
}

export class FeedService {
  static merge({ meets, comments, joins }: MergeFeed): FeedItem[] {
    const feed = [
      ...meets.map(m => ({
        type: 'meet' as const,
        createdAt: m.startedAt,
        meet: toMeetExtendedDto(m),
      })),
      ...comments.map(c => ({
        type: 'comment' as const,
        createdAt: c.createdAt,
        comment: c,
      })),
      ...joins.map(j => ({
        type: 'join' as const,
        createdAt: j.createdAt,
        user: j.user,
      })),
    ];

    console.log(feed);

    feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return feed;
  }
}