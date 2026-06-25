export type Target = 'idea' | 'project' | 'meet';

export type Ui = 'auth' | 'map' | 'idea' | 'project' | 'meet' | 'ideas';

export type Role = 'user' | 'assistant' | 'system';

export type Sort = 'nearby' | 'popular' | 'new';

export type When = 'today' | 'tomorrow' | undefined;

export type View = 'module' | 'map';

export interface ChatDto {
  id: number;
  passportId: number;
  target: Target;
  context?: ContextDto;
  messages?: MessageDto[];
}

export interface IdeaDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  userCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface IdeaExtendedDto extends IdeaDto {
  user: UserDto;
};

export interface IdeaFullDto extends IdeaDto {
  user: UserDto;
  projects: ProjectExtendedDto[];
}

export interface MeetDto {
  id: number;
  projectId: number;
  startedAt: string;
  duration: number | null;
  price: number | null;
}

export interface MeetExtendedDto extends MeetDto {
  users: UserDto[];
  place: PlaceDto;
}

export interface MeetFullDto extends MeetDto {
  project: ProjectDto | null;
  users: UserDto[];
  place: PlaceDto;
}

export type MessageDto = {
  id: number;
  chatId: number;
  passportId: number | null;
  role: Role;
  content: string;
};

export interface PageMeta {
  title: string;
  description: string;
  // Заголовок страницы при шаринге (до 60 символов)
  ogTitle: string;
  // Краткое описание под заголовком (1–2 строки текста)
  ogDescription: string;
  // Картинка превью (рекомендации: JPG / PNG, 1200×630 px, абсолютный URL)
  ogImage: string;
  // Тип контента
  ogType: string;
  // Название сайта/бренда (Показывается мелким текстом. Не всегда отображается во всех платформах)
  ogSiteName?: string;
}

export interface PassportDto {
  id: number;
  title: string;
  description: string | null;
  image?: string | null;
}

export interface PassportExtendedDto extends PassportDto {
  users: UserDto[];
}

export interface PlaceDto {
  id: number;
  title: string | null;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  priceFrom: number | null;
}

export interface PlaceFullDto extends PlaceDto {
  meets: MeetDto[];
}

export interface ProjectDto {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  ideaId: number | null;
}

export interface ProjectExtendedDto extends ProjectDto {
  passport: PassportDto;
  place: PlaceDto;
  meets: MeetExtendedDto[];
  users: UserDto[];
}

export interface ProjectFullDto extends ProjectDto {
  idea: IdeaDto | null;
  passport: PassportDto;
  place: PlaceDto;
  meets: MeetFullDto[];
  users: UserDto[];
  feeds?: FeedItem[];
}

export interface UserDto {
  id: number;
  title: string;
  description?: string | null;
  age: number | null;
  image: string | null;
}

export interface ContextDto {
  ui?: Ui;
  place?: PlaceDto;
  meet?: MeetFullDto;
  ideas?: IdeaFullDto[];
  project?: ProjectFullDto;
  idea?: IdeaFullDto;
  passport?: PassportDto;
}

// Контракты

export interface CreateChatBody {
  target: Target;
  userId?: number;
  projectId?: number;
  ideaId?: number;
}

export type CreateMessageDto = {
  role: Role;
  content: string;
  context?: ContextDto;
};

export interface CreateChatMessages {
  chatId: number;
  messages: CreateMessageDto[];
  ui?: string;
}

export interface ChatMessagesResult {
  message: MessageDto;
  context?: ContextDto;
}

export interface CreateIdeaUser {
  ideaId: number;
  userId: number;
}
export interface DeleteIdeaUser {
  ideaId: number;
  userId: number;
}

export interface CreateProject {
  title: string;
  description: string;
  image: string;
  ideaId?: number;
  placeId: number;
}

export interface CreateMeet {
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
  placeId: number;
}

export interface CreateProjectUser {
  projectId: number;
  userId: number;
}
export interface DeleteProjectUser {
  projectId: number;
  userId: number;
}

export interface CreateMeetUser {
  meetId: number;
  userId: number;
}
export interface DeleteMeetUser {
  meetId: number;
  userId: number;
}


export interface CreateMessage {
  chatId: number;
  message: string;
  target?: Target;
}

export interface GetIdeasQuery {
  userId?: number;
  sort?: Sort;
  when?: 'today' | 'tomorrow';
  latitude?: number;
  longitude?: number;
}

// FEED system
export type FeedItem =
  | FeedMeet
  | FeedComment
  | FeedJoin
  | FeedLike;

interface BaseFeed {
  id: number;
  createdAt: string;
  user?: UserDto;
}

export interface FeedMeet extends BaseFeed {
  type: 'meet';
  meet: MeetExtendedDto;
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