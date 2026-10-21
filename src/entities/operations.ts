export interface AppNotification {
  id: number;
  passportId: number;
  title: string;
  body: string;
  url: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  nextCursor: number | null;
}

export interface MessageReceipt {
  passportId: number;
  lastDeliveredMessageId: number | null;
  lastReadMessageId: number | null;
}

export interface BookingChange {
  id: number;
  meetId: number;
  revision: number;
  oldPlaceId: number;
  oldLocationId: number | null;
  newPlaceId: number;
  newLocationId: number | null;
  reason: string;
  actorPassportId: number;
  createdAt: string;
}

export interface RefundOperation {
  id: number;
  paymentId: number;
  status: 'queued' | 'submitting' | 'processing' | 'finished' | 'failed' | 'uncertain';
  requestId: string | null;
  error: string | null;
}
