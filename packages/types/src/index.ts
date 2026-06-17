import { PlaceDto } from './dto/place.dto';
import { MeetDto } from './dto/meet.dto';
import { IdeaDto } from './dto/idea.dto';
import { ProjectDto } from './dto/project.dto';
import { MessageDto } from './dto/message.dto';
import { Role, Target, Ui } from './types/enums';


export interface ContextDto {
  ui?: Ui;
  place?: PlaceDto;
  meet?: MeetDto;
  ideas?: IdeaDto[];
  project?: ProjectDto;
  idea?: IdeaDto;
}

export interface ChatMessagesResult {
  message: MessageDto;
  context?: ContextDto;
}

// КОНТРАКТЫ
export interface CreateChat {
  chatId: number;
  target: Target;
}
export interface CreateChatBody {
  target: Target;
  userId?: number;
  projectId?: number;
  ideaId?: number;
}
export interface CreateIdeaUser {
  ideaId: number;
  userId: number;
}
export interface DeleteIdeaUser {
  ideaId: number;
  userId: number;
}
export interface CreateMeetUser {
  meetId: number;
  userId: number;
}
export interface CreateMessage {
  chatId: number;
  message: string;
  target?: Target;
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

export type DraftProject = {
  id: number;
  title: string;
};

export * from './dto/idea.dto';
export * from './dto/project.dto';
export * from './dto/chat.dto';
export * from './types/enums';
