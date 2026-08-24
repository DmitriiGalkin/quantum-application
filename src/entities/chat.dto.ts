import type { ContextDto, MessageDto, Target } from 'entities';

export interface ChatDto {
  id: number;
  passportId: number;
  target: Target;
  context?: ContextDto;
  messages?: MessageDto[];
}