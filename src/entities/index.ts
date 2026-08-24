import type { ProjectDto } from './project.dto.ts';
import type { MeetDto } from './meet.dto.ts';
import type { PlaceDto } from './place.dto.ts';
import type { UserDto } from './user.dto.ts';
import type { IdeaDto, IdeaExtendedDto, IdeaFullDto } from './idea.dto.ts';
import type { MessageDto } from './message.dto.ts';
import type { PassportDto, PassportExtendedDto } from './passport.dto.ts';
import type { ContextDto } from './context.dto.ts';
import type { TeacherDto } from './teacher.dto.ts';
import type { PaymentCreateDto, PaymentCreateResponseDto, PaymentDto, PaymentTargetType } from './payment.dto.ts';


export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'cancelled';

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
  MessageDto,
  PassportDto,
  PassportExtendedDto,
  ContextDto,
  TeacherDto,
  PaymentTargetType,
  PaymentCreateDto,
  PaymentDto,
  PaymentCreateResponseDto,
};

// Conversation
export type { ConversationPassportRow } from './conversation-passport.db.js';
export type { ConversationRow } from './conversation.db.js';

// Idea
export type { IdeaUserRow } from './idea-user.db.js';
export type { IdeaUser } from './idea-user.js';
export type { CreateIdeaUserInput } from './idea-user.types.js';
export type { IdeaAssistant } from './idea.assistant.js';
export type { IdeaRow, IdeaWithLikeRow } from './idea.db.js';
export type { Idea, IdeaWithLike, CreateIdeaInput, UpdateIdeaInput, FindAllIdeaInput, IdeaExtendedEntity, IdeaFullEntity } from './idea.js';

// Meet
export type { MeetUserRow, MeetUserWithMeetRow, MeetUserFullRow } from './meet-user.db.js';
export type { MeetUser, MeetUserWithMeet } from './meet-user.js';
export type { MeetUserFull } from './meet-user.view.js';
export type { MeetAssistant } from './meet.assistant.js';
export type { MeetRow, MeetWithProjectTitleRow } from './meet.db.js';
export type { Meet, MeetWithProjectTitle } from './meet.js';
export type { CreateMeetInput, UpdateMeetInput } from './meet.types.js';

// Message
export type { MessageRow } from './message.db.js';
//export type { Message } from './message.js';
export type { CreateMessageInput } from './message.types.js';
export type { Message2Row } from './message2.db.js';

// Passport
export type { PassportRow } from './passport.db.js';
export type { Passport, PassportExtendedEntity } from './passport.js';
export type { CreatePassportInput, UpdatePassportInput } from './passport.types.js';



// Payment
export type { PaymentRow } from './payment.db.js';
export type { PaymentProvider, Payment, CreatePaymentInput } from './payment.types.js';

// Place
export type { PlacePassportRole, PlacePassportRow } from './place-passport.db.js';
export type { PlaceSchedule } from './place-schedule.db.js';
export type { PlaceRow } from './place.db.js';
export type { Place, CreatePlaceInput, UpdatePlaceInput } from './place.js';

// Project
export type { ProjectUserRow } from './project-user.db.js';
export type { ProjectUser } from './project-user.js';
export type { CreateProjectUserInput } from './project-user.types.js';
export type { ProjectAssistant } from './project.assistant.js';
export type { ProjectRow } from './project.db.js';
export type { Project, FindAllProjectInput } from './project.js';
export type { CreateProjectInput } from './project.types.js';

// Teacher
export type { TeacherUserRow } from './teacher-user.db.js';
export type { TeacherUser } from './teacher-user.js';
export type { TeacherAssistant } from './teacher.assistant.js';

// User
export type { UserAssistant } from './user.assistant.js';
export type { UserRow, UserWithMeetRow } from './user.db.js';
export type { User, UserWithMeet } from './user.js';
export type { CreateUserInput, UpdateUserInput } from './user.types.js';