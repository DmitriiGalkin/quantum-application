import type { ActiveRole } from '../../../../providers/AuthProvider.tsx';

export type UserRole = 'student' | 'teacher' | 'guest' | 'place';

export type MeetUserStatus = 'member' | 'not_member'

export type MeetingStatus = 'upcoming' | 'completed' | 'cancelled';

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
  meetUserStatus: MeetUserStatus;

  enrolled: number;
  capacity: number;

  paymentStatus?: PaymentStatus;

  price: number | null;
  isDel: boolean;
}

export interface MeetingCardProps {
  role: ActiveRole;
  meeting: Meeting;

  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}
