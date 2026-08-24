import type { Target, ContextDto, MessageDto } from 'dto/index.ts';

export interface ChatDto {
  id: number;
  passportId: number;
  target: Target;
  context?: ContextDto;
  messages?: MessageDto[];
}