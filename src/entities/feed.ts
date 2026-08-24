// FEED system
import type { UserDto } from 'entities/user.ts';
import type { MeetDto } from 'entities/meet.ts';

export type FeedItem = FeedMeet | FeedComment | FeedJoin | FeedLike;

interface BaseFeed {
  id: string;
  createdAt: string;
  user?: UserDto;
}

export interface FeedMeet extends BaseFeed {
  type: 'meet';
  meet: MeetDto;
}

export interface FeedComment extends BaseFeed {
  type: 'comment';
  comment: {
    id: number;
    text: string;
  };
}

export interface FeedJoin extends BaseFeed {
  type: 'join';
}

export interface FeedLike extends BaseFeed {
  type: 'like';
}
