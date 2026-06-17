import { ContextDto, Target } from '../index';
import { MessageDto } from './message.dto';

export interface ChatDto {
  id: number;
  passportId: number;
  target: Target;
  context?: ContextDto;
  messages?: MessageDto[];
}