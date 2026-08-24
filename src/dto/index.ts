import type { ProjectDto } from './project.dto.ts';
import type { MeetDto } from './meet.dto.ts';
import type { PlaceDto } from './place.dto.ts';
import type { UserDto } from './user.dto.ts';
import type { IdeaExtendedDto, IdeaDto, IdeaFullDto } from 'dto/idea.dto.ts';
import type { ChatDto } from './chat.dto.ts';
import type { MessageDto } from './message.dto.ts';
import type { PassportDto, PassportExtendedDto } from './passport.dto.ts';
import type { ContextDto } from './context.dto.ts';
import type { TeacherDto } from './teacher.dto.ts';
import type {
  PaymentTargetType,
  PaymentCreateDto,
  PaymentStatus,
  PaymentDto,
  PaymentCreateResponseDto,
} from './payment.dto.ts';

export type Target = 'idea' | 'project' | 'meet';

export type ActiveRole = 'user' | 'teacher' | 'place' | 'guest';

export type Ui = 'auth' | 'map' | 'idea' | 'project' | 'meet' | 'ideas';

export type Role = 'user' | 'assistant' | 'system';

export type Sort = 'nearby' | 'popular' | 'new';

export type When = 'today' | 'tomorrow' | undefined;

export type View = 'module' | 'map' | 'group';


export type MeetStatus = 'pending' | 'published' | 'cancelled';

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

export interface CreateIdea {
  title: string;
  description: string;
}

export interface CreateMeet {
  projectId: number;
  price: number | null;
  duration: number | null;
  startedAt: string;
}

export interface CreateProjectUser {
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

export interface GetProjectsQuery {
  userId?: number;
  sort?: Sort;
  when?: 'today' | 'tomorrow';
  latitude?: number;
  longitude?: number;
}

export interface GetMeetsQuery {
  userId?: number;
  passportId?: number;
  placeId?: number;
  projectId?: number;
}

// FEED system
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

export interface UpdateMeet {
  price: number | null;
  duration: number | null;
  startedAt: string;
  projectId: number;
}

export interface CreatePlace {
  title: string;
  description?: string;
  image?: string;
  address: string;
}
export interface TeacherDashboardDto {
  projects: number;
  meets: number;
  students: number;
  debit: number;

  bmeets: MeetDto[];
}

export interface TeacherPublicDto {
  passport: PassportDto;
  projects: ProjectDto[];
  ideas: IdeaExtendedDto[];

  meets: number;
  students: number;
  centersCount: number; // Add centers count
  centers: PlaceDto[]; // Add list of centers
}

export type PlaceScheduleDayDto = {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export interface PlaceUpdateDto {
  id: number;
  title: string;
  description: string;
  image: string;
  address: string;
  latitude: number;
  longitude: number;
  schedule: PlaceScheduleDayDto[];
}

// Conversation and Message DTOs
export interface Conversation {
  id: number;
  passportId: number;
  createdAt: string;
  participants?: {
    passportId: number;
    userId: number;
  }[];
}

export interface ConversationWithMessage extends Conversation {
  messages?: Message[];
}

export interface Message {
  id: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: number;
}

export interface StartConversationRequest {
  passportId: number;
  targetPassportId?: number;
}

export interface StartConversationResponse {
  exists: boolean;
  conversation: Conversation;
}

export interface CreateMessageRequest {
  content: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface UserDashboardDto {
  projects: ProjectDto[];
}

export interface PlaceDashboardDto {
  place: PlaceDto;
  stats: {
    teachers: number;
    projects: number;
    users: number;
    meets: number;
    pendingPlaceCount: number;
    incoming: number;
  };
}

export interface LocationDto {
  title: string;
}

export interface CreateLocation {
  title: string;
}

export type {
  ProjectDto,
  MeetDto,
  PlaceDto,
  UserDto,
  IdeaDto,
  IdeaExtendedDto,
  IdeaFullDto,
  ChatDto,
  MessageDto,
  PassportDto,
  PassportExtendedDto,
  ContextDto,
  TeacherDto,
  PaymentTargetType,
  PaymentCreateDto,
  PaymentStatus,
  PaymentDto,
  PaymentCreateResponseDto,
};
