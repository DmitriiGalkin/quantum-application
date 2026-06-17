import { Role, Target } from '../types/enums';
import { ContextDto } from '../context/context.dto';
import { MessageDto } from '../dto';

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