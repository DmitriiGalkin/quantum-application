import type { ActiveRole } from '../../../../providers/AuthProvider.tsx';

export type UserRole = 'student' | 'teacher' | 'guest' | 'place';

export type MeetingStatus = 'today' | 'upcoming' | 'completed' | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'not_required';

export interface Meeting {
  id: string;

  title: string;

  teacherName: string;
  teacherAvatar?: string;

  date: string;
  time: string;
  duration: string;

  location: string;

  status: MeetingStatus;

  enrolled: number;
  capacity: number;

  paymentStatus?: PaymentStatus;
}

export interface MeetingCardProps {
  role: ActiveRole;
  meeting: Meeting;

  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}
