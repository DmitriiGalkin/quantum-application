import { User } from '../entities/user.js';

import { ProjectUser } from '../entities/project-user.js';
import { FeedItem, MeetExtendedDto } from 'types';

interface Join extends ProjectUser {
  user: User
}

interface MergeFeed {
  meets: MeetExtendedDto[];
  comments: any[];
  joins: Join[];
}

export class FeedService {
  static merge({ meets, comments, joins }: MergeFeed): FeedItem[] {
    const feed = [
      ...meets.map(meet => ({
        id: 'meet' + meet.id,
        type: 'meet' as const,
        createdAt: meet.startedAt,
        meet: meet,
      })),
      ...comments.map(c => ({
        id: 'comment' + c.id,
        type: 'comment' as const,
        createdAt: c.createdAt,
        comment: c,
      })),
      ...joins.map(j => ({
        id: 'join'+j.id,
        type: 'join' as const,
        createdAt: j.createdAt,
        user: j.user,
      })),
    ];

    feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return feed;
  }
}