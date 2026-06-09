export interface Chat {
  id: number;
  passportId: number;
  title: string | null;
  target: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatWithLastMessage extends Chat {
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageRole: string | null;
}

export interface CreateChatInput {
  passportId: number;
  title?: string | null;
  target?: string | null;
}