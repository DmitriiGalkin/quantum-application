import { Target } from '../types/enums';

export interface CreateMessage {
  chatId: number;
  message: string;
  target?: Target;
}
